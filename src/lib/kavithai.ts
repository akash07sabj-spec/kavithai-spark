import { supabase } from "@/integrations/supabase/client";

export type FeedKavithai = {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
  author_id: string;
  background_url: string | null;
  text_color: string | null;
  author: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
};

export async function fetchFeed(currentUserId: string | null): Promise<FeedKavithai[]> {
  const { data, error } = await supabase
    .from("kavithais")
    .select(
      `id, title, content, created_at, author_id, background_url, text_color,
       author:profiles!kavithais_author_id_fkey(id, username, display_name, avatar_url),
       likes_count:likes(count),
       comments_count:comments(count)`,
    )
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  const rows = data ?? [];
  let myLikes = new Set<string>();
  if (currentUserId && rows.length > 0) {
    const ids = rows.map((k: any) => k.id);
    const { data: mine } = await supabase
      .from("likes")
      .select("kavithai_id")
      .eq("user_id", currentUserId)
      .in("kavithai_id", ids);
    myLikes = new Set((mine ?? []).map((l: any) => l.kavithai_id));
  }
  return rows.map((k: any) => ({
    id: k.id,
    title: k.title,
    content: k.content,
    created_at: k.created_at,
    author_id: k.author_id,
    background_url: k.background_url ?? null,
    text_color: k.text_color ?? null,
    author: Array.isArray(k.author) ? k.author[0] : k.author,
    likes_count: k.likes_count?.[0]?.count ?? 0,
    comments_count: k.comments_count?.[0]?.count ?? 0,
    liked_by_me: myLikes.has(k.id),
  }));
}

export async function fetchKavithai(id: string, currentUserId: string | null) {
  const { data, error } = await supabase
    .from("kavithais")
    .select(
      `id, title, content, created_at, author_id, background_url, text_color,
       author:profiles!kavithais_author_id_fkey(id, username, display_name, avatar_url),
       likes(user_id),
       comments(id, content, created_at, author_id, author:profiles!comments_author_id_fkey(username, display_name))`,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const anyData = data as any;
  return {
    id: anyData.id as string,
    title: anyData.title as string | null,
    content: anyData.content as string,
    created_at: anyData.created_at as string,
    author_id: anyData.author_id as string,
    background_url: (anyData.background_url ?? null) as string | null,
    text_color: (anyData.text_color ?? null) as string | null,
    author: Array.isArray(anyData.author) ? anyData.author[0] : anyData.author,
    likes_count: anyData.likes?.length ?? 0,
    liked_by_me: !!currentUserId && (anyData.likes ?? []).some((l: any) => l.user_id === currentUserId),
    comments: (anyData.comments ?? []).map((c: any) => ({
      id: c.id as string,
      content: c.content as string,
      created_at: c.created_at as string,
      author_id: c.author_id as string,
      author: Array.isArray(c.author) ? c.author[0] : c.author,
    })).sort((a: any, b: any) => a.created_at.localeCompare(b.created_at)),
  };
}

export function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}
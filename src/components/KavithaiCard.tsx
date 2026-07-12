import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { FeedKavithai } from "@/lib/kavithai";
import { timeAgo } from "@/lib/kavithai";

export function KavithaiCard({ k, currentUserId }: { k: FeedKavithai; currentUserId: string | null }) {
  const router = useRouter();
  const [liked, setLiked] = useState(k.liked_by_me);
  const [count, setCount] = useState(k.likes_count);
  const [busy, setBusy] = useState(false);

  const initials = (k.author?.display_name ?? "?").slice(0, 1).toUpperCase();

  async function toggleLike() {
    if (!currentUserId) {
      router.navigate({ to: "/auth", search: { next: "/" } });
      return;
    }
    if (busy) return;
    setBusy(true);
    const optimistic = !liked;
    setLiked(optimistic);
    setCount((c) => c + (optimistic ? 1 : -1));
    try {
      if (optimistic) {
        const { error } = await supabase
          .from("likes")
          .insert({ user_id: currentUserId, kavithai_id: k.id });
        if (error && error.code !== "23505") throw error;
      } else {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("user_id", currentUserId)
          .eq("kavithai_id", k.id);
        if (error) throw error;
      }
    } catch (e) {
      setLiked(!optimistic);
      setCount((c) => c + (optimistic ? -1 : 1));
      toast.error("Couldn't update your support");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="flex flex-col gap-5 px-6">
      <div className="flex items-center gap-3">
        <Link
          to="/u/$username"
          params={{ username: k.author?.username ?? "" }}
          className="grid size-8 place-items-center rounded-full bg-neutral-200 text-[11px] font-medium text-neutral-500 outline-1 -outline-offset-1 outline-black/5"
          aria-label={k.author?.display_name ?? "poet"}
        >
          {initials}
        </Link>
        <div className="flex flex-col leading-tight">
          <Link
            to="/u/$username"
            params={{ username: k.author?.username ?? "" }}
            className="font-serif text-sm font-medium leading-none"
          >
            @{k.author?.username ?? "poet"}
          </Link>
          <span className="text-[10px] uppercase tracking-wider text-neutral-500">
            {timeAgo(k.created_at)}
          </span>
        </div>
      </div>

      <Link
        to="/k/$id"
        params={{ id: k.id }}
        className="border-l-2 border-[color:var(--sepia)]/20 py-2 pl-6 transition-colors hover:border-[color:var(--sepia)]/50"
      >
        {k.title && (
          <h2 className="mb-2 font-serif text-base italic text-neutral-500">
            {k.title}
          </h2>
        )}
        <p className="max-w-[56ch] whitespace-pre-line text-pretty font-tamil text-xl leading-relaxed text-[color:var(--ink)]">
          {k.content}
        </p>
      </Link>

      <div className="flex items-center gap-4 pt-1">
        <button
          type="button"
          onClick={toggleLike}
          className={
            "flex items-center gap-2 rounded-full py-2 pl-2 pr-3 ring-1 transition-colors " +
            (liked
              ? "bg-[color:var(--sepia)]/10 ring-[color:var(--sepia)]/30"
              : "bg-neutral-50/50 ring-black/5 hover:bg-neutral-100")
          }
          aria-pressed={liked}
        >
          <span
            className={
              "size-3.5 rounded-full ring-2 " +
              (liked
                ? "bg-[color:var(--sepia)] ring-[color:var(--sepia)]"
                : "ring-[color:var(--sepia)]/40")
            }
            aria-hidden
          />
          <span className="text-xs font-medium text-neutral-700">
            {count} {count === 1 ? "support" : "supports"}
          </span>
        </button>
        <Link
          to="/k/$id"
          params={{ id: k.id }}
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-[color:var(--ink)]"
        >
          <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.8} />
          {k.comments_count} comments
        </Link>
        <button
          type="button"
          className="ml-auto text-neutral-400 hover:text-[color:var(--ink)]"
          aria-label="Share"
          onClick={async () => {
            const url = `${window.location.origin}/k/${k.id}`;
            try {
              if (navigator.share) await navigator.share({ url, title: k.title ?? "Kavithai" });
              else {
                await navigator.clipboard.writeText(url);
                toast.success("Link copied");
              }
            } catch {}
          }}
        >
          <Share2 className="h-4 w-4" strokeWidth={1.6} />
        </button>
      </div>
    </article>
  );
}
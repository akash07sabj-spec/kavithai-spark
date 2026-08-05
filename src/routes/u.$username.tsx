import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { timeAgo } from "@/lib/kavithai";
import { AppShell } from "@/components/AppShell";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";

export const Route = createFileRoute("/u/$username")({
  component: ProfilePage,
});

async function loadProfile(username: string) {
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, avatar_url, created_at")
    .eq("username", username)
    .maybeSingle();
  if (pErr) throw pErr;
  if (!profile) return null;
  const [postsRes, likedRes] = await Promise.all([
    supabase
      .from("kavithais")
      .select("id, title, content, created_at, background_url, text_color")
      .eq("author_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("likes")
      .select(
        "created_at, kavithai:kavithais(id, title, content, created_at, background_url, text_color, author:profiles!kavithais_author_id_fkey(username, display_name))",
      )
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  if (postsRes.error) throw postsRes.error;
  const liked = (likedRes.data ?? [])
    .map((l: any) => (Array.isArray(l.kavithai) ? l.kavithai[0] : l.kavithai))
    .filter(Boolean);
  return { profile, kavithais: postsRes.data ?? [], liked };
}

function ProfilePage() {
  const { username } = Route.useParams();
  const navigate = useNavigate();
  const { userId } = useSession();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"posts" | "liked">("posts");
  const [editOpen, setEditOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => loadProfile(username),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const isMe = userId && data?.profile.id === userId;

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  return (
    <AppShell>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-black/5 bg-[color:var(--paper)]/90 px-5 backdrop-blur-md lg:static lg:border-0 lg:px-6 lg:pt-8 lg:backdrop-blur-none">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          aria-label="Back"
          className="flex size-9 items-center justify-center rounded-full ring-1 ring-black/10 lg:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="font-serif text-sm font-medium uppercase tracking-widest text-neutral-500">
          Poet
        </span>
        {isMe && (
          <button
            type="button"
            onClick={signOut}
            className="ml-auto text-xs uppercase tracking-widest text-neutral-500 hover:text-[color:var(--sepia)]"
          >
            Sign out
          </button>
        )}
      </header>

      {isLoading && <p className="p-6 text-sm text-neutral-500">Loading…</p>}
      {!isLoading && !data && (
        <p className="p-6 text-sm text-neutral-500">Poet not found.</p>
      )}

      {data && (
        <main className="flex-1 pb-28">
          <section className="px-6 pt-8">
            <div className="flex items-start gap-4">
              {data.profile.avatar_url ? (
                <img
                  src={data.profile.avatar_url}
                  alt={data.profile.display_name}
                  className="size-20 rounded-full object-cover ring-1 ring-black/10"
                />
              ) : (
                <div className="grid size-20 place-items-center rounded-full bg-neutral-200 font-serif text-3xl text-neutral-500">
                  {data.profile.display_name.slice(0, 1).toUpperCase()}
                </div>
              )}
              {isMe && (
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="ml-auto flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-neutral-700 hover:bg-neutral-200"
                >
                  <Pencil className="h-3 w-3" strokeWidth={2} />
                  Edit
                </button>
              )}
            </div>
            <h1 className="mt-4 font-serif text-2xl">{data.profile.display_name}</h1>
            <p className="text-sm text-neutral-500">@{data.profile.username}</p>
            {data.profile.bio && (
              <p className="mt-3 max-w-[56ch] font-serif italic text-neutral-600">
                {data.profile.bio}
              </p>
            )}
            <div className="mt-4 flex gap-4 text-[10px] uppercase tracking-widest text-neutral-400">
              <span>
                {data.kavithais.length}{" "}
                {data.kavithais.length === 1 ? "kavithai" : "kavithais"}
              </span>
              <span>{data.liked.length} liked</span>
            </div>
          </section>

          <div className="mt-8 flex border-b border-black/10">
            {(["posts", "liked"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={
                  "flex-1 py-3 text-[11px] font-medium uppercase tracking-widest transition-colors " +
                  (tab === t
                    ? "border-b-2 border-[color:var(--sepia)] text-[color:var(--ink)]"
                    : "text-neutral-400")
                }
              >
                {t}
              </button>
            ))}
          </div>

          <section className="mt-6 flex flex-col gap-6">
            {(tab === "posts" ? data.kavithais : data.liked).map((k: any) => (
              <ProfilePostRow key={k.id} k={k} />
            ))}
            {tab === "posts" && data.kavithais.length === 0 && (
              <p className="px-6 text-sm italic text-neutral-500">
                No kavithais yet.
              </p>
            )}
            {tab === "liked" && data.liked.length === 0 && (
              <p className="px-6 text-sm italic text-neutral-500">
                No liked kavithais yet.
              </p>
            )}
          </section>
        </main>
      )}

      {editOpen && isMe && data && (
        <EditProfile
          initial={{
            bio: data.profile.bio ?? "",
            avatar_url: data.profile.avatar_url ?? "",
          }}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false);
            qc.invalidateQueries({ queryKey: ["profile", username] });
          }}
          userId={data.profile.id}
        />
      )}
    </AppShell>
  );
}

function ProfilePostRow({ k }: { k: any }) {
  return (
    <Link
      to="/k/$id"
      params={{ id: k.id }}
      preload="intent"
      className={
        k.background_url
          ? "mx-6 overflow-hidden rounded-xl ring-1 ring-black/10"
          : "mx-6 border-l-2 border-[color:var(--sepia)]/20 pl-4 hover:border-[color:var(--sepia)]/60"
      }
      style={
        k.background_url
          ? {
              backgroundImage: `url(${k.background_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {k.background_url ? (
        <div className="bg-black/45 p-4">
          {k.title && (
            <h3 className="mb-1 font-serif text-sm italic text-white/80">
              {k.title}
            </h3>
          )}
          <p
            className="line-clamp-4 whitespace-pre-line font-tamil text-lg leading-relaxed [text-shadow:0_1px_6px_rgba(0,0,0,0.55)]"
            style={{ color: k.text_color ?? "#ffffff" }}
          >
            {k.content}
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-widest text-white/70">
            {timeAgo(k.created_at)}
          </p>
        </div>
      ) : (
        <>
          {k.title && (
            <h3 className="mb-1 font-serif text-sm italic text-neutral-500">
              {k.title}
            </h3>
          )}
          <p className="line-clamp-4 whitespace-pre-line font-tamil text-lg leading-relaxed text-[color:var(--ink)]">
            {k.content}
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-widest text-neutral-400">
            {timeAgo(k.created_at)}
          </p>
        </>
      )}
    </Link>
  );
}

function EditProfile({
  initial,
  userId,
  onClose,
  onSaved,
}: {
  initial: { bio: string; avatar_url: string };
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [bio, setBio] = useState(initial.bio);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatar_url);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please pick an image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: signed, error: sErr } = await supabase.storage
        .from("avatars")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (sErr) throw sErr;
      setAvatarUrl(signed.signedUrl);
      toast.success("Photo uploaded — tap Save");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setBusy(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          bio: bio.trim() || null,
          avatar_url: avatarUrl.trim() || null,
        })
        .eq("id", userId);
      if (error) throw error;
      toast.success("Profile updated");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-[430px] rounded-t-2xl bg-[color:var(--paper)] p-6 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-sm uppercase tracking-widest text-neutral-500">
            Edit profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs uppercase tracking-widest text-neutral-500"
          >
            Cancel
          </button>
        </div>

        <label className="block">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500">
            Profile photo
          </span>
          <div className="mt-2 flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="size-14 rounded-full object-cover ring-1 ring-black/10"
              />
            ) : (
              <div className="size-14 rounded-full bg-neutral-200" />
            )}
            <label className="flex-1 cursor-pointer rounded-lg border border-dashed border-black/15 bg-white px-3 py-2 text-center text-xs uppercase tracking-widest text-neutral-500 hover:border-[color:var(--sepia)] hover:text-[color:var(--sepia)]">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickFile}
                disabled={uploading}
              />
              {uploading ? "Uploading…" : avatarUrl ? "Change photo" : "Upload photo"}
            </label>
          </div>
        </label>

        <label className="mt-4 block">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500">
            Bio
          </span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={280}
            placeholder="A few words about you…"
            className="mt-2 w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 font-serif text-sm italic outline-none focus:border-[color:var(--sepia)]"
          />
          <p className="mt-1 text-right text-[10px] uppercase tracking-widest text-neutral-400">
            {bio.length} / 280
          </p>
        </label>

        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="mt-4 w-full rounded-full bg-[color:var(--sepia)] py-3 text-xs font-medium uppercase tracking-widest text-white disabled:opacity-40"
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
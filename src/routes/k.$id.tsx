import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchKavithai, timeAgo } from "@/lib/kavithai";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";

export const Route = createFileRoute("/k/$id")({
  component: KavithaiDetail,
});

function KavithaiDetail() {
  const { id } = Route.useParams();
  const { userId } = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["kavithai", id, userId],
    queryFn: () => fetchKavithai(id, userId),
  });

  const [liked, setLiked] = useState<boolean | null>(null);
  const isLiked = liked ?? data?.liked_by_me ?? false;
  const likeCount =
    (data?.likes_count ?? 0) +
    (liked === null ? 0 : liked ? 1 : -1) -
    (liked === null ? 0 : data?.liked_by_me ? 1 : 0);

  async function toggleLike() {
    if (!userId) {
      navigate({ to: "/auth", search: { next: `/k/${id}` } });
      return;
    }
    const next = !isLiked;
    setLiked(next);
    try {
      if (next) {
        const { error } = await supabase
          .from("likes")
          .insert({ user_id: userId, kavithai_id: id });
        if (error && error.code !== "23505") throw error;
      } else {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("user_id", userId)
          .eq("kavithai_id", id);
        if (error) throw error;
      }
    } catch {
      setLiked(!next);
      toast.error("Couldn't update your support");
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      navigate({ to: "/auth", search: { next: `/k/${id}` } });
      return;
    }
    if (!comment.trim()) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("comments").insert({
        author_id: userId,
        kavithai_id: id,
        content: comment.trim(),
      });
      if (error) throw error;
      setComment("");
      qc.invalidateQueries({ queryKey: ["kavithai", id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't comment");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-[color:var(--paper)]">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-black/5 bg-[color:var(--paper)]/90 px-5 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          aria-label="Back"
          className="flex size-9 items-center justify-center rounded-full ring-1 ring-black/10 hover:bg-neutral-100"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="font-serif text-sm font-medium uppercase tracking-widest text-neutral-500">
          Kavithai
        </span>
      </header>

      {isLoading && <p className="p-6 text-sm text-neutral-500">Loading…</p>}
      {!isLoading && !data && (
        <p className="p-6 text-sm text-neutral-500">Not found.</p>
      )}

      {data && (
        <main className="flex-1 pb-24">
          <section className="px-6 pt-8">
            <div className="mb-6 flex items-center gap-3">
              <Link
                to="/u/$username"
                params={{ username: data.author?.username ?? "" }}
                className="grid size-9 place-items-center rounded-full bg-neutral-200 text-sm font-medium text-neutral-500"
              >
                {(data.author?.display_name ?? "?").slice(0, 1).toUpperCase()}
              </Link>
              <div>
                <Link
                  to="/u/$username"
                  params={{ username: data.author?.username ?? "" }}
                  className="font-serif text-sm font-medium"
                >
                  {data.author?.display_name ?? "poet"}
                </Link>
                <p className="text-[10px] uppercase tracking-wider text-neutral-500">
                  @{data.author?.username} · {timeAgo(data.created_at)}
                </p>
              </div>
            </div>

            {data.title && (
              <h1 className="mb-4 font-serif text-2xl italic text-neutral-600">
                {data.title}
              </h1>
            )}
            {data.background_url ? (
              <div
                className="overflow-hidden rounded-2xl ring-1 ring-black/10"
                style={{
                  backgroundImage: `url(${data.background_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="bg-black/45 p-6">
                  <p className="whitespace-pre-line font-tamil text-2xl leading-relaxed text-white drop-shadow">
                    {data.content}
                  </p>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-line font-tamil text-2xl leading-relaxed text-[color:var(--ink)]">
                {data.content}
              </p>
            )}

            <div className="mt-8 flex items-center gap-4">
              <button
                type="button"
                onClick={toggleLike}
                className={
                  "flex items-center gap-2 rounded-full py-2 pl-2 pr-4 ring-1 " +
                  (isLiked
                    ? "bg-[color:var(--sepia)]/10 ring-[color:var(--sepia)]/30"
                    : "bg-neutral-50/50 ring-black/5")
                }
              >
                <span
                  className={
                    "size-3.5 rounded-full ring-2 " +
                    (isLiked
                      ? "bg-[color:var(--sepia)] ring-[color:var(--sepia)]"
                      : "ring-[color:var(--sepia)]/40")
                  }
                />
                <span className="text-xs font-medium text-neutral-700">
                  {Math.max(0, likeCount)} supports
                </span>
              </button>
            </div>
          </section>

          <section className="mt-10 border-t border-black/5 px-6 pt-6">
            <h2 className="mb-4 font-serif text-xs uppercase tracking-widest text-neutral-500">
              Comments · {data.comments.length}
            </h2>
            <div className="flex flex-col gap-4">
              {data.comments.map((c: any) => (
                <div key={c.id} className="flex gap-3">
                  <div className="grid size-8 shrink-0 place-items-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-500">
                    {(c.author?.display_name ?? "?").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] text-neutral-500">
                      <span className="font-medium text-[color:var(--ink)]">
                        @{c.author?.username ?? "poet"}
                      </span>{" "}
                      · {timeAgo(c.created_at)}
                    </p>
                    <p className="mt-1 whitespace-pre-line font-tamil text-base text-[color:var(--ink)]">
                      {c.content}
                    </p>
                  </div>
                </div>
              ))}
              {data.comments.length === 0 && (
                <p className="text-sm italic text-neutral-500">
                  Be the first to leave a comment.
                </p>
              )}
            </div>
          </section>
        </main>
      )}

      <form
        onSubmit={submitComment}
        className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 border-t border-black/5 bg-[color:var(--paper)]/95 px-4 pb-6 pt-3 backdrop-blur-md"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={userId ? "Add a comment…" : "Sign in to comment"}
            className="flex-1 rounded-full border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-[color:var(--sepia)]"
          />
          <button
            type="submit"
            disabled={busy || !comment.trim()}
            className="rounded-full bg-[color:var(--sepia)] px-4 py-2 text-xs font-medium uppercase tracking-widest text-white disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
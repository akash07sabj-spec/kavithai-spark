import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { timeAgo } from "@/lib/kavithai";
import { BottomNav } from "@/components/BottomNav";
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
  const { data: kavithais, error: kErr } = await supabase
    .from("kavithais")
    .select("id, title, content, created_at")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false });
  if (kErr) throw kErr;
  return { profile, kavithais: kavithais ?? [] };
}

function ProfilePage() {
  const { username } = Route.useParams();
  const navigate = useNavigate();
  const { userId } = useSession();
  const { data, isLoading } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => loadProfile(username),
  });

  const isMe = userId && data?.profile.id === userId;

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-[color:var(--paper)]">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-black/5 bg-[color:var(--paper)]/90 px-5 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          aria-label="Back"
          className="flex size-9 items-center justify-center rounded-full ring-1 ring-black/10"
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
            <div className="grid size-20 place-items-center rounded-full bg-neutral-200 font-serif text-3xl text-neutral-500">
              {data.profile.display_name.slice(0, 1).toUpperCase()}
            </div>
            <h1 className="mt-4 font-serif text-2xl">{data.profile.display_name}</h1>
            <p className="text-sm text-neutral-500">@{data.profile.username}</p>
            {data.profile.bio && (
              <p className="mt-3 max-w-[56ch] font-serif italic text-neutral-600">
                {data.profile.bio}
              </p>
            )}
            <p className="mt-4 text-[10px] uppercase tracking-widest text-neutral-400">
              {data.kavithais.length}{" "}
              {data.kavithais.length === 1 ? "kavithai" : "kavithais"}
            </p>
          </section>

          <section className="mt-8 flex flex-col gap-8 border-t border-black/5 pt-6">
            {data.kavithais.map((k) => (
              <Link
                key={k.id}
                to="/k/$id"
                params={{ id: k.id }}
                className="mx-6 border-l-2 border-[color:var(--sepia)]/20 pl-4 hover:border-[color:var(--sepia)]/60"
              >
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
              </Link>
            ))}
            {data.kavithais.length === 0 && (
              <p className="px-6 text-sm italic text-neutral-500">
                No kavithais yet.
              </p>
            )}
          </section>
        </main>
      )}

      <BottomNav />
    </div>
  );
}
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search as SearchIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

async function searchPoets(q: string) {
  const term = q.trim();
  if (!term) return [];
  const like = `%${term}%`;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, avatar_url")
    .or(`username.ilike.${like},display_name.ilike.${like}`)
    .order("username")
    .limit(30);
  if (error) throw error;
  return data ?? [];
}

function SearchPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { data, isFetching } = useQuery({
    queryKey: ["search-poets", q.trim()],
    queryFn: () => searchPoets(q),
    enabled: q.trim().length > 0,
  });

  return (
    <AppShell>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-black/5 bg-[color:var(--paper)]/90 px-5 backdrop-blur-md lg:static lg:h-auto lg:border-0 lg:px-6 lg:pb-4 lg:pt-10 lg:backdrop-blur-none">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          aria-label="Back"
          className="flex size-9 items-center justify-center rounded-full ring-1 ring-black/10 lg:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="font-serif text-sm font-medium uppercase tracking-widest text-neutral-500 lg:text-3xl lg:normal-case lg:tracking-tight lg:text-[color:var(--ink)]">
          Find poets
        </span>
      </header>

      <main className="flex-1 pb-28 pt-6">
        <div className="px-6">
          <label className="flex items-center gap-3 rounded-full bg-white/70 px-4 py-3 ring-1 ring-black/10 focus-within:ring-[color:var(--sepia)]/40">
            <SearchIcon className="h-4 w-4 text-neutral-500" strokeWidth={1.8} />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or @username"
              className="flex-1 bg-transparent font-serif text-base outline-none placeholder:text-neutral-400"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col">
          {q.trim() === "" && (
            <p className="px-6 font-serif text-sm italic text-neutral-500">
              Type a name to discover other poets.
            </p>
          )}
          {q.trim() !== "" && isFetching && (
            <p className="px-6 text-sm text-neutral-500">Searching…</p>
          )}
          {data && data.length === 0 && q.trim() !== "" && !isFetching && (
            <p className="px-6 font-serif text-sm italic text-neutral-500">
              No poets found for "{q}".
            </p>
          )}
          {data && data.length > 0 && (
            <ul className="flex flex-col divide-y divide-black/5">
              {data.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/u/$username"
                    params={{ username: p.username }}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-black/[0.02]"
                  >
                    <span className="grid size-10 place-items-center rounded-full bg-neutral-200 font-serif text-sm text-neutral-500">
                      {p.display_name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="flex flex-col leading-tight">
                      <span className="font-serif text-sm">{p.display_name}</span>
                      <span className="text-[11px] uppercase tracking-wider text-neutral-500">
                        @{p.username}
                      </span>
                      {p.bio && (
                        <span className="mt-1 line-clamp-1 font-serif text-xs italic text-neutral-500">
                          {p.bio}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </AppShell>
  );
}
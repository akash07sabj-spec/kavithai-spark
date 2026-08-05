import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/AppHeader";
import { AppShell } from "@/components/AppShell";
import { KavithaiCard } from "@/components/KavithaiCard";
import { fetchFeed } from "@/lib/kavithai";
import { useSession } from "@/hooks/use-session";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { userId } = useSession();
  const { data, isLoading, error } = useQuery({
    queryKey: ["feed", userId],
    queryFn: () => fetchFeed(userId),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  return (
    <AppShell
      mobileHeader={<AppHeader />}
      maxWidth="max-w-[680px] xl:max-w-none"
    >
      <main className="flex-1 pb-28 pt-6 lg:pb-16 lg:pt-10">
        <h1 className="mb-8 hidden px-6 font-serif text-3xl tracking-tight text-[color:var(--ink)] lg:block">
          Latest kavithai
        </h1>
        {isLoading && (
          <p className="px-6 text-sm text-neutral-500">Loading kavithai…</p>
        )}
        {error && (
          <p className="px-6 text-sm text-red-600">
            Couldn't load feed. Try again.
          </p>
        )}
        {data && data.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="font-serif text-lg italic text-neutral-500">
              The page is blank.
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Be the first to write a kavithai.
            </p>
            <Link
              to="/compose"
              className="mt-6 inline-block rounded-full bg-[color:var(--sepia)] px-6 py-2 text-sm font-medium text-white"
            >
              Write a kavithai
            </Link>
          </div>
        )}
        {data && data.length > 0 && (
          <div className="flex flex-col gap-10 xl:grid xl:grid-cols-2 xl:items-start xl:gap-x-4 xl:gap-y-12">
            {data.map((k) => (
              <KavithaiCard key={k.id} k={k} currentUserId={userId} />
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}

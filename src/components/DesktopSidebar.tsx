import { Link, useRouterState } from "@tanstack/react-router";
import { Home, PenLine, Search, User } from "lucide-react";

const items = [
  { to: "/" as const, label: "Home", icon: Home },
  { to: "/search" as const, label: "Search", icon: Search },
  { to: "/compose" as const, label: "Write", icon: PenLine },
  { to: "/me" as const, label: "Poet", icon: User },
];

export function DesktopSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-black/5 px-5 py-8 lg:flex xl:w-72">
      <Link
        to="/"
        className="font-tamil text-2xl font-semibold tracking-tight text-[color:var(--ink)]"
      >
        கவிதை
      </Link>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">
        Kavithai Corner
      </p>

      <nav className="mt-10 flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className={
                "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors " +
                (active
                  ? "bg-black/5 font-semibold text-[color:var(--sepia)]"
                  : "text-neutral-600 hover:bg-black/[0.03] hover:text-[color:var(--ink)]")
              }
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.7} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <Link
        to="/compose"
        className="mt-8 rounded-full bg-[color:var(--sepia)] px-5 py-3 text-center text-sm font-medium tracking-wide text-white transition-opacity hover:opacity-90"
      >
        Write a kavithai
      </Link>

      <p className="mt-auto font-serif text-xs italic leading-relaxed text-neutral-500">
        “ஒரு வரி கவிதை, ஒரு உலகம்.”
      </p>
    </aside>
  );
}
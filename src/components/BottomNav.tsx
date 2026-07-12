import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, PenLine, User, Bell } from "lucide-react";

const items = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/explore", label: "Explore", Icon: Search },
  { to: "/compose", label: "Write", Icon: PenLine },
  { to: "/activity", label: "Activity", Icon: Bell },
  { to: "/me", label: "Poet", Icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/5 bg-[color:var(--paper)]/95 px-6 pb-6 pt-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-between">
        {items.map(({ to, label, Icon }) => {
          const active =
            to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={
                "flex flex-col items-center gap-1 " +
                (active ? "text-[color:var(--sepia)]" : "text-neutral-400")
              }
            >
              <Icon
                className="h-5 w-5"
                strokeWidth={active ? 2.2 : 1.6}
              />
              <span className="text-[10px] font-medium uppercase tracking-tighter">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, PenLine, User } from "lucide-react";

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/5 bg-[color:var(--paper)]/95 px-6 pb-6 pt-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-around">
        <NavItem to="/" label="Home" active={isActive("/")}>
          <Home className="h-5 w-5" strokeWidth={isActive("/") ? 2.2 : 1.6} />
        </NavItem>
        <NavItem to="/compose" label="Write" active={isActive("/compose")}>
          <PenLine
            className="h-5 w-5"
            strokeWidth={isActive("/compose") ? 2.2 : 1.6}
          />
        </NavItem>
        <NavItem to="/me" label="Poet" active={isActive("/me")}>
          <User className="h-5 w-5" strokeWidth={isActive("/me") ? 2.2 : 1.6} />
        </NavItem>
      </div>
    </nav>
  );
}

function NavItem({
  to,
  label,
  active,
  children,
}: {
  to: "/" | "/compose" | "/me";
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={
        "flex flex-col items-center gap-1 " +
        (active ? "text-[color:var(--sepia)]" : "text-neutral-400")
      }
    >
      {children}
      <span className="text-[10px] font-medium uppercase tracking-tighter">
        {label}
      </span>
    </Link>
  );
}
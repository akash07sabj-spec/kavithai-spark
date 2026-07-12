import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

export function AppHeader({ title = "கவிதை" }: { title?: string }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-black/5 bg-[color:var(--paper)]/90 px-5 backdrop-blur-md">
      <Link
        to="/"
        className="font-tamil text-xl font-semibold uppercase tracking-tight text-[color:var(--ink)]"
      >
        {title}
      </Link>
      <Link
        to="/compose"
        aria-label="Write kavithai"
        className="flex size-9 items-center justify-center rounded-full ring-1 ring-black/10 bg-[color:var(--paper)] transition-transform active:scale-95 hover:bg-neutral-100"
      >
        <Plus className="h-4 w-4 text-[color:var(--ink)]" strokeWidth={2.2} />
      </Link>
    </header>
  );
}
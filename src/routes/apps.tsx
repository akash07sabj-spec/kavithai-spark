import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/apps")({
  head: () => ({
    meta: [
      { title: "My Apps — Projects by the Kavithai maker" },
      {
        name: "description",
        content:
          "A home for my apps. Kavithai Corner, a Tamil poetry space, is live now — more projects land here as they ship.",
      },
      { property: "og:title", content: "My Apps — Projects by the Kavithai maker" },
      {
        property: "og:description",
        content:
          "Kavithai Corner is live. More apps are on the way — follow along here.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AppsPage,
});

const upcoming = [
  {
    name: "Project 2",
    tag: "In design",
    blurb: "Next in line. Slot reserved — the idea is being sketched out.",
  },
  {
    name: "Project 3",
    tag: "Planned",
    blurb: "Another app will take this spot once Project 2 ships.",
  },
];

function AppsPage() {
  return (
    <div className="min-h-screen bg-[color:var(--paper)] text-[color:var(--ink)]">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-8">
        <span className="font-tamil text-lg font-semibold tracking-tight">
          My Apps
        </span>
        <Link
          to="/"
          className="text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--sepia)]"
        >
          Open Kavithai
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 pb-24">
        <section className="border-b border-black/10 pb-14">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-black/50">
            Everything I build
          </p>
          <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            A single shelf for my apps.
          </h1>
          <p className="mt-4 max-w-xl font-serif text-base italic leading-relaxed text-black/70">
            Kavithai Corner comes first. Everything I make hereafter gets its own
            place on this shelf.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-black/50">
            01 — Live now
          </h2>
          <Link
            to="/"
            className="group mt-5 block rounded-3xl bg-[color:var(--paper-light)] p-8 ring-1 ring-black/10 transition-transform hover:-translate-y-0.5 sm:p-10"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--sepia)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                  <Sparkles className="h-3 w-3" /> Kavithai
                </span>
                <h3 className="mt-5 font-tamil text-3xl font-semibold tracking-tight sm:text-4xl">
                  கவிதை — Kavithai Corner
                </h3>
                <p className="mt-3 max-w-xl font-serif text-base leading-relaxed text-black/75">
                  A warm, literary space to write and share Tamil poetry. Palm-leaf
                  olaichuvadi styling, poem-on-photo backgrounds, an AI critic that
                  rates spelling, rhyme, poetic feel and word choice, plus support
                  and comments from other poets.
                </p>
                <ul className="mt-6 flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-black/60">
                  {["Tamil poetry", "AI rating", "Installable app", "Web + mobile"].map(
                    (t) => (
                      <li key={t} className="rounded-full bg-black/[0.06] px-3 py-1">
                        {t}
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <ArrowUpRight className="mt-1 h-6 w-6 shrink-0 text-[color:var(--sepia)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
        </section>

        <section className="mt-16">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-black/50">
            Hereafter
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {upcoming.map((p, i) => (
              <article
                key={p.name}
                className="rounded-3xl border border-dashed border-black/20 p-7"
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/45">
                  {String(i + 2).padStart(2, "0")} — {p.tag}
                </span>
                <h3 className="mt-4 font-serif text-2xl tracking-tight">{p.name}</h3>
                <p className="mt-2 font-serif text-sm leading-relaxed text-black/65">
                  {p.blurb}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-black/10 px-6 py-8">
        <p className="mx-auto max-w-5xl font-serif text-xs italic text-black/55">
          “ஒரு வரி கவிதை, ஒரு உலகம்.”
        </p>
      </footer>
    </div>
  );
}
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Image as ImageIcon, Palette, Sparkles, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { rateKavithai } from "@/lib/rate-kavithai.functions";
import { BACKGROUNDS } from "@/lib/backgrounds";

export const Route = createFileRoute("/_authenticated/compose")({
  component: Compose,
});

type Rating = {
  spelling: number | null;
  rhyming: number | null;
  poetic: number | null;
  words: number | null;
  feedback: string;
};

function Compose() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [rating, setRating] = useState<Rating | null>(null);
  const [rating_busy, setRatingBusy] = useState(false);
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [bgOpen, setBgOpen] = useState(false);
  const [textColor, setTextColor] = useState<string>("#ffffff");
  const [colorOpen, setColorOpen] = useState(false);
  const rate = useServerFn(rateKavithai);

  const TEXT_COLORS = [
    "#ffffff",
    "#000000",
    "#f5d76e",
    "#e94560",
    "#f39c12",
    "#2ecc71",
    "#3498db",
    "#9b59b6",
  ];

  async function handleRate() {
    if (!content.trim()) {
      toast.error("Write a few lines first");
      return;
    }
    setRatingBusy(true);
    setRating(null);
    try {
      const res = await rate({ data: { title: title.trim() || undefined, content: content.trim() } });
      setRating(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Couldn't rate";
      if (msg.toLowerCase().includes("rate limit") || msg.includes("429")) toast.error("AI is busy — try again in a moment");
      else if (msg.includes("402")) toast.error("AI credits exhausted");
      else toast.error(msg);
    } finally {
      setRatingBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Write a few lines first");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("kavithais")
        .insert({
          author_id: user.id,
          title: title.trim() || null,
          content: content.trim(),
          background_url: bgUrl,
          text_color: bgUrl ? textColor : null,
        } as any)
        .select("id")
        .single();
      if (error) throw error;
      toast.success("Kavithai posted");
      navigate({ to: "/k/$id", params: { id: data.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't post");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-[color:var(--paper)]">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-black/5 bg-[color:var(--paper)]/90 px-5 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          aria-label="Close"
          className="flex size-9 items-center justify-center rounded-full ring-1 ring-black/10 hover:bg-neutral-100"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
        <h1 className="font-serif text-sm font-medium uppercase tracking-widest text-neutral-500">
          New kavithai
        </h1>
        <button
          type="submit"
          form="compose-form"
          disabled={busy}
          className="rounded-full bg-[color:var(--sepia)] px-4 py-2 text-xs font-medium uppercase tracking-widest text-white transition-opacity disabled:opacity-40"
        >
          {busy ? "…" : "Post"}
        </button>
      </header>

      <div className="px-6 pt-5">
        <div className="rounded-2xl border border-[color:var(--sepia)]/20 bg-[color:var(--sepia)]/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[color:var(--sepia)]" strokeWidth={1.8} />
              <span className="font-serif text-xs uppercase tracking-widest text-neutral-600">
                AI critic
              </span>
            </div>
            <button
              type="button"
              onClick={handleRate}
              disabled={rating_busy}
              className="rounded-full bg-[color:var(--ink)] px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-white transition-opacity disabled:opacity-40"
            >
              {rating_busy ? "Reading…" : rating ? "Rate again" : "Rate my kavithai"}
            </button>
          </div>
          {rating && (
            <div className="mt-3">
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    ["Spelling", rating.spelling],
                    ["Rhyming", rating.rhyming],
                    ["Poetic", rating.poetic],
                    ["Words", rating.words],
                  ] as const
                ).map(([label, val]) => (
                  <div
                    key={label}
                    className="flex flex-col items-center rounded-xl bg-[color:var(--paper)] px-2 py-2 ring-1 ring-[color:var(--sepia)]/30"
                  >
                    <span className="font-serif text-xl leading-none text-[color:var(--sepia)]">
                      {val ?? "–"}
                    </span>
                    <span className="mt-1 text-[9px] uppercase tracking-widest text-neutral-500">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              {rating.feedback && (
                <p className="mt-3 font-serif text-sm italic leading-relaxed text-neutral-700">
                  {rating.feedback}
                </p>
              )}
            </div>
          )}
          {!rating && !rating_busy && (
            <p className="mt-2 font-serif text-xs italic text-neutral-500">
              Get 4 scores — spelling, rhyming, poetic, words — before you post.
            </p>
          )}
        </div>
      </div>

      <form
        id="compose-form"
        onSubmit={submit}
        className="flex flex-1 flex-col gap-6 px-6 py-8"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          maxLength={120}
          className="border-b border-black/10 bg-transparent pb-2 font-serif text-lg italic text-neutral-600 outline-none placeholder:text-neutral-400"
        />
        {bgUrl ? (
          <div
            className="relative flex-1 overflow-hidden rounded-xl ring-1 ring-black/10"
            style={{
              backgroundImage: `url(${bgUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: "380px",
            }}
          >
            <button
              type="button"
              onClick={() => setBgUrl(null)}
              className="absolute right-2 top-2 z-10 rounded-full bg-black/60 px-2 py-1 text-[10px] uppercase tracking-widest text-white"
            >
              Remove
            </button>
            <div className="absolute inset-0 bg-black/35" />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="உன் மௌனம் கூட…"
              rows={12}
              maxLength={4000}
              className="relative h-full w-full resize-none whitespace-pre-line bg-transparent p-6 font-tamil text-2xl leading-relaxed outline-none placeholder:text-white/50 [text-shadow:0_1px_6px_rgba(0,0,0,0.55)]"
              style={{ color: textColor }}
              autoFocus
            />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="உன் மௌனம் கூட…&#10;&#10;Write your kavithai here."
            rows={14}
            maxLength={4000}
            className="flex-1 resize-none whitespace-pre-line bg-transparent font-tamil text-xl leading-relaxed text-[color:var(--ink)] outline-none placeholder:text-neutral-400"
            autoFocus
          />
        )}
        <p className="text-right text-[10px] uppercase tracking-widest text-neutral-400">
          {content.length} / 4000
        </p>
      </form>

      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2">
        {colorOpen && bgUrl && (
          <div className="border-t border-black/10 bg-[color:var(--paper)] px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-serif text-[11px] uppercase tracking-widest text-neutral-500">
                Font color
              </span>
            </div>
            <div className="flex gap-2">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setTextColor(c)}
                  aria-label={`Text color ${c}`}
                  className={
                    "h-8 w-8 rounded-full ring-2 transition-all " +
                    (textColor === c ? "ring-[color:var(--sepia)] scale-110" : "ring-black/10")
                  }
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        )}
        {bgOpen && (
          <div className="border-t border-black/10 bg-[color:var(--paper)] px-4 pt-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-serif text-[11px] uppercase tracking-widest text-neutral-500">
                Background
              </span>
              <button
                type="button"
                onClick={() => setBgUrl(null)}
                className="text-[10px] uppercase tracking-widest text-neutral-500"
              >
                None
              </button>
            </div>
            <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-3">
              {BACKGROUNDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBgUrl(b.url)}
                  className={
                    "h-20 w-20 shrink-0 snap-start overflow-hidden rounded-lg ring-2 transition-all " +
                    (bgUrl === b.url
                      ? "ring-[color:var(--sepia)]"
                      : "ring-transparent hover:ring-black/10")
                  }
                >
                  <img
                    src={b.url + "&w=200"}
                    alt={b.label}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-black/10 bg-[color:var(--paper)]/95 px-4 pb-6 pt-3 backdrop-blur-md">
          <div className="flex items-center gap-2">
            {bgUrl && (
              <button
                type="button"
                onClick={() => {
                  setColorOpen((v) => !v);
                  if (!colorOpen) setBgOpen(false);
                }}
                aria-label="Font color"
                className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-2 text-[11px] font-medium uppercase tracking-widest text-neutral-700"
              >
                <Palette className="h-3.5 w-3.5" strokeWidth={1.8} />
                <span
                  className="h-3 w-3 rounded-full ring-1 ring-black/20"
                  style={{ backgroundColor: textColor }}
                />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setBgOpen((v) => !v);
                if (!bgOpen) setColorOpen(false);
              }}
              className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-2 text-[11px] font-medium uppercase tracking-widest text-neutral-700"
            >
              <ImageIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
              Background {bgUrl ? "· selected" : ""}
            </button>
          </div>
          {bgOpen && (
            <button
              type="button"
              onClick={() => setBgOpen(false)}
              className="text-[10px] uppercase tracking-widest text-neutral-500"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
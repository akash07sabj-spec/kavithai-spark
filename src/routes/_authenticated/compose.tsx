import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/compose")({
  component: Compose,
});

function Compose() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

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
        })
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
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="உன் மௌனம் கூட…&#10;&#10;Write your kavithai here."
          rows={14}
          maxLength={4000}
          className="flex-1 resize-none whitespace-pre-line bg-transparent font-tamil text-xl leading-relaxed text-[color:var(--ink)] outline-none placeholder:text-neutral-400"
          autoFocus
        />
        <p className="text-right text-[10px] uppercase tracking-widest text-neutral-400">
          {content.length} / 4000
        </p>
      </form>
    </div>
  );
}
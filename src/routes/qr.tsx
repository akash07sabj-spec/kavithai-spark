import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/qr")({
  component: QrPage,
  head: () => ({
    meta: [
      { title: "Scan · Kavithai" },
      { name: "description", content: "Scan the QR code to open Kavithai on your phone." },
    ],
  }),
});

function QrPage() {
  const navigate = useNavigate();
  const webUrl = typeof window !== "undefined" ? window.location.origin : "";
  const [expoUrl, setExpoUrl] = useState("");
  const target = expoUrl.trim() || webUrl;

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
          Scan to open
        </span>
      </header>

      <main className="flex-1 px-6 pb-28 pt-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="grid place-items-center">
            {target ? (
              <QRCodeCanvas
                value={target}
                size={240}
                includeMargin
                level="M"
              />
            ) : null}
          </div>
          <p className="mt-4 break-all text-center font-mono text-[11px] text-neutral-500">
            {target}
          </p>
        </div>

        <p className="mt-6 font-serif italic text-neutral-600">
          Point your phone camera at the code to open Kavithai. Once you publish
          an Expo Go build, paste its <code>exp://</code> URL below to switch the
          QR to the native app.
        </p>

        <label className="mt-6 block">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500">
            Expo URL (optional)
          </span>
          <input
            type="url"
            value={expoUrl}
            onChange={(e) => setExpoUrl(e.target.value)}
            placeholder="exp://exp.host/@you/kavithai"
            className="mt-2 w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-[color:var(--sepia)]"
          />
        </label>
      </main>

      <BottomNav />
    </div>
  );
}
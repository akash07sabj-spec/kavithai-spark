import { createFileRoute } from "@tanstack/react-router";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { generateText } from "ai";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/rate-kavithai")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { title?: string; content?: string };
          const content = (body.content ?? "").toString().trim();
          if (!content) {
            return Response.json({ error: "content required" }, { status: 400, headers: cors });
          }
          if (content.length > 4000) {
            return Response.json({ error: "too long" }, { status: 400, headers: cors });
          }
          const key = process.env.LOVABLE_API_KEY;
          if (!key) throw new Error("Missing LOVABLE_API_KEY");
          const gateway = createLovableAiGatewayProvider(key);
          const model = gateway("google/gemini-3.5-flash");
          const prompt = `You are a warm Tamil kavithai (poetry) critic. Rate on 4 categories 1-10 (SPELLING, RHYMING, POETIC, WORDS), then one short FEEDBACK sentence (<=200 chars).
Respond EXACTLY:
SPELLING: <1-10>
RHYMING: <1-10>
POETIC: <1-10>
WORDS: <1-10>
FEEDBACK: <one sentence>

${body.title ? `Title: ${body.title}\n` : ""}Kavithai:
${content}`;
          const { text } = await generateText({ model, prompt });
          const pick = (label: string) => {
            const m = text.match(new RegExp(`${label}:\\s*(\\d+(?:\\.\\d+)?)`, "i"));
            return m ? Math.max(1, Math.min(10, parseFloat(m[1]))) : null;
          };
          const fb = text.match(/FEEDBACK:\s*([\s\S]+)/i);
          return Response.json(
            {
              spelling: pick("SPELLING"),
              rhyming: pick("RHYMING"),
              poetic: pick("POETIC"),
              words: pick("WORDS"),
              feedback: (fb ? fb[1] : text).trim().slice(0, 300),
            },
            { headers: cors },
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : "error";
          return Response.json({ error: msg }, { status: 500, headers: cors });
        }
      },
    },
  },
});
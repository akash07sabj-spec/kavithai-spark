import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const Input = z.object({
  title: z.string().optional(),
  content: z.string().min(1).max(4000),
});

export const rateKavithai = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3.5-flash");

    const prompt = `You are a warm, encouraging Tamil kavithai (poetry) critic. Rate this kavithai on FOUR separate categories, each on a scale of 1 to 10:
- SPELLING: correctness of Tamil (or English) spelling and grammar
- RHYMING: rhyme, sound harmony, musicality
- POETIC: imagery, emotion, depth of feeling
- WORDS: word choice, originality, freshness of vocabulary

Then give ONE short sentence of overall feedback in English (max 200 chars). If there are obvious spelling mistakes, mention the correction briefly inside FEEDBACK.

Respond in EXACTLY this format (no extra text, numbers only for scores):
SPELLING: <1-10>
RHYMING: <1-10>
POETIC: <1-10>
WORDS: <1-10>
FEEDBACK: <one short sentence>

${data.title ? `Title: ${data.title}\n` : ""}Kavithai:
${data.content}`;

    const { text } = await generateText({ model, prompt });

    const pick = (label: string) => {
      const m = text.match(new RegExp(`${label}:\\s*(\\d+(?:\\.\\d+)?)`, "i"));
      if (!m) return null;
      return Math.max(1, Math.min(10, parseFloat(m[1])));
    };
    const feedbackMatch = text.match(/FEEDBACK:\s*([\s\S]+)/i);
    const feedback = feedbackMatch
      ? feedbackMatch[1].trim().slice(0, 300)
      : text.trim().slice(0, 300);

    return {
      spelling: pick("SPELLING"),
      rhyming: pick("RHYMING"),
      poetic: pick("POETIC"),
      words: pick("WORDS"),
      feedback,
    };
  });
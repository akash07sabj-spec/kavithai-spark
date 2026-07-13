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

    const prompt = `You are a warm, encouraging Tamil kavithai (poetry) critic. Rate this kavithai on a scale of 1 to 10 based on imagery, emotion, rhythm, and word choice. Then give 1-2 short sentences of feedback in English (max 240 chars). If there are obvious Tamil spelling/grammar mistakes, mention them briefly.

Respond in EXACTLY this format (no extra text):
RATING: <number 1-10>
FEEDBACK: <one or two short sentences>

${data.title ? `Title: ${data.title}\n` : ""}Kavithai:
${data.content}`;

    const { text } = await generateText({ model, prompt });

    const ratingMatch = text.match(/RATING:\s*(\d+(?:\.\d+)?)/i);
    const feedbackMatch = text.match(/FEEDBACK:\s*([\s\S]+)/i);
    const rating = ratingMatch ? Math.max(1, Math.min(10, parseFloat(ratingMatch[1]))) : null;
    const feedback = feedbackMatch ? feedbackMatch[1].trim().slice(0, 400) : text.trim().slice(0, 400);

    return { rating, feedback };
  });
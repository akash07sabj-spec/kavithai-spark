import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "post_kavithai",
  title: "Post a kavithai",
  description: "Publish a new kavithai (Tamil poem) as the signed-in poet.",
  inputSchema: {
    content: z.string().trim().min(1).describe("The poem text. Line breaks are preserved."),
    title: z.string().trim().optional().describe("Optional title."),
    background_url: z.string().url().optional().describe("Optional background image URL for the poem card."),
    text_color: z.string().optional().describe("Optional CSS color for the poem text over a background image."),
  },
  annotations: { readOnlyHint: false, openWorldHint: false },
  handler: async ({ content, title, background_url, text_color }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("kavithais")
      .insert({
        author_id: ctx.getUserId(),
        content,
        title: title ?? null,
        background_url: background_url ?? null,
        text_color: text_color ?? null,
      })
      .select("id, title, content, created_at")
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: { kavithai: data } };
  },
});

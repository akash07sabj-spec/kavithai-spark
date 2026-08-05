import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_feed",
  title: "List kavithai feed",
  description: "List the most recent kavithais (Tamil poems) posted to the app, newest first.",
  inputSchema: { limit: z.number().int().min(1).max(50).optional().describe("How many poems to return (default 10).") },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("kavithais")
      .select("id, title, content, created_at, author:profiles!kavithais_author_id_fkey(username, display_name)")
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { kavithais: data ?? [] },
    };
  },
});

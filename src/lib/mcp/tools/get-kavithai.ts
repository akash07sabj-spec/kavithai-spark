import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_kavithai",
  title: "Get a kavithai",
  description: "Fetch one kavithai by id, including its author, support count and comments.",
  inputSchema: { id: z.string().describe("The kavithai id.") },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("kavithais")
      .select(`id, title, content, created_at, background_url, text_color,
        author:profiles!kavithais_author_id_fkey(username, display_name),
        likes(user_id),
        comments(id, content, created_at, author:profiles!comments_author_id_fkey(username, display_name))`)
      .eq("id", id)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "No kavithai found with that id." }], isError: true };
    const row = data as Record<string, unknown> & { likes?: unknown[] };
    const result = { ...row, likes: undefined, supports: row.likes?.length ?? 0 };
    return { content: [{ type: "text", text: JSON.stringify(result) }], structuredContent: { kavithai: result } };
  },
});

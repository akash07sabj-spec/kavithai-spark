import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "add_comment",
  title: "Comment on a kavithai",
  description: "Post a comment on a kavithai as the signed-in poet.",
  inputSchema: {
    kavithai_id: z.string().describe("The kavithai id to comment on."),
    content: z.string().trim().min(1).describe("The comment text."),
  },
  annotations: { readOnlyHint: false, openWorldHint: false },
  handler: async ({ kavithai_id, content }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("comments")
      .insert({ kavithai_id, content, author_id: ctx.getUserId() })
      .select("id, content, created_at")
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: { comment: data } };
  },
});

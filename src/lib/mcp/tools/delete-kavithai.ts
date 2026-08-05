import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "delete_kavithai",
  title: "Delete a kavithai",
  description: "Permanently delete one of the signed-in poet's own kavithais.",
  inputSchema: { id: z.string().describe("The kavithai id to delete.") },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("kavithais")
      .delete()
      .eq("id", id)
      .eq("author_id", ctx.getUserId())
      .select("id");
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data || data.length === 0)
      return { content: [{ type: "text", text: "Nothing deleted — that kavithai does not exist or is not yours." }], isError: true };
    return { content: [{ type: "text", text: `Deleted kavithai ${id}.` }] };
  },
});

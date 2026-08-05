import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "support_kavithai",
  title: "Support or unsupport a kavithai",
  description: "Add or remove the signed-in poet's support (like) on a kavithai.",
  inputSchema: {
    id: z.string().describe("The kavithai id."),
    support: z.boolean().optional().describe("true to support (default), false to remove support."),
  },
  annotations: { readOnlyHint: false, openWorldHint: false },
  handler: async ({ id, support }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();
    if (support === false) {
      const { error } = await supabase.from("likes").delete().eq("kavithai_id", id).eq("user_id", userId);
      if (error) return { content: [{ type: "text", text: error.message }], isError: true };
      return { content: [{ type: "text", text: `Removed support from ${id}.` }] };
    }
    const { error } = await supabase.from("likes").insert({ kavithai_id: id, user_id: userId });
    if (error && !error.message.toLowerCase().includes("duplicate"))
      return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: `Supporting kavithai ${id}.` }] };
  },
});

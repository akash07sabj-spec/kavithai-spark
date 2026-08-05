import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listFeed from "./tools/list-feed";
import getKavithai from "./tools/get-kavithai";
import postKavithai from "./tools/post-kavithai";
import deleteKavithai from "./tools/delete-kavithai";
import supportKavithai from "./tools/support-kavithai";
import addComment from "./tools/add-comment";
import searchPoets from "./tools/search-poets";
import myKavithais from "./tools/my-kavithais";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "kavithai-corner",
  title: "Kavithai Corner",
  version: "0.1.0",
  instructions:
    "Tools for Kavithai Corner, a Tamil poetry sharing app. Read the feed with `list_feed`, open one poem with `get_kavithai`, publish with `post_kavithai`, support and comment with `support_kavithai` and `add_comment`, and find poets with `search_poets`. All actions run as the signed-in poet.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listFeed, getKavithai, postKavithai, deleteKavithai, supportKavithai, addComment, searchPoets, myKavithais],
});

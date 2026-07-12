import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/me")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/auth", search: { next: "/me" } });
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", data.user.id)
      .maybeSingle();
    if (!profile) {
      throw redirect({ to: "/" });
    }
    throw redirect({ to: "/u/$username", params: { username: profile.username } });
  },
  component: () => null,
});
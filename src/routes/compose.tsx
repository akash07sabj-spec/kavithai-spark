import { createFileRoute, redirect } from "@tanstack/react-router";

// Public entry: bounces into the auth-gated compose route.
export const Route = createFileRoute("/compose")({
  beforeLoad: () => {
    throw redirect({ to: "/_authenticated/compose" as never });
  },
  component: () => null,
});
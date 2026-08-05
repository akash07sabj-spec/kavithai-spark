import type { ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";
import { DesktopSidebar } from "@/components/DesktopSidebar";

export function AppShell({
  children,
  mobileHeader,
  maxWidth = "max-w-[680px]",
  hideBottomNav = false,
}: {
  children: ReactNode;
  /** Header shown on phones/tablets only (desktop uses the sidebar). */
  mobileHeader?: ReactNode;
  /** Content column width on desktop. */
  maxWidth?: string;
  /** Pages with their own fixed bottom bar (compose, detail) hide the tab bar. */
  hideBottomNav?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[color:var(--paper)]">
      <div className="mx-auto flex w-full max-w-[1400px] gap-0 lg:gap-8 lg:px-8">
        <DesktopSidebar />
        <div className="flex min-h-screen w-full min-w-0 flex-col">
          {mobileHeader ? <div className="lg:hidden">{mobileHeader}</div> : null}
          <div
            className={
              "mx-auto flex w-full flex-1 flex-col " + maxWidth
            }
          >
            {children}
          </div>
        </div>
      </div>
      {hideBottomNav ? null : (
        <div className="lg:hidden">
          <BottomNav />
        </div>
      )}
    </div>
  );
}
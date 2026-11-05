import type { ReactNode } from "react";
import { AppNav } from "@/components/app/AppNav";

/** The sticky top bar plus the page content. Every route renders inside it. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <AppNav />
      <main className="neo-surface flex-1">{children}</main>
    </>
  );
}
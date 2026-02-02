import type { ReactNode } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { RedirectToSignIn } from "@clerk/nextjs";
import { ThemeToggle } from "@/app/components/theme-toggle";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="flex min-h-screen">
          <div className="flex min-h-screen flex-1 flex-col bg-background">
            <header className="flex items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--background)] px-6 py-4">
              <div>
                <p className="text-xs text-[color:var(--muted)]">Workspace</p>
                <h1 className="text-lg font-semibold text-[color:var(--foreground)]">
                  Team Board
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <button className="rounded-md border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-1.5 text-xs font-medium text-[color:var(--foreground)]">
                  Switch
                </button>
                <button className="rounded-md bg-[color:var(--accent)] px-3 py-1.5 text-xs font-medium text-[color:var(--panel)]">
                  New
                </button>
                <UserButton />
              </div>
            </header>
            <main className="canvas-bg flex-1 px-8 py-6">{children}</main>
          </div>
        </div>
      </SignedIn>
    </div>
  );
}

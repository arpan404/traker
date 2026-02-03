"use client";

import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="glass-panel w-full max-w-2xl rounded-2xl border border-white/10 p-8 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
              404
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              This page doesn’t exist
            </h1>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              The link may be broken or the page was moved. Pick a safe route
              below to get back on track.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <SignedIn>
                <Link
                  href="/app"
                  className="glass-panel rounded-md bg-[var(--accent)]/80 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[var(--accent)]"
                >
                  Go to workspace
                </Link>
                <Link
                  href="/app"
                  className="rounded-md border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--foreground)]/80 hover:text-[var(--foreground)]"
                >
                  View teams
                </Link>
              </SignedIn>

              <SignedOut>
                <Link
                  href="/sign-in"
                  className="glass-panel rounded-md bg-[var(--accent)]/80 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[var(--accent)]"
                >
                  Sign in
                </Link>
                <Link
                  href="/"
                  className="rounded-md border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--foreground)]/80 hover:text-[var(--foreground)]"
                >
                  Go home
                </Link>
              </SignedOut>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { RedirectToSignIn } from "@clerk/nextjs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-layout/app-header";
import HistorySheet from "@/components/app-layout/history-sheet";
import { SettingsSheet } from "@/components/app-layout/settings-sheet";
import { PresenceSheet } from "@/components/app-layout/presence-sheet";
import { CursorOverlay } from "@/components/app-layout/cursor-overlay";
import { useAppLayoutModel } from "@/hooks/use-app-layout-model";
import Link from "next/link";

function AppLayoutInner({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const {
    slug,
    team,
    activeMembers,
    members,
    isAdmin,
    invites,
    historyScrollRef,
    historyOpen,
    setHistoryOpen,
    settingsOpen,
    setSettingsOpen,
    presenceOpen,
    setPresenceOpen,
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    inviteLink,
    inviteError,
    handleCreateInvite,
    handleCancelInvite,
    latestEditLabel,
    groupedHistory,
    historyLabelForEvent,
    statusColorClass,
  } = useAppLayoutModel(user?.id);

  if (slug && team === null) {
    return (
      <div className="min-h-screen bg-sidebar text-foreground flex items-center justify-center px-6">
        <div className="glass-panel w-full max-w-md p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Team Not Found
          </p>
          <h1 className="mt-3 text-2xl font-bold">This team doesn’t exist</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The workspace you’re trying to access isn’t available. Pick another team.
          </p>
          <Link
            href="/app"
            className="mt-6 inline-flex h-9 items-center justify-center rounded-md bg-[var(--accent)]/80 px-4 text-sm font-semibold text-white transition-all hover:bg-[var(--accent)]"
          >
            Back to teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sidebar text-foreground">
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <SidebarProvider>
          <AppSidebar />
          <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300 w-full min-h-screen bg-sidebar">
            <AppHeader
              slug={slug}
              latestEditLabel={latestEditLabel}
              onOpenHistory={() => setHistoryOpen(true)}
              onOpenPresence={() => setPresenceOpen(true)}
              onOpenSettings={() => setSettingsOpen(true)}
              activeMembers={activeMembers}
            />
            <main className="flex-1 overflow-hidden bg-background relative shadow-inner">
              <div className="canvas-bg absolute inset-0 pointer-events-none" />
              <div className="relative z-10 px-8 py-8 h-full">{children}</div>
            </main>
          </div>
        </SidebarProvider>
      </SignedIn>

      <HistorySheet
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        groupedHistory={groupedHistory}
        historyScrollRef={historyScrollRef as React.RefObject<HTMLDivElement>}
        historyLabelForEvent={historyLabelForEvent}
        statusColorClass={statusColorClass}
        slug={slug}
        currentUserId={user?.id}
      />

      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        isAdmin={isAdmin}
        members={members}
        invites={invites}
        inviteEmail={inviteEmail}
        inviteRole={inviteRole}
        inviteLink={inviteLink}
        inviteError={inviteError}
        onInviteEmailChange={setInviteEmail}
        onInviteRoleChange={setInviteRole}
        onCreateInvite={handleCreateInvite}
        onCancelInvite={handleCancelInvite}
      />

      <PresenceSheet
        open={presenceOpen}
        onOpenChange={setPresenceOpen}
        activeMembers={activeMembers}
      />

      <CursorOverlay activeMembers={activeMembers} currentUserId={user?.id} />
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-sidebar text-foreground" />}
    >
      <AppLayoutInner>{children}</AppLayoutInner>
    </Suspense>
  );
}

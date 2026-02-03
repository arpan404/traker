"use client";

import type { ReactNode } from "react";
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

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const {
    slug,
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

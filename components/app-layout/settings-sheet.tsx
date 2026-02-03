"use client";

import Image from "next/image";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Invite, TeamMember } from "@/types/app-layout";

type SettingsSheetProps = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  isAdmin: boolean;
  members?: TeamMember[];
  invites?: Invite[];
  inviteEmail: string;
  inviteRole: "ADMIN" | "MEMBER" | "VIEWER";
  inviteLink: string;
  inviteError: string | null;
  onInviteEmailChange: (value: string) => void;
  onInviteRoleChange: (value: "ADMIN" | "MEMBER" | "VIEWER") => void;
  onCreateInvite: () => void;
  onCancelInvite: (inviteId: Invite["_id"]) => void;
};

export const SettingsSheet = ({
  open,
  onOpenChange,
  isAdmin,
  members,
  invites,
  inviteEmail,
  inviteRole,
  inviteLink,
  inviteError,
  onInviteEmailChange,
  onInviteRoleChange,
  onCreateInvite,
  onCancelInvite,
}: SettingsSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="bg-background">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Manage members, invites, and projects.</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6 space-y-4 text-sm">
          <div className="rounded-md border border-border/60 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Members
            </p>
            <p className="mt-2 text-foreground">{members?.length ?? 0} members</p>
            <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
              {members?.slice(0, 6).map((member) => (
                <div key={member._id} className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-muted border border-border/60 overflow-hidden">
                    {member.avatarUrl ? (
                      <Image
                        src={member.avatarUrl}
                        alt={member.fullName ?? "Member"}
                        width={24}
                        height={24}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </span>
                  <span>{member.fullName ?? member.userId}</span>
                  <span className="ml-auto text-[10px] uppercase">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-border/60 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Invites
            </p>
            {isAdmin ? (
              <>
                <p className="mt-2 text-foreground">
                  {invites?.length ?? 0} pending
                </p>
                <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                  {invites?.slice(0, 5).map((invite) => (
                    <div key={invite._id} className="flex items-center gap-2">
                      <span>{invite.email}</span>
                      <button
                        className="ml-auto rounded-md border border-border/60 px-2 py-1 text-[10px] uppercase text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                        onClick={() => onCancelInvite(invite._id)}
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-2">
                  <input
                    className="h-9 rounded-md border border-border/60 bg-background px-3 text-xs text-foreground"
                    placeholder="Invite by email"
                    value={inviteEmail}
                    onChange={(event) => onInviteEmailChange(event.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <select
                      className="h-9 rounded-md border border-border/60 bg-background px-2 text-xs text-foreground"
                      value={inviteRole}
                      onChange={(event) =>
                        onInviteRoleChange(
                          event.target.value as "ADMIN" | "MEMBER" | "VIEWER",
                        )
                      }
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                    <button
                      className="h-9 rounded-md bg-[var(--accent)] px-3 text-xs font-semibold text-white"
                      onClick={onCreateInvite}
                    >
                      Create invite
                    </button>
                  </div>
                  {inviteLink ? (
                    <div className="flex items-center gap-2 text-xs">
                      <input
                        className="h-9 flex-1 rounded-md border border-border/60 bg-muted px-3 text-xs text-muted-foreground"
                        value={inviteLink}
                        readOnly
                      />
                      <button
                        className="h-9 rounded-md border border-border/60 px-3 text-xs"
                        onClick={() => {
                          if (!inviteLink) return;
                          navigator.clipboard.writeText(inviteLink);
                        }}
                      >
                        Copy
                      </button>
                    </div>
                  ) : null}
                  {inviteError ? (
                    <p className="text-xs text-red-500">{inviteError}</p>
                  ) : null}
                </div>
              </>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                Only admins can view or send invites.
              </p>
            )}
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
};

"use client";

import Image from "next/image";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { PresenceMember } from "@/types/app-layout";

type PresenceSheetProps = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  activeMembers?: PresenceMember[];
};

export const PresenceSheet = ({
  open,
  onOpenChange,
  activeMembers,
}: PresenceSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="bg-background">
        <SheetHeader>
          <SheetTitle>Online</SheetTitle>
          <SheetDescription>Who’s active right now.</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6 space-y-3 text-sm">
          {activeMembers?.length ? (
            activeMembers.map((member) => (
              <div
                key={member.userId}
                className="flex items-center gap-3 rounded-md border border-border/60 p-3"
              >
                <div className="h-9 w-9 rounded-full border border-border/60 bg-muted overflow-hidden">
                  {member.avatarUrl ? (
                    <Image
                      src={member.avatarUrl}
                      alt={member.fullName ?? "Member"}
                      width={36}
                      height={36}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-foreground/70">
                      {(member.fullName ?? member.userId)
                        .split(" ")
                        .map((part: string) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-foreground">
                    {member.fullName ?? member.userId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {member.isEditing
                      ? `Editing ${member.editingTarget ?? ""}`.trim()
                      : member.activity ?? "Active"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No active members.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

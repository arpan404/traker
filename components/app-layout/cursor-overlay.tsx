"use client";

import Image from "next/image";
import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { PresenceMember } from "@/types/app-layout";

type CursorOverlayProps = {
  activeMembers?: PresenceMember[];
  currentUserId?: string;
};

export const CursorOverlay = memo(function CursorOverlay({
  activeMembers,
  currentUserId,
}: CursorOverlayProps) {
  const visibleMembers = useMemo(() => {
    if (!activeMembers?.length) return [];
    return activeMembers
      .filter((member) => member.userId !== currentUserId)
      .filter((member) => typeof member.cursorX === "number");
  }, [activeMembers, currentUserId]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {visibleMembers.map((member) => {
        const name = member.fullName ?? "Teammate";
        const isEditing = Boolean(member.isEditing);
        const cursorX = typeof member.cursorX === "number" ? member.cursorX : 0;
        const cursorY = typeof member.cursorY === "number" ? member.cursorY : 0;
        return (
          <div
            key={`cursor-${member.userId}`}
            className="absolute left-0 top-0 will-change-transform transition-transform duration-75 ease-out"
            style={{
              transform: `translate3d(${cursorX}px, ${cursorY}px, 0)`,
            }}
          >
            <div className="relative flex items-center gap-2">
              <div
                className={cn(
                  "relative rounded-full bg-primary/90 p-1 shadow-md",
                  isEditing && "ring-2 ring-primary/40",
                )}
              >
                {isEditing ? (
                  <span className="absolute -inset-1 rounded-full bg-primary/30 animate-ping" />
                ) : null}
                <Image
                  src={
                    member.avatarUrl
                      ? member.avatarUrl
                      : `/api/avatar/${encodeURIComponent(
                          member.userId,
                        )}?size=24`
                  }
                  alt={name}
                  width={16}
                  height={16}
                  unoptimized
                  className={cn(
                    "relative h-4 w-4 rounded-full border bg-background object-cover",
                    isEditing ? "border-primary" : "border-border/60",
                  )}
                />
              </div>
              <div className="relative rounded-full border border-border/60 bg-background/90 px-2 py-0.5 text-[11px] text-foreground shadow">
                <span className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border border-border/60 bg-background/90" />
                {name}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

"use client";

import Image from "next/image";
import { SlidersHorizontal } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PresenceMember } from "@/types/app-layout";

type AppHeaderProps = {
  slug?: string;
  latestEditLabel: string;
  onOpenHistory: () => void;
  onOpenPresence: () => void;
  onOpenSettings: () => void;
  activeMembers?: PresenceMember[];
};

export const AppHeader = ({
  slug,
  latestEditLabel,
  onOpenHistory,
  onOpenPresence,
  onOpenSettings,
  activeMembers,
}: AppHeaderProps) => {
  return (
    <header className="flex h-12 items-center justify-between px-4 border-b border-border/40 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2 min-w-0 text-sm text-muted-foreground">
        <SidebarTrigger />
        <div className="h-4 w-[1px] bg-border/70 mx-1" />
        <span className="truncate max-w-[28vw]">
          {slug ? `${slug.charAt(0).toUpperCase() + slug.slice(1)}` : "Home"}
        </span>
        <span className="opacity-40">/</span>
        <h1 className="text-sm font-semibold text-foreground truncate">
          {slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "Home"}
        </h1>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <button
          type="button"
          onClick={onOpenHistory}
          className="hidden sm:inline hover:text-foreground transition-colors"
        >
          {latestEditLabel}
        </button>
        <button
          type="button"
          onClick={onOpenPresence}
          className="hidden sm:flex items-center -space-x-2"
          aria-label="Open online members"
        >
          {activeMembers?.length ? (
            activeMembers.slice(0, 5).map((member) => {
              const initials = (member.fullName ?? member.userId)
                .split(" ")
                .map((part: string) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <div
                  key={member.userId}
                  className="group relative h-6 w-6 rounded-full border border-border/60 bg-background"
                >
                  {member.avatarUrl ? (
                    <Image
                      src={member.avatarUrl}
                      alt={member.fullName ?? "Team member"}
                      fill
                      unoptimized
                      className="absolute inset-0 h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 rounded-full bg-muted text-[10px] font-medium text-foreground flex items-center justify-center">
                      {initials}
                    </div>
                  )}
                  <div className="pointer-events-none absolute left-1/2 top-8 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-border/60 bg-background px-2 py-1 text-[11px] text-muted-foreground shadow-lg group-hover:block">
                    {(member.fullName ?? "Unknown").trim()} ·{" "}
                    {member.isEditing
                      ? `Editing ${member.editingTarget ?? ""}`.trim()
                      : member.activity ?? "Active"}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-[11px] text-muted-foreground">—</div>
          )}
        </button>
        {slug && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="hidden sm:flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={onOpenSettings}
                aria-label="Settings"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6}>
              Settings
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </header>
  );
};

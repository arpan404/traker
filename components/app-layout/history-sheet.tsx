"use client";

import Image from "next/image";
import type { RefObject } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { ActivityEvent } from "@/types/app-layout";

type HistorySheetProps = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  groupedHistory: [string, ActivityEvent[]][];
  historyScrollRef: RefObject<HTMLDivElement>;
  historyLabelForEvent: (event: ActivityEvent) => string;
  statusColorClass: (value?: string) => string;
  slug?: string;
  currentUserId?: string;
};

const HistorySheet = ({
  open,
  onOpenChange,
  groupedHistory,
  historyScrollRef,
  historyLabelForEvent,
  statusColorClass,
  slug,
  currentUserId,
}: HistorySheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="bg-background flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>History</SheetTitle>
          <SheetDescription>
            Recent changes and updates in this workspace.
          </SheetDescription>
        </SheetHeader>
        <div
          ref={historyScrollRef}
          className="px-4 pb-6 space-y-3 text-sm overflow-y-auto flex-1 min-h-0"
        >
          {groupedHistory.length ? (
            groupedHistory.map(([dayLabel, events]) => (
              <div key={dayLabel} className="space-y-2">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                  {dayLabel}
                </div>
                <div>
                  {events.map((event) => {
                    const actorName =
                      event.actor?.userId && event.actor.userId === currentUserId
                        ? "You"
                        : event.actor?.fullName ?? "Someone";
                    const entityTitle =
                      event.entity?.title ??
                      event.payload?.title ??
                      event.payload?.name ??
                      "item";
                    const entityType =
                      event.entity?.type ??
                      (event.type?.startsWith("ISSUE")
                        ? "Issue"
                        : event.type?.startsWith("TODO")
                          ? "Todo"
                          : event.type?.startsWith("PROJECT")
                            ? "Project"
                            : undefined);
                    const changeLabel =
                      event.change?.label ??
                      (event.type?.includes("STATUS") ? "Status" : undefined);
                    const changeFrom =
                      event.change?.from ?? event.payload?.from ?? undefined;
                    const changeTo =
                      event.change?.to ?? event.payload?.to ?? undefined;
                    const changeFields =
                      event.change?.fields ?? event.payload?.fields ?? [];
                    return (
                      <div
                        key={event._id}
                        className="flex items-start gap-3 py-4 border-b border-border/40 last:border-b-0"
                      >
                        <div className="h-8 w-8 rounded-full border border-border/60 bg-muted overflow-hidden">
                          {event.actor?.avatarUrl ? (
                            <Image
                              src={event.actor.avatarUrl}
                              alt={event.actor.fullName ?? "Member"}
                              width={32}
                              height={32}
                              unoptimized
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-foreground/70">
                              {(actorName ?? "U")
                                .split(" ")
                                .map((part: string) => part[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1 text-foreground">
                            <span className="font-semibold">{actorName}</span>
                            <span className="text-muted-foreground">
                              {historyLabelForEvent(event)}
                            </span>
                          </div>
                          {entityTitle ? (
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-foreground">
                                {entityTitle}
                              </span>
                              {entityType ? (
                                <span className="rounded-sm border border-border/40 px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                                  {entityType}
                                </span>
                              ) : null}
                              {event.entity?.key ? (
                                <span className="rounded-sm border border-border/40 px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                                  {event.entity.key}
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.createdAt).toLocaleString()}
                          </p>
                          {slug ? (
                            <p className="text-xs text-muted-foreground/70">
                              {slug}
                            </p>
                          ) : null}
                          {changeLabel && (changeFrom || changeTo) ? (
                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="uppercase tracking-wide">
                                {changeLabel}
                              </span>
                              <span
                                className={`rounded-sm border px-2 py-0.5 ${statusColorClass(
                                  changeFrom,
                                )}`}
                              >
                                {changeFrom ?? "—"}
                              </span>
                              <span className="text-muted-foreground">→</span>
                              <span
                                className={`rounded-sm border px-2 py-0.5 ${statusColorClass(
                                  changeTo,
                                )}`}
                              >
                                {changeTo ?? "—"}
                              </span>
                            </div>
                          ) : null}
                          {changeFields?.length ? (
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              {changeFields.map((field: string) => (
                                <span
                                  key={field}
                                  className="rounded-sm border border-border/40 px-2 py-0.5 uppercase"
                                >
                                  {field}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No activity yet.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export { HistorySheet };
export default HistorySheet;

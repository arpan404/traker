"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConvexAuth, useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { ActivityEvent } from "@/types/app-layout";
import type { Id } from "@/convex/_generated/dataModel";

const skip = "skip" as const;

type InviteRole = "ADMIN" | "MEMBER" | "VIEWER";

type PresenceOverride = {
  isEditing?: boolean;
  editingTarget?: string | null;
};

const usePresenceTracking = (
  teamId: Id<"teams"> | undefined,
  activityLabel: string,
  pathname: string | null,
) => {
  const heartbeat = useMutation(api.presence.heartbeat);
  const logTeamEvent = useMutation(api.activity.logTeamEvent);
  const cursorRef = useRef({ x: 0, y: 0 });
  const editingRef = useRef<{ isEditing: boolean; target?: string | null }>({
    isEditing: false,
    target: null,
  });
  const lastPresenceSentAt = useRef(0);

  const sendPresence = useCallback(
    async (override?: PresenceOverride) => {
      if (!teamId) return;
      try {
        await heartbeat({
          teamId,
          activity: activityLabel,
          location: pathname ?? "",
          cursorX: cursorRef.current.x,
          cursorY: cursorRef.current.y,
          isEditing:
            override?.isEditing ?? editingRef.current.isEditing ?? false,
          editingTarget:
            override?.editingTarget ?? editingRef.current.target ?? undefined,
        });
      } catch {
        // Ignore transient presence errors
      }
    },
    [teamId, heartbeat, activityLabel, pathname],
  );

  useEffect(() => {
    if (!teamId) return;
    void sendPresence();
    const interval = setInterval(() => {
      void sendPresence();
    }, 20_000);
    return () => {
      clearInterval(interval);
    };
  }, [teamId, sendPresence]);

  useEffect(() => {
    if (!teamId) return;
    const location = pathname ?? "";
    void logTeamEvent({
      teamId,
      type: "PAGE_VIEW",
      payload: {
        location,
        label: activityLabel,
      },
    });
  }, [teamId, logTeamEvent, pathname, activityLabel]);

  useEffect(() => {
    if (!teamId) return;
    let raf = 0;
    const onMove = (event: MouseEvent) => {
      cursorRef.current = { x: event.clientX, y: event.clientY };
      const now = Date.now();
      if (now - lastPresenceSentAt.current < 120) return;
      lastPresenceSentAt.current = now;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        void sendPresence();
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [teamId, sendPresence]);

  useEffect(() => {
    if (!teamId) return;
    const getEditingTarget = (element: HTMLElement | null) => {
      if (!element) return "unknown";
      return (
        element.getAttribute("data-editing-label") ??
        element.getAttribute("aria-label") ??
        element.getAttribute("name") ??
        element.getAttribute("placeholder") ??
        element.tagName.toLowerCase()
      );
    };
    const isEditableElement = (element: HTMLElement | null) => {
      if (!element) return false;
      if (element.isContentEditable) return true;
      if (element instanceof HTMLTextAreaElement) return true;
      if (element instanceof HTMLInputElement) {
        const type = element.type;
        return !["button", "submit", "checkbox", "radio"].includes(type);
      }
      return false;
    };
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (!isEditableElement(target)) return;
      editingRef.current = { isEditing: true, target: getEditingTarget(target) };
      void sendPresence({
        isEditing: true,
        editingTarget: editingRef.current.target ?? undefined,
      });
    };
    const handleFocusOut = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (!isEditableElement(target)) return;
      editingRef.current = { isEditing: false, target: null };
      void sendPresence({ isEditing: false, editingTarget: undefined });
    };
    const handleInput = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!isEditableElement(target)) return;
      editingRef.current = { isEditing: true, target: getEditingTarget(target) };
      void sendPresence({
        isEditing: true,
        editingTarget: editingRef.current.target ?? undefined,
      });
    };
    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);
    window.addEventListener("input", handleInput, true);
    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
      window.removeEventListener("input", handleInput, true);
    };
  }, [teamId, sendPresence]);
};

export const useAppLayoutModel = (userId?: string) => {
  const params = useParams();
  const slug = params.slug as string | undefined;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useConvexAuth();

  const team = useQuery(
    api.teams.getBySlug,
    slug && isAuthenticated ? { slug } : skip,
  );
  const activeMembers = useQuery(
    api.presence.listActive,
    team ? { teamId: team._id } : skip,
  );
  const members = useQuery(
    api.members.list,
    team ? { teamId: team._id } : skip,
  );

  const userMembership = useMemo(() => {
    if (!members || !userId) return undefined;
    return members.find((member) => member.userId === userId);
  }, [members, userId]);

  const isAdmin =
    userMembership?.role === "ADMIN" || userMembership?.role === "OWNER";

  const invites = useQuery(
    api.invites.list,
    team && isAdmin ? { teamId: team._id } : skip,
  );

  const historyPagination = usePaginatedQuery(
    api.activity.listTeamEventsWithMembers,
    team ? { teamId: team._id } : "skip",
    { initialNumItems: 10 },
  );
  const historyEvents = historyPagination.results as ActivityEvent[];

  const [historyOpen, setHistoryOpen] = useState(false);
  const initialSettingsOpen = searchParams?.get("settings") === "true";
  const [settingsOpen, setSettingsOpen] = useState(initialSettingsOpen);
  const [presenceOpen, setPresenceOpen] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("MEMBER");
  const [inviteLink, setInviteLink] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const historyScrollRef = useRef<HTMLDivElement | null>(null);

  const createInvite = useMutation(api.invites.create);
  const cancelInvite = useMutation(api.invites.cancel);

  const activityLabel = useMemo(() => {
    if (!pathname) return "Workspace";
    if (pathname.includes("/board")) return "Board";
    if (pathname.includes("/issues/")) return "Issue";
    if (pathname.includes("/todos")) return "Todos";
    if (pathname.includes("/settings")) return "Settings";
    if (pathname.includes("/team/")) return "Team";
    return "Workspace";
  }, [pathname]);

  usePresenceTracking(team?._id, activityLabel, pathname);

  const handleCreateInvite = useCallback(async () => {
    if (!team || !inviteEmail.trim()) return;
    setInviteError(null);
    setInviteLink("");
    try {
      const result = await createInvite({
        teamId: team._id,
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setInviteLink(`${origin}/invite?token=${result.token}`);
      setInviteEmail("");
    } catch (error) {
      setInviteError(
        error instanceof Error ? error.message : "Failed to create invite.",
      );
    }
  }, [team, inviteEmail, inviteRole, createInvite]);

  const handleCancelInvite = useCallback(
    async (inviteId: Id<"teamInvites">) => {
      if (!team) return;
      await cancelInvite({ inviteId });
    },
    [team, cancelInvite],
  );


  const latestEditLabel = useMemo(() => {
    const latest =
      historyEvents?.find((event) => event.type !== "PAGE_VIEW") ??
      historyEvents?.[0];
    if (!latest) return "Edited just now";
    const date = new Date(latest.createdAt);
    const dateLabel = date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    const timeLabel = date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    return `Edited ${dateLabel} ${timeLabel}`;
  }, [historyEvents]);

  const filteredHistory = useMemo(
    () => historyEvents?.filter((event) => event.type !== "PAGE_VIEW") ?? [],
    [historyEvents],
  );

  const groupedHistory = useMemo(() => {
    const groups = new Map<string, ActivityEvent[]>();
    for (const event of filteredHistory) {
      const day = new Date(event.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const list = groups.get(day) ?? [];
      list.push(event);
      groups.set(day, list);
    }
    return Array.from(groups.entries());
  }, [filteredHistory]);

  useEffect(() => {
    const el = historyScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (remaining < 200 && historyPagination.status === "CanLoadMore") {
        historyPagination.loadMore(10);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [historyPagination]);

  useEffect(() => {
    if (!historyOpen) return;
    const el = historyScrollRef.current;
    if (!el) return;
    if (historyPagination.status !== "CanLoadMore") return;
    const hasRoom = el.scrollHeight - el.clientHeight < 50;
    if (hasRoom) {
      historyPagination.loadMore(10);
    }
  }, [historyOpen, historyPagination.status, groupedHistory.length, historyPagination]);

  const historyLabelForEvent = (event: ActivityEvent) => {
    switch (event.type) {
      case "ISSUE_CREATED":
        return "created";
      case "ISSUE_UPDATED":
        return "edited";
      case "ISSUE_STATUS_CHANGED":
        return "changed status";
      case "ISSUE_COMMENTED":
        return "commented on";
      case "TODO_CREATED":
        return "created";
      case "TODO_UPDATED":
        return "edited";
      case "TODO_STATUS_CHANGED":
        return "changed status";
      case "PROJECT_CREATED":
        return "created";
      case "PAGE_VIEW":
        return "viewed";
      default:
        return "updated";
    }
  };

  const statusColorClass = (value?: string) => {
    if (!value) return "border-border/60 text-foreground";
    const normalized = value.toLowerCase();
    if (normalized.includes("backlog"))
      return "border-slate-500/40 text-slate-200 bg-slate-500/10";
    if (normalized.includes("open"))
      return "border-sky-500/40 text-sky-200 bg-sky-500/10";
    if (normalized.includes("progress"))
      return "border-amber-500/40 text-amber-200 bg-amber-500/10";
    if (normalized.includes("review"))
      return "border-purple-500/40 text-purple-200 bg-purple-500/10";
    if (normalized.includes("testing"))
      return "border-emerald-500/40 text-emerald-200 bg-emerald-500/10";
    if (normalized.includes("resolved") || normalized.includes("done"))
      return "border-green-500/40 text-green-200 bg-green-500/10";
    if (normalized.includes("won't") || normalized.includes("wont"))
      return "border-red-500/40 text-red-200 bg-red-500/10";
    return "border-border/60 text-foreground";
  };

  return {
    slug,
    pathname,
    team,
    activeMembers,
    members,
    userMembership,
    isAdmin,
    invites,
    historyPagination,
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
    handleCancelInvite,
    handleCreateInvite,
    latestEditLabel,
    groupedHistory,
    historyLabelForEvent,
    statusColorClass,
  };
};

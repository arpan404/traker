import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Columns, Globe, Inbox, User } from "lucide-react";

export const ISSUE_STATUSES = [
  "Untriaged",
  "Backlog",
  "Open",
  "In Progress",
  "Testing",
  "In Review",
  "Won’t Fix",
  "Resolved",
] as const;

export const ISSUE_PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;

export const ISSUE_TABS: {
  id: "kanban" | "all" | "mine" | "untriaged" | "completed";
  label: string;
  Icon: LucideIcon;
}[] = [
  { id: "kanban", label: "Kanban", Icon: Columns },
  { id: "all", label: "All Issues", Icon: Globe },
  { id: "mine", label: "My Issues", Icon: User },
  { id: "untriaged", label: "Untriaged", Icon: Inbox },
  { id: "completed", label: "Completed", Icon: CheckCircle2 },
];

export const TODO_STATUSES = ["Todo", "In Progress", "Done"] as const;

export const TODO_STATUS_TONE_TEAM = {
  Todo: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  "In Progress": "bg-[var(--accent-soft)] text-[var(--accent)]",
  Done: "bg-emerald-500/10 text-emerald-600",
} as const;

export const TODO_STATUS_TONE_PERSONAL = {
  Todo: "bg-[var(--status-grey)] text-[var(--status-grey-text)]",
  "In Progress": "bg-[var(--status-blue)] text-[var(--status-blue-text)]",
  Done: "bg-[var(--status-green)] text-[var(--status-green-text)]",
} as const;

export const ISSUE_DETAILS_SECTIONS = [
  "Summary",
  "Details",
  "Impact",
  "Steps Taken",
  "Next Steps",
] as const;

export const ISSUE_TAG_COLOR_PRESETS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
] as const;

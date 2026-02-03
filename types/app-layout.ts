export type PresenceMember = {
  userId: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  isEditing?: boolean | null;
  editingTarget?: string | null;
  activity?: string | null;
  cursorX?: number | null;
  cursorY?: number | null;
};

export type TeamMember = {
  _id: string;
  userId: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
};

import type { Id } from "@/convex/_generated/dataModel";

export type Invite = {
  _id: Id<"teamInvites">;
  email: string;
};

export type Project = {
  _id: string;
  key: string;
  name: string;
};

export type ActivityEvent = {
  _id: string;
  type: string;
  createdAt: number;
  actor?: {
    userId?: string | null;
    fullName?: string | null;
    avatarUrl?: string | null;
  } | null;
  entity?: {
    title?: string | null;
    key?: string | null;
    type?: string | null;
  } | null;
  payload?: {
    title?: string | null;
    name?: string | null;
    from?: string | null;
    to?: string | null;
    fields?: string[] | null;
  } | null;
  change?: {
    label?: string | null;
    from?: string | null;
    to?: string | null;
    fields?: string[] | null;
  } | null;
};

"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { DragEvent } from "react";
import { useMemo, useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const STATUSES = [
  "Backlog",
  "Open",
  "In Progress",
  "Testing",
  "In Review",
  "Won\u2019t Fix",
  "Resolved",
] as const;
type IssueStatus = (typeof STATUSES)[number];

const PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;
type IssuePriority = (typeof PRIORITIES)[number];

const STATUS_LABELS: { id: IssueStatus; label: string }[] = STATUSES.map(
  (status) => ({ id: status, label: status }),
);

export default function BoardPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { user } = useUser();
  const { isAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
  const skip = "skip" as const;
  const [view, setView] = useState<
    "kanban" | "all" | "mine" | "untriaged" | "completed"
  >("kanban");
  const team = useQuery(
    api.teams.getBySlug,
    slug && isAuthenticated ? { slug } : skip,
  );
  const members = useQuery(
    api.members.list,
    team ? { teamId: team._id } : skip,
  );
  const projects = useQuery(
    api.projects.list,
    team ? { teamId: team._id } : skip,
  );
  const labels = useQuery(
    api.labels.list,
    team ? { teamId: team._id } : skip,
  );
  const [filters, setFilters] = useState({
    projectId: "",
    assigneeId: "",
    priority: "",
    labelId: "",
    search: "",
  });
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState<{
    title: string;
    status: IssueStatus;
    priority: IssuePriority;
    assigneeId: string;
    projectId: Id<"projects"> | "";
  }>({
    title: "",
    status: "Backlog",
    priority: "Medium",
    assigneeId: "",
    projectId: "",
  });
  const issues = useQuery(
    api.issues.list,
    team
      ? {
          teamId: team._id,
          projectId: (filters.projectId || undefined) as
            | Id<"projects">
            | undefined,
          assigneeId: filters.assigneeId || undefined,
          priority: (filters.priority || undefined) as IssuePriority | undefined,
          labelId: (filters.labelId || undefined) as Id<"labels"> | undefined,
          search: filters.search || undefined,
        }
      : skip,
  );
  const moveIssue = useMutation(api.issues.move);
  const createIssue = useMutation(api.issues.create);

  const filteredIssues = useMemo(() => {
    const list = issues ?? [];
    if (view === "mine") {
      return list.filter((issue) => issue.assigneeId === user?.id);
    }
    if (view === "untriaged") {
      return list.filter((issue) => issue.status === "Backlog");
    }
    if (view === "completed") {
      return list.filter((issue) => issue.status === "Resolved");
    }
    return list;
  }, [issues, user?.id, view]);

  const issuesByStatus = useMemo(
    () =>
      STATUSES.reduce<Record<IssueStatus, typeof issues>>((acc, status) => {
        acc[status] = filteredIssues.filter((issue) => issue.status === status);
        return acc;
      }, {} as Record<IssueStatus, typeof issues>),
    [filteredIssues],
  );

  if (isConvexLoading || !isAuthenticated) {
    return (
      <section className="grid gap-6">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-sm backdrop-blur">
          <p className="text-sm text-slate-600">Connecting to board...</p>
        </div>
      </section>
    );
  }

  if (!team || !issues || !members || !projects || !labels) {
    return (
      <section className="grid gap-6">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-sm backdrop-blur">
          <p className="text-sm text-slate-600">Loading board...</p>
        </div>
      </section>
    );
  }

  const handleDrop = async (
    status: IssueStatus,
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    const issueId = event.dataTransfer.getData("text/plain") as Id<"issues">;
    if (!issueId) return;
    await moveIssue({ issueId, newStatus: status });
  };

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#2f3437]">
            {team.name} Board
          </h1>
          <p className="mt-1 text-sm text-[#6b6f73]">
            Track issues, triage quickly, and keep momentum visible.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-full border border-[#e6e6e3] bg-white px-3 py-1.5 text-xs text-[#6b6f73] shadow-[0_1px_0_rgba(0,0,0,0.04)]"
            value={filters.projectId}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, projectId: event.target.value }))
            }
          >
            <option value="">Project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.key}
              </option>
            ))}
          </select>
          <select
            className="rounded-full border border-[#e6e6e3] bg-white px-3 py-1.5 text-xs text-[#6b6f73] shadow-[0_1px_0_rgba(0,0,0,0.04)]"
            value={filters.assigneeId}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, assigneeId: event.target.value }))
            }
          >
            <option value="">Assignee</option>
            {members.map((member) => (
              <option key={member._id} value={member.userId}>
                {member.userId}
              </option>
            ))}
          </select>
          <select
            className="rounded-full border border-[#e6e6e3] bg-white px-3 py-1.5 text-xs text-[#6b6f73] shadow-[0_1px_0_rgba(0,0,0,0.04)]"
            value={filters.priority}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, priority: event.target.value }))
            }
          >
            <option value="">Priority</option>
            {["Low", "Medium", "High", "Urgent"].map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          <select
            className="rounded-full border border-[#e6e6e3] bg-white px-3 py-1.5 text-xs text-[#6b6f73] shadow-[0_1px_0_rgba(0,0,0,0.04)]"
            value={filters.labelId}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, labelId: event.target.value }))
            }
          >
            <option value="">Label</option>
            {labels.map((label) => (
              <option key={label._id} value={label._id}>
                {label.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Search issues"
            value={filters.search}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, search: event.target.value }))
            }
            className="w-48 rounded-full border border-[#e6e6e3] bg-white px-3 py-1.5 text-xs text-[#6b6f73] shadow-[0_1px_0_rgba(0,0,0,0.04)]"
          />
          <button
            className="rounded-full bg-[#2f3437] px-3.5 py-1.5 text-xs font-medium text-white shadow-[0_6px_20px_rgba(47,52,55,0.22)]"
            onClick={() => {
              setDraft({
                title: "",
                status: "Backlog",
                priority: "Medium",
                assigneeId: "",
                projectId: "",
              });
              setShowCreate(true);
            }}
          >
            + New issue
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "kanban", label: "Kanban" },
          { id: "all", label: "All Issues" },
          { id: "mine", label: "My Issues" },
          { id: "untriaged", label: "Untriaged" },
          { id: "completed", label: "Completed" },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              view === tab.id
                ? "bg-[#2f3437] text-white"
                : "border border-[#e6e6e3] bg-white text-[#6b6f73]"
            }`}
            onClick={() =>
              setView(
                tab.id as
                  | "kanban"
                  | "all"
                  | "mine"
                  | "untriaged"
                  | "completed",
              )
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {view === "kanban" ? (
        <div className="grid gap-3 overflow-auto pb-2">
          <div className="grid min-w-[1100px] grid-cols-7 gap-6">
            {STATUSES.map((status, index) => (
            <div
              key={status}
              className="flex min-h-[520px] flex-col rounded-md bg-transparent"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(status, event)}
            >
              <div
                className="flex items-center justify-between px-1"
                data-status={status}
              >
                <div className="flex items-center gap-2">
                  <span className="status-dot h-2 w-2 rounded-full" />
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a7d80]">
                    {status}
                  </h2>
                </div>
                <span className="text-xs text-[#9a9a97]">
                  {issuesByStatus[status].length}
                </span>
              </div>
              <div
                className="canvas-panel mt-3 flex flex-col gap-2 p-2"
                data-status={status}
              >
                {issuesByStatus[status].map((issue) => (
                  <button
                    key={issue._id}
                    className="status-card rounded-md border border-[#ededeb] bg-white px-3 py-2 text-left text-sm text-[#2f3437] shadow-[0_1px_0_rgba(0,0,0,0.04)] transition hover:bg-[#fafaf8] border-l-4"
                    onClick={() =>
                      router.push(
                        `/app/team/${team.slug}/issues/${issue._id}`,
                      )
                    }
                    draggable
                    onDragStart={(event) =>
                      event.dataTransfer.setData("text/plain", issue._id)
                    }
                    data-status={status}
                  >
                    <p className="font-medium">{issue.title}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-[#9a9a97]">
                      <span>{issue.priority}</span>
                      <span>{issue.assigneeId ?? "Unassigned"}</span>
                    </div>
                  </button>
                ))}
                <button
                  className="rounded-md border border-dashed border-[#d9d9d6] px-3 py-2 text-xs text-[#9a9a97] hover:bg-white/60"
                  onClick={() => {
                    setDraft((prev) => ({
                      ...prev,
                      status,
                    }));
                    setShowCreate(true);
                  }}
                >
                  + New issue
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      ) : (
          <div className="canvas-panel">
            <div className="grid grid-cols-[minmax(220px,_2fr)_1fr_1fr_1fr_1fr] gap-3 border-b border-[#e9e9e7] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a9a97]">
              <span>Issue</span>
              <span>Status</span>
              <span>Priority</span>
              <span>Assignee</span>
              <span>Project</span>
            </div>
            <div className="divide-y divide-[#ededeb]">
            {filteredIssues.length === 0 ? (
              <div className="px-4 py-6 text-sm text-[#9a9a97]">
                No issues in this view.
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <button
                  key={issue._id}
                  className="grid w-full grid-cols-[minmax(220px,_2fr)_1fr_1fr_1fr_1fr] gap-3 px-4 py-3 text-left text-sm text-[#2f3437] hover:bg-[#fafaf8]"
                  onClick={() =>
                    router.push(`/app/team/${team.slug}/issues/${issue._id}`)
                  }
                  data-status={issue.status}
                >
                  <span className="font-medium">{issue.title}</span>
                  <span className="text-xs">
                    <span className="status-pill inline-flex items-center rounded-full px-2 py-0.5 text-[11px]">
                      {issue.status}
                    </span>
                  </span>
                  <span className="text-xs text-[#6b6f73]">
                    {issue.priority}
                  </span>
                  <span className="text-xs text-[#6b6f73]">
                    {issue.assigneeId ?? "Unassigned"}
                  </span>
                  <span className="text-xs text-[#6b6f73]">
                    {issue.projectId ?? "None"}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {showCreate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-lg rounded-lg border border-[#e9e9e7] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#2f3437]">New Issue</h2>
              <button
                className="rounded-md border border-[#e9e9e7] px-3 py-1 text-xs text-[#6b6f73]"
                onClick={() => setShowCreate(false)}
              >
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-xs text-[#6b6f73]">
                Title
                <input
                  className="rounded-md border border-[#e9e9e7] px-3 py-2 text-sm text-[#2f3437]"
                  value={draft.title}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Describe the issue"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-xs text-[#6b6f73]">
                  Status
                  <select
                    className="rounded-md border border-[#e9e9e7] bg-white px-2 py-2 text-xs text-[#2f3437]"
                    value={draft.status}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        status: event.target.value as IssueStatus,
                      }))
                    }
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-xs text-[#6b6f73]">
                  Priority
                  <select
                    className="rounded-md border border-[#e9e9e7] bg-white px-2 py-2 text-xs text-[#2f3437]"
                    value={draft.priority}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        priority: event.target.value as IssuePriority,
                      }))
                    }
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-xs text-[#6b6f73]">
                  Assignee
                  <select
                    className="rounded-md border border-[#e9e9e7] bg-white px-2 py-2 text-xs text-[#2f3437]"
                    value={draft.assigneeId}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        assigneeId: event.target.value,
                      }))
                    }
                  >
                    <option value="">Unassigned</option>
                    {members.map((member) => (
                      <option key={member._id} value={member.userId}>
                        {member.userId}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-xs text-[#6b6f73]">
                  Project
                  <select
                    className="rounded-md border border-[#e9e9e7] bg-white px-2 py-2 text-xs text-[#2f3437]"
                    value={draft.projectId}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        projectId: event.target.value as Id<"projects"> | "",
                      }))
                    }
                  >
                    <option value="">None</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.key}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                className="rounded-md border border-[#e9e9e7] px-4 py-2 text-xs text-[#6b6f73]"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-[#2f3437] px-4 py-2 text-xs font-medium text-white"
                onClick={async () => {
                  if (!draft.title.trim()) return;
                  const issueId = await createIssue({
                    teamId: team._id,
                    title: draft.title.trim(),
                    status: draft.status,
                    priority: draft.priority,
                    assigneeId: draft.assigneeId || undefined,
                    projectId: (draft.projectId || undefined) as
                      | Id<"projects">
                      | undefined,
                  });
                  setShowCreate(false);
                  router.push(`/app/team/${team.slug}/issues/${issueId}`);
                }}
              >
                Create issue
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

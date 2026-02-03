import type { BoardView, Label, Member, Project } from "@/lib/types";
import { ISSUE_PRIORITIES, ISSUE_TABS } from "@/lib/constants";
import { Filter, Search, SortAsc } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BoardHeaderProps {
  view: BoardView;
  onViewChange: (view: BoardView) => void;
  onNewIssue: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: "order" | "updated" | "created" | "priority";
  onSortChange: (value: "order" | "updated" | "created" | "priority") => void;
  filters: {
    projectId: string;
    assigneeId: string;
    priority: string;
    labelId: string;
  };
  onFilterChange: (patch: Partial<BoardHeaderProps["filters"]>) => void;
  members: Member[];
  projects: Project[];
  labels: Label[];
}

export function BoardHeader({
  view,
  onViewChange,
  onNewIssue,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  filters,
  onFilterChange,
  members,
  projects,
  labels,
}: BoardHeaderProps) {
  return (
    <div className="flex flex-col gap-6 mb-8">
      <div className="flex items-start gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--status-red)] text-white shrink-0 shadow-lg shadow-[var(--status-red)]/20">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] truncate">
            Issue Tracking
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Easily manage issues and feedback to ensure timely resolutions.
          </p>
        </div>
      </div>

        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {ISSUE_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors shrink-0 ${
                view === tab.id
                  ? "bg-[var(--muted)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50"
              }`}
              onClick={() => onViewChange(tab.id)}
            >
              <tab.Icon className="h-3.5 w-3.5 opacity-70" />
              {tab.label}
            </button>
          ))}
            </div>
            <div className="flex items-center gap-4 text-[var(--muted-foreground)] ml-4 shrink-0">
              <div className="hidden sm:flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-md border border-[var(--border)] p-1.5 hover:bg-[var(--muted)] transition-colors">
                      <Search className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[240px] p-2">
                    <Input
                      value={search}
                      onChange={(event) => onSearchChange(event.target.value)}
                      placeholder="Search issues..."
                      className="h-8 text-xs"
                    />
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-md border border-[var(--border)] p-1.5 hover:bg-[var(--muted)] transition-colors">
                      <SortAsc className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onSortChange("order")}>
                      Default order
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSortChange("updated")}>
                      Recently updated
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSortChange("created")}>
                      Recently created
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSortChange("priority")}>
                      Priority
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-md border border-[var(--border)] p-1.5 hover:bg-[var(--muted)] transition-colors">
                      <Filter className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[260px] p-2 space-y-2">
                    <Select
                      value={filters.projectId || "all"}
                      onValueChange={(value) =>
                        onFilterChange({
                          projectId: value === "all" ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs bg-transparent">
                        <SelectValue placeholder="Project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All projects</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project._id} value={project._id}>
                            {project.key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={filters.assigneeId || "all"}
                      onValueChange={(value) =>
                        onFilterChange({
                          assigneeId: value === "all" ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs bg-transparent">
                        <SelectValue placeholder="Assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All assignees</SelectItem>
                        {members.map((member) => (
                          <SelectItem key={member.userId} value={member.userId}>
                            {member.fullName ?? member.userId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={filters.priority || "all"}
                      onValueChange={(value) =>
                        onFilterChange({
                          priority: value === "all" ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs bg-transparent">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All priorities</SelectItem>
                        {ISSUE_PRIORITIES.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={filters.labelId || "all"}
                      onValueChange={(value) =>
                        onFilterChange({
                          labelId: value === "all" ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs bg-transparent">
                        <SelectValue placeholder="Label" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All labels</SelectItem>
                        {labels.map((label) => (
                          <SelectItem key={label._id} value={label._id}>
                            {label.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)]">
                <button
                  className="rounded-md border border-[var(--border)] px-2 py-1 hover:bg-[var(--muted)] transition-colors"
                  onClick={onZoomOut}
                >
                  -
                </button>
                <button
                  className="rounded-md border border-[var(--border)] px-2 py-1 hover:bg-[var(--muted)] transition-colors"
                  onClick={onZoomReset}
                  title="Reset zoom"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  className="rounded-md border border-[var(--border)] px-2 py-1 hover:bg-[var(--muted)] transition-colors"
                  onClick={onZoomIn}
                >
                  +
                </button>
              </div>
              <button
                className="glass-panel flex items-center gap-2 bg-[var(--accent)]/80 hover:bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95 border-white/20"
                onClick={onNewIssue}
              >
            New
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
          <button className="text-sm font-bold opacity-50 hover:opacity-100 transition-opacity">
            •••
          </button>
        </div>
      </div>
    </div>
  );
}

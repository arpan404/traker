import type { Doc, Id } from "@/convex/_generated/dataModel";
import type {
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
  ISSUE_TABS,
  TODO_STATUSES,
} from "@/lib/constants";

export type IssueStatus = (typeof ISSUE_STATUSES)[number];
export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];
export type BoardView = (typeof ISSUE_TABS)[number]["id"];
export type TodoStatus = (typeof TODO_STATUSES)[number];

export type Issue = Doc<"issues"> & { commentCount?: number };
export type Member = Doc<"teamMembers">;
export type Project = Doc<"projects">;
export type Label = Doc<"labels">;
export type IssueLabel = Doc<"issueLabels">;
export type Todo = Doc<"todos">;

export type BoardFilters = {
  projectId: string;
  assigneeId: string;
  priority: string;
  labelId: string;
  search: string;
};

export type IssueDraft = {
  title: string;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeId: string;
  projectId: Id<"projects"> | "";
};

export type TeamTodoFilters = {
  status: string;
  assigneeId: string;
  search: string;
};

export type PersonalTodoFilters = {
  status: string;
  search: string;
};

export type TeamTodoDraft = {
  title: string;
  assigneeId: string;
  dueDate: string;
};

export type PersonalTodoDraft = {
  title: string;
  dueDate: string;
  status: TodoStatus;
};

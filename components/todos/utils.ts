import type { TodoStatus } from "@/lib/types";

export const todoStatusData = (status: TodoStatus) =>
  status === "Todo" ? "Open" : status === "In Progress" ? "In Progress" : "Resolved";

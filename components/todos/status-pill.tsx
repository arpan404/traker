import type { TodoStatus } from "@/lib/types";
import { todoStatusData } from "./utils";
import { cn } from "@/lib/utils";

interface TodoStatusPillProps {
  status: TodoStatus;
  className?: string;
}

export function TodoStatusPill({ status, className }: TodoStatusPillProps) {
  return (
    <span
      className={cn("status-pill", className)}
      data-status={todoStatusData(status)}
    >
      {status}
    </span>
  );
}

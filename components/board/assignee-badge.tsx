import type { Member } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AssigneeBadgeProps {
  member?: Member;
  fallbackInitial?: string;
}

export function AssigneeBadge({ member, fallbackInitial }: AssigneeBadgeProps) {
  const initial = member?.fullName?.substring(0, 1) || fallbackInitial || "?";

  return (
    <Avatar className="h-4 w-4">
      <AvatarImage src={member?.avatarUrl} alt={member?.fullName ?? ""} />
      <AvatarFallback className="text-[9px] font-semibold text-[var(--foreground)]">
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}

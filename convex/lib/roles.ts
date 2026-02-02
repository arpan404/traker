import type { Role } from "./validators";

const ROLE_RANK: Record<Role, number> = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
};

export const isRoleAtLeast = (role: Role, minimum: Role) =>
  ROLE_RANK[role] >= ROLE_RANK[minimum];

"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";

export default function TeamSettingsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { isAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
  const skip = "skip" as const;
  const team = useQuery(
    api.teams.getBySlug,
    slug && isAuthenticated ? { slug } : skip,
  );
  const members = useQuery(
    api.members.list,
    team && isAuthenticated ? { teamId: team._id } : skip,
  );
  const invites = useQuery(
    api.invites.list,
    team && isAuthenticated ? { teamId: team._id } : skip,
  );
  const projects = useQuery(
    api.projects.list,
    team && isAuthenticated ? { teamId: team._id } : skip,
  );

  if (isConvexLoading || !isAuthenticated) {
    return (
      <section className="grid gap-6">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-sm backdrop-blur">
          <p className="text-sm text-slate-600">Connecting to settings...</p>
        </div>
      </section>
    );
  }

  if (!team || !members || !invites || !projects) {
    return (
      <section className="grid gap-6">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-sm backdrop-blur">
          <p className="text-sm text-slate-600">Loading settings...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-[#2f3437]">Team Settings</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#6b6f73]">
          Manage members, invites, and projects.
        </p>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-[#e9e9e7] bg-white p-5">
          <h2 className="text-base font-semibold text-[#2f3437]">Members</h2>
          <p className="mt-2 text-sm text-[#6b6f73]">
            {members.length} members in this team.
          </p>
          <div className="mt-4 grid gap-2 text-xs text-[#6b6f73]">
            {members.slice(0, 4).map((member) => (
              <p key={member._id}>
                {member.userId} · {member.role}
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-[#e9e9e7] bg-white p-5">
          <h2 className="text-base font-semibold text-[#2f3437]">Invites</h2>
          <p className="mt-2 text-sm text-[#6b6f73]">
            {invites.length} pending invites.
          </p>
          <div className="mt-4 grid gap-2 text-xs text-[#6b6f73]">
            {invites.slice(0, 3).map((invite) => (
              <p key={invite._id}>{invite.email}</p>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-[#e9e9e7] bg-white p-5">
          <h2 className="text-base font-semibold text-[#2f3437]">Projects</h2>
          <p className="mt-2 text-sm text-[#6b6f73]">
            {projects.length} active projects.
          </p>
          <div className="mt-4 grid gap-2 text-xs text-[#6b6f73]">
            {projects.slice(0, 4).map((project) => (
              <p key={project._id}>
                {project.key} · {project.name}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

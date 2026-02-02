"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useMemo, useState } from "react";

export default function AppIndexPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { isAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
  const skip = "skip" as const;
  const createTeam = useMutation(api.teams.create);
  const [showCreate, setShowCreate] = useState(false);
  const [teamName, setTeamName] = useState("");
  const teams = useQuery(
    api.teams.listForUser,
    isLoaded && isSignedIn && isAuthenticated ? {} : skip,
  );
  const existingSlugs = useMemo(
    () =>
      (teams ?? [])
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
        .map((entry) => entry.team.slug),
    [teams],
  );

  const handleCreateTeam = async () => {
    const name = teamName.trim();
    if (!name) return;
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    let slug = base || "team";
    let suffix = 1;
    while (existingSlugs.includes(slug)) {
      slug = `${base || "team"}-${suffix}`;
      suffix += 1;
    }
    const teamId = await createTeam({ name, slug });
    const created = teams
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .find((entry) => entry.team._id === teamId);
    setShowCreate(false);
    setTeamName("");
    if (created) {
      router.push(`/app/team/${created.team.slug}/board`);
      return;
    }
    router.push(`/app/team/${slug}/board`);
  };

  if (!isLoaded) {
    return (
      <section className="grid gap-6">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-sm backdrop-blur">
          <p className="text-sm text-slate-600">Checking session...</p>
        </div>
      </section>
    );
  }

  if (!isSignedIn) {
    return (
      <section className="grid gap-6">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-sm backdrop-blur">
          <p className="text-sm text-slate-600">Please sign in to continue.</p>
        </div>
      </section>
    );
  }

  if (isConvexLoading || !isAuthenticated) {
    return (
      <section className="grid gap-6">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-sm backdrop-blur">
          <p className="text-sm text-slate-600">
            Connecting to workspace...
          </p>
        </div>
      </section>
    );
  }

  if (!teams) {
    return (
      <section className="grid gap-6">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-sm backdrop-blur">
          <p className="text-sm text-slate-600">Loading teams...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-[#2f3437]">
          Pick a team to get started
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#6b6f73]">
          Choose a workspace or create a new one.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {teams
          .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
          .map((entry) => (
          <button
            key={entry.team._id}
            className="group flex items-center justify-between rounded-lg border border-[#e9e9e7] bg-white px-4 py-3 text-left text-sm text-[#2f3437] shadow-[0_1px_0_rgba(0,0,0,0.04)] transition hover:bg-[#fbfbfa]"
            onClick={() => router.push(`/app/team/${entry.team.slug}/board`)}
          >
            <div>
              <p className="font-medium">{entry.team.name}</p>
              <p className="mt-1 text-xs text-[#9a9a97]">Role: {entry.role}</p>
            </div>
            <span className="rounded-full border border-[#e6e6e3] bg-[#f7f7f5] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#9a9a97]">
              Open
            </span>
          </button>
        ))}
        <button
          className="rounded-lg border border-dashed border-[#d9d9d6] bg-white px-4 py-3 text-left text-sm text-[#6b6f73] hover:bg-[#fbfbfa]"
          onClick={() => setShowCreate(true)}
        >
          + Create new team
        </button>
      </div>
      {showCreate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-lg rounded-lg border border-[#e9e9e7] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#2f3437]">
                Create Team
              </h2>
              <button
                className="rounded-md border border-[#e9e9e7] px-3 py-1 text-xs text-[#6b6f73]"
                onClick={() => setShowCreate(false)}
              >
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-xs text-[#6b6f73]">
                Team name
                <input
                  className="rounded-md border border-[#e9e9e7] px-3 py-2 text-sm text-[#2f3437]"
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                  placeholder="Acme Product"
                />
              </label>
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
                onClick={handleCreateTeam}
              >
                Create team
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

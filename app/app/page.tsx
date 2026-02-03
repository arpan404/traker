"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useMemo, useState } from "react";
import { Loader } from "@/components/ui/loader";

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
    const created = (teams ?? [])
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

  if (
    !isLoaded ||
    !isSignedIn ||
    isConvexLoading ||
    !isAuthenticated ||
    !teams
  ) {
    return <Loader centered size="lg" />;
  }

  return (
    <section className="grid gap-6 w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Pick a team to get started
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Choose a workspace or create a new one.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams
          .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
          .map((entry) => (
            <button
              key={entry.team._id}
              className="glass-panel group flex flex-col justify-between p-5 text-left transition-all hover:shadow-xl hover:border-[var(--accent)] hover:-translate-y-1"
              onClick={() => router.push(`/app/team/${entry.team.slug}/board`)}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-8 w-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] font-bold text-xs">
                    {entry.team.name.substring(0, 1).toUpperCase()}
                  </div>
                  <span className="rounded-full border border-[var(--border)] bg-[var(--muted)] px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider text-[var(--muted-foreground)]">
                    Active
                  </span>
                </div>
                <p className="font-bold text-[var(--foreground)]">
                  {entry.team.name}
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Role: {entry.role}
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                Open Workspace →
              </div>
            </button>
          ))}
        <button
          className="glass-panel group flex flex-col items-center justify-center p-5 text-center transition-all hover:shadow-xl hover:border-white/20 active:scale-95 border-2 border-dashed border-white/5 bg-transparent"
          onClick={() => setShowCreate(true)}
        >
          <div className="flex flex-col h-full justify-center items-center">
            <span className="text-3xl text-[var(--muted-foreground)] group-hover:scale-125 transition-transform group-hover:text-[var(--accent)] font-light">
              +
            </span>
            <span className="mt-2 text-sm font-semibold text-[var(--muted-foreground)] opacity-70 group-hover:opacity-100">
              Create new team
            </span>
          </div>
        </button>
      </div>
      {showCreate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md px-4">
          <div className="glass-panel w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                Create Team
              </h2>
              <button
                className="rounded-md hover:bg-[var(--muted)] p-1 transition-colors text-[var(--muted-foreground)]"
                onClick={() => setShowCreate(false)}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="grid gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Team name
                </label>
                <input
                  className="glass-panel w-full px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-all placeholder:opacity-30 border-white/5 shadow-inner"
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                  placeholder="Acme Product"
                  autoFocus
                />
              </div>
            </div>
            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                className="rounded-md px-4 py-2 text-sm font-semibold text-[var(--muted-foreground)] hover:bg-white/5 transition-colors"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button
                className="glass-panel bg-[var(--accent)]/80 hover:bg-[var(--accent)] px-6 py-2 text-sm font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95 border-white/20 disabled:opacity-50 disabled:hover:scale-100"
                disabled={!teamName.trim()}
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

"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const skip = "skip" as const;
  const invite = useQuery(
    api.invites.validate,
    token ? { token } : skip,
  );
  const acceptInvite = useMutation(api.invites.accept);
  const [status, setStatus] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!token) return;
    const result = await acceptInvite({ token });
    if (result.status === "accepted" && result.teamId) {
      setStatus("accepted");
      if (result.teamSlug) {
        router.push(`/app/team/${result.teamSlug}/board`);
        return;
      }
      router.push("/app");
      return;
    }
    setStatus(result.status);
  };

  if (!invite) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fef3c7,_#fde68a_35%,_#fbbf24_100%)] px-6 py-12">
        <div className="mx-auto max-w-xl rounded-3xl border border-white/60 bg-white/80 p-8 shadow-lg backdrop-blur">
          <p className="text-sm text-slate-600">Loading invite...</p>
        </div>
      </div>
    );
  }

  if (!invite.valid) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fef3c7,_#fde68a_35%,_#fbbf24_100%)] px-6 py-12">
        <div className="mx-auto max-w-xl rounded-3xl border border-white/60 bg-white/80 p-8 shadow-lg backdrop-blur">
          <h1 className="text-2xl font-semibold text-slate-900">
            Invite link invalid
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            This invite link is {invite.reason}. Ask your admin for a new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] px-6 py-12">
      <div className="mx-auto max-w-xl rounded-lg border border-[#e9e9e7] bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a9a97]">
          Team Invite
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-[#2f3437]">
          You\u2019re invited to join {invite.teamName ?? "a team"}
        </h1>
        <p className="mt-2 text-sm text-[#6b6f73]">
          Sign in to accept the invite and start collaborating.
        </p>
        <div className="mt-6 grid gap-3">
          <button
            className="rounded-md bg-[#2f3437] px-4 py-2 text-sm font-medium text-white"
            onClick={handleAccept}
          >
            Accept invite
          </button>
          <button className="rounded-md border border-[#e9e9e7] bg-white px-4 py-2 text-sm font-medium text-[#6b6f73]">
            Decline
          </button>
          {status ? (
            <p className="text-xs text-[#9a9a97]">Status: {status}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

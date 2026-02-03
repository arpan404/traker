"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

function InvitePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const skip = "skip" as const;
  const invite = useQuery(api.invites.validate, token ? { token } : skip);
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
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Validating invite...</CardTitle>
            <CardDescription>
              Please wait while we check the invite details.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invite.valid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
        <Card className="w-full max-w-md border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">
              Invite Link Invalid
            </CardTitle>
            <CardDescription>
              This invite link is {invite.reason}. Please ask your admin for a
              new one.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/app")}
            >
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Team Invite
          </div>
          <CardTitle>Join {invite.teamName ?? "Team"}</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join <strong>{invite.teamName}</strong>.
            Sign in to accept the invite and start collaborating.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status && (
            <div className="mb-4 rounded-md bg-muted p-3 text-sm text-muted-foreground">
              Status: {status}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full" onClick={handleAccept} size="lg">
            Accept Invite
          </Button>
          <Button variant="outline" className="w-full">
            Decline
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Loading invite...</CardTitle>
              <CardDescription>Preparing the invite details.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <InvitePageInner />
    </Suspense>
  );
}

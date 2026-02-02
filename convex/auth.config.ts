import type { AuthConfig } from "convex/server";

const clerkIssuer = process.env.CLERK_JWT_ISSUER_DOMAIN;
if (!clerkIssuer) {
  throw new Error("Missing CLERK_JWT_ISSUER_DOMAIN");
}

export default {
  providers: [
    {
      domain: clerkIssuer || "https://clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;

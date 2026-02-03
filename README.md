# Traker

A collaborative issue + todo tracker built with Next.js, Convex, and Clerk.

## Features
- Issue tracking (kanban + table)
- Team + personal todos
- Presence + activity history
- Team invites
- Inline comments

## Quick Start

```bash
npm install
npx convex dev
npm run dev
```

Open `http://localhost:3000`.

## Environment Setup

Create a `.env.local` with at least:

```
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

## Clerk + Convex Auth Setup

Follow the official guide to connect Clerk with Convex:

https://docs.convex.dev/auth/clerk

## Scripts

- `npm run dev` – Next.js dev server
- `npm run lint` – ESLint
- `npx convex dev` – Convex dev server + codegen

## Notes

If you add new Convex functions, re-run `npx convex dev` (or deploy) so the API updates.

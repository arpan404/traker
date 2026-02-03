"use client";

import * as React from "react";
import {
  Settings,
  LayoutDashboard,
  UserSquare2,
  ChevronsUpDown,
  Check,
  ListChecks,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slug = params.slug as string | undefined;
  const settingsOpen = searchParams?.get("settings") === "true";

  const teams = useQuery(api.teams.listForUser, isUserLoaded ? {} : "skip");
  const activeSlug = slug ?? teams?.[0]?.team.slug;

  return (
    <Sidebar {...props} className="">
      <div className="glass-panel h-full flex flex-col border-none rounded-none shadow-none">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <span className="font-bold">W</span>
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-semibold">Workspace</span>
                      <span className="">{user?.fullName}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width]"
                  align="start"
                >
                  {teams?.map(
                    (entry) =>
                      entry && (
                        <DropdownMenuItem key={entry.team._id} asChild>
                          <Link
                            href={`/app/team/${entry.team.slug}/board`}
                            className="flex items-center justify-between gap-3"
                          >
                            <span>{entry.team.name}</span>
                            {entry.team.slug === activeSlug ? (
                              <Check className="h-4 w-4 text-[var(--accent)]" />
                            ) : null}
                          </Link>
                        </DropdownMenuItem>
                      ),
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/app">Switch Workspace</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Shared</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      !!activeSlug &&
                      pathname?.includes(`/team/${activeSlug}/board`)
                    }
                  >
                    <Link
                      href={
                        activeSlug ? `/app/team/${activeSlug}/board` : "/app"
                      }
                    >
                      <LayoutDashboard />
                      <span>Board</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      !!activeSlug &&
                      pathname?.includes(`/team/${activeSlug}/todos`)
                    }
                  >
                    <Link
                      href={
                        activeSlug ? `/app/team/${activeSlug}/todos` : "/app"
                      }
                    >
                      <ListChecks />
                      <span>Team Todos</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      !!activeSlug &&
                      pathname?.includes(`/team/${activeSlug}/board`) &&
                      settingsOpen
                    }
                  >
                    <Link
                      href={
                        activeSlug
                          ? `/app/team/${activeSlug}/board?settings=true`
                          : "/app"
                      }
                    >
                      <Settings />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Private</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname?.startsWith("/app/me/todos")}
                  >
                    <Link href="/app/me/todos">
                      <UserSquare2 />
                      <span>My Todos</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarSeparator />
          <div className="p-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground pl-2">Theme</span>
            <ThemeToggle />
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user?.imageUrl}
                        alt={user?.fullName || ""}
                      />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.fullName}
                      </span>
                      <span className="truncate text-xs">
                        {user?.primaryEmailAddress?.emailAddress}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem onClick={() => openUserProfile()}>
                    Manage account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut({ redirectUrl: "/" })}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </div>
    </Sidebar>
  );
}

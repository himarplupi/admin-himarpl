"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Users2, Waypoints } from "lucide-react";

import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Image from "next/image";
import { Nav } from "@/components/common/nav";
import { abbreviation, cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoHIMARPL } from "@/components/common/logo-himarpl";
import { useTheme } from "next-themes";
import { ModeToggle } from "./mode-toggle";

import LogoHIMARPLLight from "@/images/logo-himarpl-light.png";
import LogoHIMARPLDark from "@/images/logo-himarpl-dark.png";
import { api } from "@/trpc/react";
import type { Session } from "next-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

import { ReactLenis } from "lenis/react";

interface DashboardProps {
  session: Session | null;
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
  children: React.ReactNode;
}

const hideOnRoutes = ["/login"];

export function NavDesktop({
  session,
  defaultLayout = [265, 1095],
  defaultCollapsed = false,
  navCollapsedSize,
  children,
}: DashboardProps) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const departmentQuery = api.department.count.useQuery();
  const userQuery = api.user.count.useQuery();

  return !hideOnRoutes.includes(pathname) ? (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            sizes,
          )}`;
        }}
        className="h-full max-h-screen items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={20}
          onCollapse={() => {
            setIsCollapsed(true);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              true,
            )}`;
          }}
          onExpand={() => {
            setIsCollapsed(false);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              false,
            )}`;
          }}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out",
          )}
        >
          <div className="flex min-h-screen flex-col justify-between py-2">
            <div>
              {isCollapsed && (
                <div className="flex items-center justify-center">
                  <LogoHIMARPL />
                </div>
              )}
              {!isCollapsed && (
                <div className="flex items-center px-2">
                  <Image
                    src={
                      resolvedTheme === "dark"
                        ? LogoHIMARPLDark
                        : LogoHIMARPLLight
                    }
                    alt="HIMARPL"
                    width={200}
                  />
                </div>
              )}

              <Separator />

              <Nav
                isCollapsed={isCollapsed}
                links={[
                  {
                    title: "Dashboard",
                    label: "",
                    icon: LayoutDashboard,
                    href: "/",
                    variant: pathname === "/" ? "default" : "ghost",
                  },
                  {
                    title: "Pengurus",
                    label: userQuery.data?.toString() ?? "",
                    icon: Users2,
                    href: "/users/" + new Date().getFullYear(),
                    variant: pathname.includes("/users") ? "default" : "ghost",
                  },
                  {
                    title: "Departemen",
                    label: departmentQuery.data?.toString() ?? "",
                    icon: Waypoints,
                    href: "/departments",
                    variant: pathname === "/departments" ? "default" : "ghost",
                  },
                ]}
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <div
                className={cn(
                  "flex items-center justify-center",
                  isCollapsed ? "px-1" : "px-2",
                )}
              >
                <ModeToggle isCollapsed={isCollapsed} />
              </div>
              <div
                className={cn(
                  "flex items-center",
                  isCollapsed ? "justify-center px-1" : "justify-start px-2",
                )}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          className="scale-125 object-cover object-center"
                          src={session?.user.image ?? ""}
                        />
                        <AvatarFallback>
                          {abbreviation(session?.user.name)}
                        </AvatarFallback>
                      </Avatar>

                      {!isCollapsed && (
                        <span className="ml-2 truncate">
                          {session?.user.name}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>{session?.user.name}</DropdownMenuLabel>

                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => signOut()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={defaultLayout[1]}>
          <ReactLenis className="h-screen overflow-y-auto">
            {children}
          </ReactLenis>
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  ) : (
    children
  );
}

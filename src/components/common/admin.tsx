"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users2, Waypoints } from "lucide-react";

import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Image from "next/image";
import { Nav } from "@/components/common/nav";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { LogoHIMARPL } from "@/components/common/logo-himarpl";
import { useTheme } from "next-themes";
import { ModeToggle } from "./mode-toggle";

import LogoHIMARPLLight from "@/images/logo-himarpl-light.png";
import LogoHIMARPLDark from "@/images/logo-himarpl-dark.png";

interface DashboardProps {
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
  children: React.ReactNode;
}

const hideOnRoutes = ["/login"];

export function Admin({
  defaultLayout = [265, 1095],
  defaultCollapsed = false,
  navCollapsedSize,
  children,
}: DashboardProps) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  return !hideOnRoutes.includes(pathname) ? (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            sizes,
          )}`;
        }}
        className="h-full max-h-[800px] items-stretch"
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
                    label: "",
                    icon: Users2,
                    href: "/users",
                    variant: pathname === "/users" ? "default" : "ghost",
                  },
                  {
                    title: "Departemen",
                    label: "",
                    icon: Waypoints,
                    href: "/departments",
                    variant: pathname === "/departments" ? "default" : "ghost",
                  },
                ]}
              />
            </div>

            <div>
              <div
                className={cn(
                  "flex items-center justify-center",
                  isCollapsed ? "px-1" : "px-2",
                )}
              >
                <ModeToggle isCollapsed={isCollapsed} />
              </div>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={defaultLayout[1]}>
          {children}
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  ) : (
    children
  );
}

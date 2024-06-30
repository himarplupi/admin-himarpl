"use client";

import { LayoutDashboard, LogOut, Menu, Users2, Waypoints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LogoHIMARPL } from "./logo-himarpl";
import { Nav } from "./nav";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { abbreviation } from "@/lib/utils";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import ReactLenis from "lenis/react";

const hideOnRoutes = ["/login"];

export function NavMobile({
  children,
  session,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return !hideOnRoutes.includes(pathname) ? (
    <>
      <nav className="container fixed top-0 z-50 flex w-full justify-between bg-background py-2">
        <div className="flex items-center justify-center">
          <LogoHIMARPL />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="flex min-h-[100%] flex-col justify-between">
              <Nav
                isCollapsed={false}
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
                    href: "/users/" + new Date().getFullYear(),
                    variant: pathname.includes("/users") ? "default" : "ghost",
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

              <div className="flex flex-col gap-y-2">
                <div className="flex items-center justify-center">
                  <ModeToggle isCollapsed={false} />
                </div>
                <div className="flex items-center">
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
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>
                        {session?.user.name}
                      </DropdownMenuLabel>

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
          </SheetContent>
        </Sheet>
      </nav>
      <div className="mt-10">
        <ReactLenis className="h-screen overflow-y-auto">{children}</ReactLenis>
      </div>
    </>
  ) : (
    <ReactLenis className="h-screen overflow-y-auto">{children}</ReactLenis>
  );
}

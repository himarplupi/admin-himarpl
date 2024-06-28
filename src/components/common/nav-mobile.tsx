"use client";

import { LayoutDashboard, Menu, Users2, Waypoints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LogoHIMARPL } from "./logo-himarpl";
import { Nav } from "./nav";
import { usePathname } from "next/navigation";

export function NavMobile({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
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
            <div className="grid gap-4 py-4">
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
            </div>
          </SheetContent>
        </Sheet>
      </nav>
      <div className="mt-10">{children}</div>
    </>
  );
}

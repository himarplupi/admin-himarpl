import { Users, LogIn, StickyNote, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";

import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { RecentLogin } from "./_components/recent-login";
import { OverviewPost } from "./_components/overview";
// import { api } from "@/trpc/server";

export default async function Home() {
  noStore();

  const session = await getServerAuthSession();

  if (!session || session.user.role !== "admin") {
    return redirect("/login");
  }

  return (
    <main className="container min-h-screen flex-1 space-y-4 p-8 pt-12">
      <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Dashboard
      </h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Postingan Artikel
            </CardTitle>
            <StickyNote className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+22 Artikel</div>
            <p className="text-xs text-muted-foreground">
              +100% dari minggu sebelumnya
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Akun Masuk
            </CardTitle>
            <LogIn className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">13 Akun</div>
            <p className="text-xs text-muted-foreground">
              telah masuk ke dalam sistem
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Akun Terdaftar
            </CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72 Akun</div>
            <p className="text-xs text-muted-foreground">
              terdaftar dalam sistem
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktif Sekarang
            </CardTitle>
            <Activity className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 Akun</div>
            <p className="text-xs text-muted-foreground">
              +2 satu jam terakhir
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Ringkasan Postingan Artikel</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewPost />
          </CardContent>
        </Card>
        <Card className="col-span-4 md:col-span-3">
          <CardHeader>
            <CardTitle>Aktivitas Akun</CardTitle>
            <CardDescription>13 akun aktif bulan ini</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentLogin />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

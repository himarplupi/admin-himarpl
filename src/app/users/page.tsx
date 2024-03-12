import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { DataTableUsers } from "./_components/data-table";

export default async function UsersPage() {
  noStore();
  const session = await getServerAuthSession();

  if (!session) return redirect("/login");
  if (session.user.role !== "admin") return redirect("https://himarpl.com");

  const users = await api.user.getMany.query();

  return (
    <main className="container min-h-screen flex-1 p-8 pt-20">
      <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Manage User
      </h2>
      <DataTableUsers data={users} />
    </main>
  );
}

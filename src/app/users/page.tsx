import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { DataTableUsers } from "@/components/users/data-table";

export default async function UsersPage() {
  const session = await getServerAuthSession();

  if (!session) return redirect("/login");
  if (session.user.role !== "admin") return redirect("https://himarpl.org");

  return (
    <main className="container min-h-screen flex-1 p-8">
      <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Kelola Pengurus
      </h2>
      <DataTableUsers />
    </main>
  );
}

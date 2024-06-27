import { unstable_noStore as noStore } from "next/cache";
import { api } from "@/trpc/server";
import { DataTableDepartments } from "./_components/data-table";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function DepartmentsPage() {
  noStore();
  const session = await getServerAuthSession();

  if (!session) return redirect("/login");
  if (session.user.role !== "admin") return redirect("https://himarpl.com");

  const departments = await api.department.get.query();

  return (
    <main className="container min-h-screen flex-1 p-8">
      <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Kelola Departemen
      </h2>
      <DataTableDepartments data={departments} />
    </main>
  );
}

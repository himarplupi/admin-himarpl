import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { DataTableDepartments } from "./_components/data-table";

export default async function DepartmentsPage() {
  const session = await getServerAuthSession();

  if (!session) return redirect("/login");
  if (session.user.role !== "admin") return redirect("https://himarpl.com");

  const departments = await api.department.get.query();

  return (
    <main className="container min-h-screen flex-1 p-8 pt-20">
      <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Department
      </h2>
      <DataTableDepartments data={departments} />
    </main>
  );
}

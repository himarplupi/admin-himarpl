import { unstable_noStore as noStore } from "next/cache";
import { DataTableDepartments } from "../../components/departments/data-table";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function DepartmentsPage() {
  noStore();
  const session = await getServerAuthSession();

  if (!session) return redirect("/login");
  if (session.user.role !== "admin") return redirect("https://himarpl.org");

  return (
    <main className="container min-h-screen flex-1 p-8">
      <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Kelola Departemen
      </h2>

      <DataTableDepartments />
    </main>
  );
}

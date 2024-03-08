import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { DataTableDemo } from "./_components/data-table";

export default async function DepartmentsPage() {
  const session = await getServerAuthSession();

  if (!session) {
    return redirect("/login");
  }

  return (
    <main className="container min-h-screen flex-1 space-y-4 p-8 pt-12">
      <DataTableDemo />
    </main>
  );
}

"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ReactNode } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export function DepartmentDeleteAlertDialog({
  departmentIds,
  children,
  onDelete,
}: {
  departmentIds: string[];
  children: ReactNode;
  onDelete?: (ids: string[]) => void;
}) {
  return (
    <AlertDialog>
      <DepartmentDeleteAlertTrigger>{children}</DepartmentDeleteAlertTrigger>
      <DepartmentDeleteAlertContent
        departmentIds={departmentIds}
        onDelete={onDelete}
      />
    </AlertDialog>
  );
}

export function DepartmentDeleteAlertTrigger({
  children,
}: {
  children: ReactNode;
}) {
  return <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>;
}

export function DepartmentDeleteAlertContent({
  departmentIds,
  onDelete,
}: {
  departmentIds: string[];
  onDelete?: (ids: string[]) => void;
}) {
  const deleteMutation = api.department.deleteMany.useMutation();

  const handleDelete = async () => {
    const deletePromise = deleteMutation.mutateAsync(departmentIds);

    toast.promise(deletePromise, {
      loading: "Menghapus departemen...",
      success: "Departemen berhasil dihapus",
      error: "Gagal menghapus departemen",
      duration: 3000,
    });

    if (onDelete) {
      await deletePromise;
      onDelete(departmentIds);
    }
  };

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
        <AlertDialogDescription>
          Tindakan ini tidak bisa dibatalkan. Tindakan Ini akan menghapus data
          departemen secara permanen dari database.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Batalkan</AlertDialogCancel>
        <AlertDialogAction onClick={handleDelete}>Yakin</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

export function DepartmentDeleteAlertWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <AlertDialog>{children}</AlertDialog>;
}

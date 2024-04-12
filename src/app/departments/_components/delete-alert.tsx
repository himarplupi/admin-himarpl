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

export function DeleteAlertDialog({
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
      <DeleteAlertTrigger>{children}</DeleteAlertTrigger>
      <DeleteAlertContent departmentIds={departmentIds} onDelete={onDelete} />
    </AlertDialog>
  );
}

export function DeleteAlertTrigger({ children }: { children: ReactNode }) {
  return <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>;
}

export function DeleteAlertContent({
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

export function DeleteAlertWrapper({ children }: { children: ReactNode }) {
  return <AlertDialog>{children}</AlertDialog>;
}

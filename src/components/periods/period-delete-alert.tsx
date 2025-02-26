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

export function PeriodDeleteAlertDialog({
  periodIds,
  children,
  onDelete,
}: {
  periodIds: string[];
  children: ReactNode;
  onDelete?: (ids: string[]) => void;
}) {
  return (
    <AlertDialog>
      <PeriodDeleteAlertTrigger>{children}</PeriodDeleteAlertTrigger>
      <PeriodDeleteAlertContent
        periodIds={periodIds}
        onDelete={onDelete}
      />
    </AlertDialog>
  );
}

export function PeriodDeleteAlertTrigger({
  children,
}: {
  children: ReactNode;
}) {
  return <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>;
}

export function PeriodDeleteAlertContent({
  periodIds,
  onDelete,
}: {
  periodIds: string[];
  onDelete?: (ids: string[]) => void;
}) {
  const deleteMutation = api.period.deleteMany.useMutation();

  const handleDelete = async () => {
    const deletePromise = deleteMutation.mutateAsync(periodIds);

    toast.promise(deletePromise, {
      loading: "Menghapus periode...",
      success: "Periode berhasil dihapus",
      error: "Gagal menghapus periode",
      duration: 3000,
    });

    if (onDelete) {
      await deletePromise;
      onDelete(periodIds);
    }
  };

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
        <AlertDialogDescription>
          Tindakan ini tidak bisa dibatalkan. Tindakan Ini akan menghapus data
          periode secara permanen dari database.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Batalkan</AlertDialogCancel>
        <AlertDialogAction onClick={handleDelete}>Yakin</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

export function PeriodDeleteAlertWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <AlertDialog>{children}</AlertDialog>;
}

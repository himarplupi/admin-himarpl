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

export function PositionDeleteAlertDialog({
  positionIds,
  children,
  onDelete,
}: {
  positionIds: string[];
  children: ReactNode;
  onDelete?: (ids: string[]) => void;
}) {
  return (
    <AlertDialog>
      <PositionDeleteAlertTrigger>{children}</PositionDeleteAlertTrigger>
      <PositionDeleteAlertContent
        positionIds={positionIds}
        onDelete={onDelete}
      />
    </AlertDialog>
  );
}

export function PositionDeleteAlertTrigger({
  children,
}: {
  children: ReactNode;
}) {
  return <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>;
}

export function PositionDeleteAlertContent({
  positionIds,
  onDelete,
}: {
  positionIds: string[];
  onDelete?: (ids: string[]) => void;
}) {
  const deleteMutation = api.position.deleteMany.useMutation();

  const handleDelete = async () => {
    const deletePromise = deleteMutation.mutateAsync(positionIds);

    toast.promise(deletePromise, {
      loading: "Menghapus posisi...",
      success: "Posisi berhasil dihapus",
      error: "Gagal menghapus posisi",
      duration: 3000,
    });

    if (onDelete) {
      await deletePromise;
      onDelete(positionIds);
    }
  };

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
        <AlertDialogDescription>
          Tindakan ini tidak bisa dibatalkan. Tindakan Ini akan menghapus data
          posisi secara permanen dari database.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Batalkan</AlertDialogCancel>
        <AlertDialogAction onClick={handleDelete}>Yakin</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

export function PositionDeleteAlertWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <AlertDialog>{children}</AlertDialog>;
}
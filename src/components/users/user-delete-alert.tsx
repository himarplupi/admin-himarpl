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

export function UserDeleteAlertDialog({
  userIds,
  children,
  onDelete,
}: {
  userIds: string[];
  children: ReactNode;
  onDelete?: (ids: string[]) => void;
}) {
  return (
    <AlertDialog>
      <UserDeleteAlertTrigger>{children}</UserDeleteAlertTrigger>
      <UserDeleteAlertContent userIds={userIds} onDelete={onDelete} />
    </AlertDialog>
  );
}

export function UserDeleteAlertTrigger({ children }: { children: ReactNode }) {
  return <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>;
}

export function UserDeleteAlertContent({
  userIds,
  onDelete,
}: {
  userIds: string[];
  onDelete?: (ids: string[]) => void;
}) {
  const deleteMutation = api.user.deleteMany.useMutation();

  const handleDelete = async () => {
    const deletePromise = deleteMutation.mutateAsync(userIds);

    toast.promise(deletePromise, {
      loading: "Menghapus user(s)...",
      success: "User(s) berhasil dihapus",
      error: "Gagal menghapus user(s)",
      duration: 3000,
    });

    if (onDelete) {
      onDelete(userIds);
    }
  };

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
        <AlertDialogDescription>
          Tindakan ini tidak bisa dibatalkan. Tindakan Ini akan menghapus data
          user secara permanen dari database.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Batalkan</AlertDialogCancel>
        <AlertDialogAction onClick={handleDelete}>Yakin</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

export function UserDeleteAlertWrapper({ children }: { children: ReactNode }) {
  return <AlertDialog>{children}</AlertDialog>;
}

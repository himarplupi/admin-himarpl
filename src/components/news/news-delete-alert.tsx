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

export function NewsDeleteAlertDialog({
  newsIds,
  children,
  onDelete,
}: {
  newsIds: string[];
  children: ReactNode;
  onDelete?: (ids: string[]) => void;
}) {
  return (
    <AlertDialog>
      <NewsDeleteAlertTrigger>{children}</NewsDeleteAlertTrigger>
      <NewsDeleteAlertContent newsIds={newsIds} onDelete={onDelete} />
    </AlertDialog>
  );
}

export function NewsDeleteAlertTrigger({ children }: { children: ReactNode }) {
  return <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>;
}

export function NewsDeleteAlertContent({
  newsIds,
  onDelete,
}: {
  newsIds: string[];
  onDelete?: (ids: string[]) => void;
}) {
  const deleteMutation = api.post.deleteMany.useMutation();

  const handleDelete = async () => {
    const deletePromise = deleteMutation.mutateAsync(newsIds);

    toast.promise(deletePromise, {
      loading: "Menghapus news(')...",
      success: "News(') berhasil dihapus",
      error: "Gagal menghapus news(')",
      duration: 3000,
    });

    if (onDelete) {
      onDelete(newsIds);
    }
  };

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
        <AlertDialogDescription>
          Tindakan ini tidak bisa dibatalkan. Tindakan Ini akan menghapus data
          news secara permanen dari database.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Batalkan</AlertDialogCancel>
        <AlertDialogAction onClick={handleDelete}>Yakin</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

export function NewsDeleteAlertWrapper({ children }: { children: ReactNode }) {
  return <AlertDialog>{children}</AlertDialog>;
}

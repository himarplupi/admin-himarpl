"use client";

import { useState, createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Position } from "./position-type";
import { ReactLenis } from "lenis/react";
import { type Position as DefaultPosition } from "@prisma/client";
import { type PositionFormSchema, positionFormSchema } from "./position-form-schema";

const EditPositionContext = createContext<{
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}>({ 
  open: false,
  setOpen: () => false,
});

export function PositionEditWrapper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <EditPositionContext.Provider value={{ open, setOpen }}>
      <Dialog open={open} onOpenChange={setOpen}>
        {children}
      </Dialog>
    </EditPositionContext.Provider>
  );
}

export function PositionEditTrigger({ children }: { children: React.ReactNode }) {
  return <DialogTrigger asChild>{children}</DialogTrigger>;
}

export function PositionEditContent({
  position,
  onEdit,
}: {
  position: Position;
  onEdit?: (data?: DefaultPosition) => void;
}) {
  const positionMutation = api.position.update.useMutation();
  const { setOpen } = useContext(EditPositionContext);
  const form = useForm<PositionFormSchema>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: {
      name: position.name,
    },
  });

  const onSubmit = async (values: PositionFormSchema) => {
    setOpen(false);

    const editedPosition = {
      ...position,
      ...values,
    };

    for (const key in editedPosition) {
      if (
        editedPosition[key as keyof Position] === position[key as keyof Position] &&
        key !== "id"
      ) {
        delete editedPosition[key as keyof Position];
      }
    }

    const mutationPromise = positionMutation.mutateAsync(editedPosition);

    toast.promise(mutationPromise, {
      loading: "Mengubah posisi...",
      success: "Posisi berhasil diubah",
      error: "Gagal mengubah posisi",
      duration: 3000,
    });

    await mutationPromise.then((data) => {
      if (onEdit) {
        onEdit(data);
      }
      form.reset({
        name: data.name,
      });
    });

    form.reset();
  };

  return (
    <DialogContent className="max-h-screen p-0 sm:max-w-[512px]">
      <ReactLenis className="max-h-screen overflow-y-auto">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle>Edit Position</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} id="edit-position-form">
              <div className="grid gap-4 py-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Posisi</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Batalkan
            </Button>
            <Button form="edit-position-form" type="submit">
              Simpan perubahan
            </Button>
          </DialogFooter>
        </div>
      </ReactLenis>
    </DialogContent>
  );
}
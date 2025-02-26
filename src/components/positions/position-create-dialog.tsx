"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
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
import { ReactLenis } from "lenis/react";
import { type PositionFormSchema, positionFormSchema } from "./position-form-schema";

export function PositionCreateDialog({ onCreate }: { onCreate: () => void }) {
  const positionMutation = api.position.create.useMutation();
  const [open, setOpen] = useState(false);
  const form = useForm<PositionFormSchema>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: PositionFormSchema) => {
    setOpen(false);

    const mutationPromise = positionMutation.mutateAsync({
      ...values,
    });

    toast.promise(mutationPromise, {
      loading: "Membuat posisi...",
      success: "Posisi berhasil dibuat",
      error: "Gagal membuat posisi",
      duration: 3000,
    });

    await mutationPromise.then(() => onCreate());

    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={positionMutation.isLoading}>
          <Plus className="mr-2 h-4 w-4" /> New
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen p-0 sm:max-w-[512px]">
        <ReactLenis className="max-h-screen overflow-y-auto">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>New Position</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                id="create-position-form"
              >
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
              <Button form="create-position-form" type="submit">
                Create
              </Button>
            </DialogFooter>
          </div>
        </ReactLenis>
      </DialogContent>
    </Dialog>
  );
}
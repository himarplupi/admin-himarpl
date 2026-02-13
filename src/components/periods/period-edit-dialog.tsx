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
import type { Period } from "./period-type";
import { ReactLenis } from "lenis/react";
import { type InferSelectModel } from "drizzle-orm";
import { type periods } from "@/server/db/schema";
import { type PeriodFormSchema, periodFormSchema } from "./period-form-schema";

type DefaultPeriod = InferSelectModel<typeof periods>;

const EditPeriodContext = createContext<{
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}>({
  open: false,
  setOpen: () => false,
});

export function PeriodEditWrapper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <EditPeriodContext.Provider value={{ open, setOpen }}>
      <Dialog open={open} onOpenChange={setOpen}>
        {children}
      </Dialog>
    </EditPeriodContext.Provider>
  );
}

export function PeriodEditTrigger({ children }: { children: React.ReactNode }) {
  return <DialogTrigger asChild>{children}</DialogTrigger>;
}

export function PeriodEditContent({
  period,
  onEdit,
}: {
  period: Period;
  onEdit?: (data?: DefaultPeriod) => void;
}) {
  const periodMutation = api.period.update.useMutation();
  const { setOpen } = useContext(EditPeriodContext);
  const form = useForm<PeriodFormSchema>({
    resolver: zodResolver(periodFormSchema),
    defaultValues: {
      name: period.name,
      year: period.year,
      logo: period.logo ?? "",
    },
  });

  const onSubmit = async (values: PeriodFormSchema) => {
    setOpen(false);

    const editedPeriod = {
      ...period,
      ...values,
    };

    for (const key in editedPeriod) {
      if (
        editedPeriod[key as keyof Period] === period[key as keyof Period] &&
        key !== "id"
      ) {
        delete editedPeriod[key as keyof Period];
      }
    }

    const mutationPromise = periodMutation.mutateAsync(editedPeriod);

    toast.promise(mutationPromise, {
      loading: "Mengubah periode...",
      success: "Periode berhasil diubah",
      error: "Gagal mengubah periode",
      duration: 3000,
    });

    await mutationPromise.then((data) => {
      if (onEdit) {
        onEdit(data);
      }
      form.reset({
        name: data?.name,
        year: data?.year,
        logo: data?.logo ?? "",
      });
    });

    form.reset();
  };

  return (
    <DialogContent className="max-h-screen p-0 sm:max-w-[512px]">
      <ReactLenis className="max-h-screen overflow-y-auto">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle>Edit Period</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} id="edit-period-form">
              <div className="grid gap-4 py-6">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tahun Periode/Kabinet</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Periode/Kabinet</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Logo</FormLabel>
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
            <Button form="edit-period-form" type="submit">
              Simpan perubahan
            </Button>
          </DialogFooter>
        </div>
      </ReactLenis>
    </DialogContent>
  );
}

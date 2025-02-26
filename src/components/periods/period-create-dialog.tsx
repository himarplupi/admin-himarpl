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
import { type PeriodFormSchema, periodFormSchema } from "./period-form-schema";

export function DepartmentCreateDialog({ onCreate }: { onCreate: () => void }) {
  const periodMutation = api.period.create.useMutation();
  const [open, setOpen] = useState(false);
  const form = useForm<PeriodFormSchema>({
    resolver: zodResolver(periodFormSchema),
    defaultValues: {
      name: "",
      logo: "",
    },
  });

  const onSubmit = async (values: PeriodFormSchema) => {
    setOpen(false);

    const mutationPromise = periodMutation.mutateAsync({
      ...values,
    });

    toast.promise(mutationPromise, {
      loading: "Membuat periode...",
      success: "Periode berhasil dibuat",
      error: "Gagal membuat periode",
      duration: 3000,
    });

    await mutationPromise.then(() => onCreate());

    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={periodMutation.isLoading}>
          <Plus className="mr-2 h-4 w-4" /> New
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen p-0 sm:max-w-[512px]">
        <ReactLenis className="max-h-screen overflow-y-auto">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>New Period</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                id="create-period-form"
              >
                <div className="grid gap-4 py-6">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tahun Periode/Kabinet</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
              <Button form="create-period-form" type="submit">
                Create
              </Button>
            </DialogFooter>
          </div>
        </ReactLenis>
      </DialogContent>
    </Dialog>
  );
}

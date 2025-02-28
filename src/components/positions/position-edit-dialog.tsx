"use client";

import { useState, createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
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
import {
  type PositionFormSchema,
  positionFormSchema,
} from "./position-form-schema";

const EditPositionContext = createContext<{
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}>({
  open: false,
  setOpen: () => false,
});

export function PositionEditWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <EditPositionContext.Provider value={{ open, setOpen }}>
      <Dialog open={open} onOpenChange={setOpen}>
        {children}
      </Dialog>
    </EditPositionContext.Provider>
  );
}

export function PositionEditTrigger({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DialogTrigger asChild>{children}</DialogTrigger>;
}

export function PositionEditContent({
  position,
  onEdit,
}: {
  position: Position;
  onEdit?: (data?: DefaultPosition) => void;
}) {
  const departments = api.department.all.useQuery()?.data ?? [];
  const positionMutation = api.position.update.useMutation();
  const { setOpen } = useContext(EditPositionContext);
  const form = useForm<PositionFormSchema>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: {
      name: position.name,
      departmentId: position.departmentId ?? "",
    },
  });

  const onSubmit = async (values: PositionFormSchema) => {
    setOpen(false);

    const mutationPromise = positionMutation.mutateAsync({
      id: position.id,
      departmentId: values.departmentId,
      name: values.name,
    });

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
        departmentId: data.departmentId ?? "",
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
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              id="edit-position-form"
            >
              <div className="grid gap-4 py-6">
                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departement</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih departement..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-48">
                          <SelectGroup>
                            <SelectLabel className="uppercase">
                              Badan Eksekutif
                            </SelectLabel>
                            {departments
                              .filter((department) => department.type === "BE")
                              .map((department) => (
                                <SelectItem
                                  key={department.id}
                                  value={department.id}
                                  className="uppercase"
                                >
                                  {department.acronym} ({department.periodYear})
                                </SelectItem>
                              ))}
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel className="uppercase">
                              Dewan Perwakilan
                            </SelectLabel>
                            {departments
                              .filter((department) => department.type === "DP")
                              .map((department) => (
                                <SelectItem
                                  key={department.id}
                                  value={department.id}
                                  className="uppercase"
                                >
                                  {department.acronym} ({department.periodYear})
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

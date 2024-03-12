"use client";

import { useState, createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import { z } from "zod";
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
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import type { Department } from "@prisma/client";

const editFormSchema = z.object({
  name: z
    .string()
    .max(255, {
      message: "Name must be less than 255 characters",
    })
    .min(4, {
      message: "Name must be more than 4 characters",
    }),
  image: z.string(),
  description: z.string(),
  acronym: z.string(),
  type: z.enum(["BE", "DP"]),
});

type EditFormSchema = z.infer<typeof editFormSchema>;

const EditDepartmentContext = createContext<{
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}>({
  open: false,
  setOpen: () => false,
});

export function EditDepartmentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <EditDepartmentContext.Provider value={{ open, setOpen }}>
      <Dialog open={open} onOpenChange={setOpen}>
        {children}
      </Dialog>
    </EditDepartmentContext.Provider>
  );
}

export function EditDepartmentTrigger({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DialogTrigger asChild>{children}</DialogTrigger>;
}

export function EditDepartmentContent({
  department,
  onEdit,
}: {
  department: Department;
  onEdit: (data?: Department) => void;
}) {
  const departmentMutation = api.department.put.useMutation();
  const form = useForm<EditFormSchema>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: department.name,
      description: department.description ?? "",
      type: department.type,
      acronym: department.acronym ?? "",
      image: department.image ?? "",
    },
  });
  const { setOpen } = useContext(EditDepartmentContext);

  const onSubmit = async (values: EditFormSchema) => {
    setOpen(false);

    const editedDepartment = {
      ...department,
      ...values,
    };

    for (const key in editedDepartment) {
      if (
        editedDepartment[key as keyof Department] ===
          department[key as keyof Department] &&
        key !== "id"
      ) {
        delete editedDepartment[key as keyof Department];
      }
    }

    const mutationPromise = departmentMutation.mutateAsync(editedDepartment);

    toast.promise(mutationPromise, {
      loading: "Updating department...",
      success: "Department updated successfully",
      error: "Failed to update department",
      duration: 3000,
    });

    await mutationPromise.then((data) => {
      onEdit(data);
      form.reset({
        name: data.name,
        description: data.description ?? "",
        type: data.type,
        acronym: data.acronym ?? "",
        image: data.image ?? "",
      });
    });
  };

  return (
    <DialogContent className="max-h-screen p-0 sm:max-w-[512px]">
      <ScrollArea className="max-h-screen">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              id="edit-department-form"
            >
              <div className="grid gap-4 py-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Department Type..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BE">Badan Eksekutif</SelectItem>
                          <SelectItem value="DP">Dewan Perwakilan</SelectItem>
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
                      <FormLabel>Nama Departemen</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acronym"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Akronim Departemen</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Gambar</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi Departemen</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-16" {...field} />
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
            <Button form="edit-department-form" type="submit">
              Simpan perubahan
            </Button>
          </DialogFooter>
        </div>
      </ScrollArea>
    </DialogContent>
  );
}

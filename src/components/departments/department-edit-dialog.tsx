"use client";

import { useState, createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { useAutoAnimate } from "@formkit/auto-animate/react";

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
  acronym: z
    .string()
    .max(32, {
      message: "Acronym must be less than 32 characters",
    })
    .min(2, {
      message: "Acronym must be more than 2 characters",
    }),
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

export function DepartmentEditWrapper({
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

export function DepartmentEditTrigger({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DialogTrigger asChild>{children}</DialogTrigger>;
}

export function DepartmentEditContent({
  department,
  onEdit,
}: {
  department: Department;
  onEdit?: (data?: Department) => void;
}) {
  const [parent] = useAutoAnimate();
  const departmentMutation = api.department.update.useMutation();
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
  const [programsInput, setProgramsInput] = useState(department.programs);
  const [programs, setPrograms] = useState(department.programs);

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

    const mutationPromise = departmentMutation.mutateAsync({
      ...editedDepartment,
      programs,
    });

    toast.promise(mutationPromise, {
      loading: "Mengubah departemen...",
      success: "Departemen berhasil diubah",
      error: "Gagal mengubah departemen",
      duration: 3000,
    });

    await mutationPromise.then((data) => {
      if (onEdit) {
        onEdit(data);
      }
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

                <div className="space-y-2" ref={parent}>
                  <Label>Program Kerja</Label>
                  {programsInput.map((pInput, index) => {
                    const key = `${index}_${pInput}`;
                    return (
                      <div key={key} className="flex gap-x-1">
                        <Input
                          value={programs[index]}
                          onChange={(e) => {
                            const value = e.target.value;
                            const newPrograms = [...programs];
                            newPrograms[index] = value;
                            setPrograms(newPrograms);
                          }}
                        />
                        <Button
                          disabled={index === 0}
                          size="icon"
                          variant="outline"
                          type="button"
                          onClick={() => {
                            const newPrograms = [...programs];
                            newPrograms.splice(index, 1);
                            setPrograms(newPrograms);
                            setProgramsInput(newPrograms);
                          }}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    );
                  })}

                  <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    onClick={() => {
                      setProgramsInput((prev) => [...prev, ""]);
                      setPrograms((prev) => [...prev, ""]);
                    }}
                  >
                    Tambah Program Kerja
                  </Button>
                </div>
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

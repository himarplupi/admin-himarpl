"use client";

import { useState, createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";
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
import { toast } from "sonner";
import type { Department } from "./department-type";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ReactLenis } from "lenis/react";
import { type Department as DefaultDepartment } from "@prisma/client";
import {
  type DepartmentFormSchema,
  departmentFormSchema,
} from "./department-form-schema";

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
  onEdit?: (data?: DefaultDepartment) => void;
}) {
  const [parent] = useAutoAnimate();
  const departmentMutation = api.department.update.useMutation();
  const periods = api.period.all.useQuery().data ?? [];
  const form = useForm<DepartmentFormSchema>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: department.name,
      description: department.description ?? "",
      type: department.type as "BE" | "DP",
      acronym: department.acronym ?? "",
      image: department.image ?? "",
      periodYear: department.periodYear,
      programs: department.programs.map((p) => p.content),
    },
  });
  const [programsInput, setProgramsInput] = useState(
    department.programs.map((p) => p.content),
  );
  const [programs] = form.watch(["programs"]);

  const { setOpen } = useContext(EditDepartmentContext);

  const onSubmit = async (values: DepartmentFormSchema) => {
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
        type: data.type as "BE" | "DP",
        acronym: data.acronym ?? "",
        image: data.image ?? "",
        periodYear: data.periodYear,
      });
    });
  };

  return (
    <DialogContent className="max-h-screen p-0 sm:max-w-[512px]">
      <ReactLenis className="max-h-screen overflow-y-auto">
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
                  name="periodYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tahun Periode</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Tahun Periode..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {periods.map((period) => (
                            <SelectItem
                              key={period.id}
                              value={period.year.toString()}
                            >
                              {period.year} ({period.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                            form.setValue("programs", newPrograms);
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
                            form.setValue("programs", newPrograms);
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
                      form.setValue("programs", [...programs, ""]);
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
      </ReactLenis>
    </DialogContent>
  );
}

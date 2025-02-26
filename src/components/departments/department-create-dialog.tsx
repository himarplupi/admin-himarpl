"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ReactLenis } from "lenis/react";
import {
  type DepartmentFormSchema,
  departmentFormSchema,
} from "./department-form-schema";

export function DepartmentCreateDialog({ onCreate }: { onCreate: () => void }) {
  const [parent] = useAutoAnimate();
  const departmentMutation = api.department.create.useMutation();
  const periods = api.period.all.useQuery().data ?? [];
  const [open, setOpen] = useState(false);
  const form = useForm<DepartmentFormSchema>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "BE",
      acronym: "",
      image: "",
      periodYear: new Date().getFullYear(),
      programs: [],
    },
  });
  const [programsInput, setProgramsInput] = useState([""]);
  const [programs] = form.watch(["programs"]);

  const onSubmit = async (values: DepartmentFormSchema) => {
    setOpen(false);

    const mutationPromise = departmentMutation.mutateAsync({
      ...values,
      programs,
    });

    toast.promise(mutationPromise, {
      loading: "Membuat departemen...",
      success: "Departemen berhasil dibuat",
      error: "Gagal membuat departemen",
      duration: 3000,
    });

    await mutationPromise.then(() => onCreate());

    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={departmentMutation.isLoading}>
          <Plus className="mr-2 h-4 w-4" /> New
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen p-0 sm:max-w-[512px]">
        <ReactLenis className="max-h-screen overflow-y-auto">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>New Department</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                id="create-department-form"
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
              <Button form="create-department-form" type="submit">
                Create
              </Button>
            </DialogFooter>
          </div>
        </ReactLenis>
      </DialogContent>
    </Dialog>
  );
}

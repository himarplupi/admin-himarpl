"use client";

import { useState, createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Trash2 } from "lucide-react";
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
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ReactLenis } from "lenis/react";
import { toast } from "sonner";
import type { Department, User } from "./types";
import { Label } from "@/components/ui/label";
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
  position: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
  departmentId: z.string().optional(),
});

type EditFormSchema = z.infer<typeof editFormSchema>;

const EditUserContext = createContext<{
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}>({
  open: false,
  setOpen: () => false,
});

export function UserEditWrapper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <EditUserContext.Provider value={{ open, setOpen }}>
      <Dialog open={open} onOpenChange={setOpen}>
        {children}
      </Dialog>
    </EditUserContext.Provider>
  );
}

export function UserEditTrigger({ children }: { children: React.ReactNode }) {
  return <DialogTrigger asChild>{children}</DialogTrigger>;
}

export function UserEditContent({
  user,
  departments,
  onEdit,
}: {
  user: User;
  departments: Department[];
  onEdit: () => void;
}) {
  const [parent] = useAutoAnimate();
  const [periodsInput, setPeriodsInput] = useState(user.periods ?? []);
  const [periods, setPeriods] = useState(user.periods ?? []);
  const updateMutation = api.user.update.useMutation();
  const form = useForm<EditFormSchema>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: user.name ?? "",
      image: user.image ?? "",
      email: user.email ?? "",
      position: user.position ?? "",
      role: user.role,
      departmentId: user.departmentId ?? undefined,
    },
  });
  const { setOpen } = useContext(EditUserContext);

  const onSubmit = async (values: EditFormSchema) => {
    setOpen(false);

    const mutationPromise = updateMutation.mutateAsync({
      ...values,
      periods,
      id: user.id,
    });

    toast.promise(mutationPromise, {
      loading: "Mengubah user...",
      success: "User berhasil diubah",
      error: "Gagal mengubah user",
      duration: 3000,
    });

    await mutationPromise.then(() => {
      onEdit();
    });
  };

  return (
    <DialogContent className="max-h-screen p-0 sm:max-w-[512px]">
      <ReactLenis className="max-h-screen overflow-y-auto">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} id="edit-user-form">
              <div className="grid gap-4 py-6">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={user.role === "admin"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">
                            {"Admin (Tidak akan bisa diubah)"}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  // disabled={user.accounts && user.accounts.length > 0}

                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          readOnly={user.accounts && user.accounts.length > 0}
                          {...field}
                        />
                      </FormControl>
                      {user.accounts && user.accounts.length > 0 && (
                        <p className="text-sm text-gray-500">
                          Email tidak bisa diubah karena user sudah aktivasi
                          akun
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama</FormLabel>
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
                      <FormLabel>Link Foto Profil</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="departmentId"
                  disabled={departments.length < 1}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departemen</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih departemen..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                                  {department.acronym}
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
                                  {department.acronym}
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
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jabatan</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2" ref={parent}>
                  <Label>Tahun Periode</Label>
                  {periodsInput.map((pInput, index) => {
                    const key = `${index}_${pInput}`;
                    return (
                      <div key={key} className="flex gap-x-1">
                        <Input
                          value={periods[index]}
                          onChange={(e) => {
                            const value = e.target.value;
                            const newPeriods = [...periods];
                            newPeriods[index] = value;
                            setPeriods(newPeriods);
                          }}
                        />
                        <Button
                          disabled={index === 0}
                          size="icon"
                          variant="outline"
                          type="button"
                          onClick={() => {
                            const newPeriods = [...periods];
                            newPeriods.splice(index, 1);
                            setPeriods(newPeriods);
                            setPeriodsInput(newPeriods);
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
                      setPeriodsInput((prev) => [...prev, ""]);
                      setPeriods((prev) => [...prev, ""]);
                    }}
                  >
                    Tambah Tahun Periode
                  </Button>
                </div>
              </div>
            </form>
          </Form>
          <DialogFooter>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setOpen(false)}
            >
              Batalkan
            </Button>
            <Button form="edit-user-form" type="submit">
              Simpan perubahan
            </Button>
          </DialogFooter>
        </div>
      </ReactLenis>
    </DialogContent>
  );
}

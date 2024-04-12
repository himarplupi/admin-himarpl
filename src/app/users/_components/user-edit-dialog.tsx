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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import type { Department, User } from "../types";

const editFormSchema = z.object({
  name: z
    .string()
    .max(255, {
      message: "Name must be less than 255 characters",
    })
    .min(4, {
      message: "Name must be more than 4 characters",
    })
    .optional(),
  image: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(["admin", "member"]).optional(),
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
  onEdit: (data?: User) => void;
}) {
  const updateMutation = api.user.update.useMutation();
  const form = useForm<EditFormSchema>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: user.name ?? "",
      image: user.image ?? "",
      email: user.email ?? "",
      role: user.role,
      departmentId: user.departmentId ?? undefined,
    },
  });
  const { setOpen } = useContext(EditUserContext);

  const onSubmit = async (values: EditFormSchema) => {
    setOpen(false);

    const mutationPromise = updateMutation.mutateAsync({
      ...values,
      id: user.id,
    });

    toast.promise(mutationPromise, {
      loading: "Mengubah user...",
      success: "User berhasil diubah",
      error: "Gagal mengubah user",
      duration: 3000,
    });

    await mutationPromise.then((data) => {
      onEdit(data);
      form.reset({
        name: data.name ?? "",
        email: data.email ?? "",
        role: data.role,
        image: data.image ?? "",
        departmentId: data.departmentId ?? undefined,
      });
    });
  };

  return (
    <DialogContent className="max-h-screen p-0 sm:max-w-[512px]">
      <ScrollArea className="max-h-screen">
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
                  disabled={user.accounts && user.accounts.length > 0}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
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
                  disabled={departments.length === 0}
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
                          {departments.map((department) => (
                            <SelectItem
                              key={department.id}
                              value={department.id}
                            >
                              {department.acronym}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
            <Button form="edit-user-form" type="submit">
              Simpan perubahan
            </Button>
          </DialogFooter>
        </div>
      </ScrollArea>
    </DialogContent>
  );
}

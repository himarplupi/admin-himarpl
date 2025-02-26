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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ReactLenis } from "lenis/react";
import { toast } from "sonner";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { User } from "@prisma/client";
import { type UserFormSchema, userFormSchema } from "./user-form-schema";

export function UserCreateDialog({
  onCreate,
}: {
  onCreate: (data: User) => void;
}) {
  const [parent] = useAutoAnimate();
  const periods = api.period.all.useQuery().data ?? [];
  const positions = api.position.all.useQuery().data ?? [];
  const departments = api.department.all.useQuery().data ?? [];
  const createMutation = api.user.create.useMutation();
  const [open, setOpen] = useState(false);
  const form = useForm<UserFormSchema>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      image: "",
      role: "member",
      email: "",
      periodYears: [new Date().getFullYear()],
      departmentIds: [],
      positionIds: [],
    },
  });

  const [selectedPeriods] = form.watch(["periodYears"]);
  const [selectedDepartments] = form.watch(["departmentIds"]);
  const [selectedPositions] = form.watch(["positionIds"]);

  const onSubmit = async (values: UserFormSchema) => {
    setOpen(false);

    const mutationPromise = createMutation.mutateAsync({
      name: values.name,
      image: values.image,
      email: values.email,
      role: values.role,
      periodYears: values.periodYears,
      departmentIds: values.departmentIds,
      positionIds: values.positionIds,
    });

    toast.promise(mutationPromise, {
      loading: "Membuat user...",
      success: "User berhasil dibuat",
      error: "Gagal membuat user",
      duration: 3000,
    });

    await mutationPromise.then((data) => onCreate(data));

    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={createMutation.isLoading}>
          <Plus className="mr-2 h-4 w-4" /> New
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen p-0 sm:max-w-[512px]">
        <ReactLenis className="max-h-screen overflow-y-auto">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>New User</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                id="create-user-form"
              >
                <div className="grid gap-4 py-6" ref={parent}>
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                    name="periodYears"
                    disabled={periods.length === 0}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Periode</FormLabel>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="justify-start"
                              >
                                {field.value.length === 0
                                  ? "Pilih periode..."
                                  : field.value.join(", ")}
                              </Button>
                            </FormControl>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="start">
                            <DropdownMenuLabel>Periode</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            {periods.map((period) => (
                              <DropdownMenuCheckboxItem
                                className="capitalize"
                                key={period.id}
                                checked={field.value.includes(period.year)}
                                onCheckedChange={() => {
                                  if (field.value.includes(period.year)) {
                                    // When unselecting a period, remove its index from departmentIds and positionIds
                                    const periodIndex = field.value.indexOf(
                                      period.year,
                                    );
                                    const newDepartmentIds = [
                                      ...form.getValues("departmentIds"),
                                    ];
                                    const newPositionIds = [
                                      ...form.getValues("positionIds"),
                                    ];

                                    newDepartmentIds.splice(periodIndex, 1);
                                    newPositionIds.splice(periodIndex, 1);

                                    form.setValue(
                                      "departmentIds",
                                      newDepartmentIds,
                                    );
                                    form.setValue(
                                      "positionIds",
                                      newPositionIds,
                                    );

                                    field.onChange(
                                      field.value.filter(
                                        (value) => value !== period.year,
                                      ),
                                    );
                                  } else {
                                    field.onChange([
                                      ...field.value,
                                      period.year,
                                    ]);
                                  }
                                }}
                              >
                                {period.year} ({period.name})
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedPeriods.map((periodYear, index) => (
                    <div key={periodYear.toString()} className="my-3 space-y-3">
                      <h4 className="mb-4 text-xl font-medium leading-none tracking-tight">{`Periode ${periodYear}`}</h4>

                      <FormField
                        control={form.control}
                        name="departmentIds"
                        disabled={
                          departments.filter(
                            (department) =>
                              department.periodYear === periodYear,
                          ).length === 0
                        }
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Departemen</FormLabel>
                            <Select
                              defaultValue={field.value[index]}
                              onValueChange={(newValue) => {
                                const newDepartmentIds = [
                                  ...selectedDepartments,
                                ];
                                // Ensure array has enough slots
                                while (
                                  newDepartmentIds.length <
                                  selectedPeriods.length
                                ) {
                                  newDepartmentIds.push("");
                                }
                                newDepartmentIds[index] = newValue;
                                form.setValue(
                                  "departmentIds",
                                  newDepartmentIds,
                                );
                              }}
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
                                    .filter(
                                      (department) =>
                                        department.type === "BE" &&
                                        department.periodYear === periodYear,
                                    )
                                    .map((department) => (
                                      <SelectItem
                                        key={department.id}
                                        value={department.id}
                                        className="uppercase"
                                      >
                                        {department.acronym} (
                                        {department.periodYear})
                                      </SelectItem>
                                    ))}
                                </SelectGroup>
                                <SelectGroup>
                                  <SelectLabel className="uppercase">
                                    Dewan Perwakilan
                                  </SelectLabel>
                                  {departments
                                    .filter(
                                      (department) =>
                                        department.type === "DP" &&
                                        department.periodYear === periodYear,
                                    )
                                    .map((department) => (
                                      <SelectItem
                                        key={department.id}
                                        value={department.id}
                                        className="uppercase"
                                      >
                                        {department.acronym} (
                                        {department.periodYear})
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
                        name="positionIds"
                        disabled={positions.length === 0}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Posisi</FormLabel>
                            <Select
                              onValueChange={(newValue) => {
                                const newPositionIds = [...selectedPositions];
                                // Ensure array has enough slots
                                while (
                                  newPositionIds.length < selectedPeriods.length
                                ) {
                                  newPositionIds.push("");
                                }
                                newPositionIds[index] = newValue;
                                form.setValue("positionIds", newPositionIds);
                              }}
                              defaultValue={field.value[index]}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih posisi..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {positions.map((position) => (
                                  <SelectItem
                                    key={position.id}
                                    value={position.id}
                                    className="capitalize"
                                  >
                                    {position.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </form>
            </Form>
            <DialogFooter>
              <Button form="create-user-form" type="submit">
                Create
              </Button>
            </DialogFooter>
          </div>
        </ReactLenis>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreVertical, Trash, Copy, Pencil } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserDeleteAlertContent,
  UserDeleteAlertTrigger,
  UserDeleteAlertWrapper,
} from "./user-delete-alert";
import {
  UserEditContent,
  UserEditTrigger,
  UserEditWrapper,
} from "./user-edit-dialog";
import { abbreviation } from "@/lib/utils";
import type { User } from "./types";

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md">
          <Avatar>
            <AvatarImage
              className="scale-125 object-cover object-center"
              src={user?.image ?? ""}
              alt={user?.name ?? ""}
            />
            <AvatarFallback>{abbreviation(user.name)}</AvatarFallback>
          </Avatar>
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "accounts",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const accounts = row.original.accounts;
      return (
        <div className="capitalize">
          {accounts && accounts.length > 0 ? "Aktif" : "Belum Aktif"}
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue("role")}</div>,
  },
  {
    accessorKey: "position",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Jabatan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("position")}</div>
    ),
  },
  {
    accessorKey: "departmentId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Departemen
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const department = row.original.department;
      if (!department) return null;

      return (
        <div className="uppercase">
          {department?.acronym} {`(${department?.type})`}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const user = row.original;

      return (
        <UserDeleteAlertWrapper>
          <UserEditWrapper>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  className="gap-x-2"
                  onClick={() => navigator.clipboard.writeText(user.id)}
                >
                  <Copy className="h-4 w-4" />
                  Copy user ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <UserEditTrigger>
                  <DropdownMenuItem className="gap-x-2">
                    <Pencil className="h-4 w-4" />
                    Edit user
                  </DropdownMenuItem>
                </UserEditTrigger>
                <UserDeleteAlertTrigger>
                  <DropdownMenuItem className="gap-x-2">
                    <Trash className="h-4 w-4" />
                    Delete user
                  </DropdownMenuItem>
                </UserDeleteAlertTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

            <UserEditContent
              departments={table.options.meta?.departments ?? []}
              user={user}
              onEdit={() => table.options.meta?.onUpdateRows()}
            />
          </UserEditWrapper>

          <UserDeleteAlertContent
            userIds={[user.id]}
            onDelete={table.options.meta?.onDeleteRows}
          />
        </UserDeleteAlertWrapper>
      );
    },
  },
];

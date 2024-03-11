"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreVertical, Trash, Copy, Pencil } from "lucide-react";
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
  DeleteAlertContent,
  DeleteAlertTrigger,
  DeleteAlertWrapper,
} from "./delete-alert";
import type { Department } from "@/server/db/schema";

export const columns: ColumnDef<Department>[] = [
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
    accessorKey: "type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="uppercase">{row.getValue("type")}</div>,
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
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <p className="truncate">{row.getValue("description")}</p>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const department = row.original;

      return (
        <DeleteAlertWrapper>
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
                onClick={() => navigator.clipboard.writeText(department.id)}
              >
                <Copy className="h-4 w-4" />
                Copy department ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-x-2">
                <Pencil className="h-4 w-4" />
                Edit department
              </DropdownMenuItem>
              <DeleteAlertTrigger>
                <DropdownMenuItem className="gap-x-2">
                  <Trash className="h-4 w-4" />
                  Delete department
                </DropdownMenuItem>
              </DeleteAlertTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <DeleteAlertContent
            departmentIds={[department.id]}
            onDelete={table.options.meta?.deleteRows}
          />
        </DeleteAlertWrapper>
      );
    },
  },
];

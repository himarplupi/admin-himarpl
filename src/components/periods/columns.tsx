"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreVertical, Trash, Copy, Pencil } from "lucide-react";
import Image from "next/image";
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
  PeriodDeleteAlertContent,
  PeriodDeleteAlertTrigger,
  PeriodDeleteAlertWrapper,
} from "./period-delete-alert";
import {
  PeriodEditContent,
  PeriodEditTrigger,
  PeriodEditWrapper,
} from "./period-edit-dialog";
import type { Period } from "./period-type";

export const columns: ColumnDef<Period>[] = [
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
      const period = row.original;

      return (
        <div className="relative h-24 w-24 overflow-hidden rounded-md">
          {period.logo && (
            <Image
              src={period.logo}
              alt={period.name + " Logo"}
              fill
              className="object-cover"
            />
          )}
          {!period.logo && `Logo not found`}
        </div>
      );
    },
  },
  {
    accessorKey: "year",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Year
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("year")}</div>,
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
    accessorKey: "logo",
    header: "Logo URL",
    cell: ({ row }) => (
      <p className="line-clamp-3 min-w-12">{row.getValue("logo")}</p>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const period = row.original;

      return (
        <PeriodDeleteAlertWrapper>
          <PeriodEditWrapper>
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
                  onClick={() => navigator.clipboard.writeText(period.id)}
                >
                  <Copy className="h-4 w-4" />
                  Copy period ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <PeriodEditTrigger>
                  <DropdownMenuItem className="gap-x-2">
                    <Pencil className="h-4 w-4" />
                    Edit period
                  </DropdownMenuItem>
                </PeriodEditTrigger>
                <PeriodDeleteAlertTrigger>
                  <DropdownMenuItem className="gap-x-2">
                    <Trash className="h-4 w-4" />
                    Delete period
                  </DropdownMenuItem>
                </PeriodDeleteAlertTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

            <PeriodEditContent
              period={period}
              onEdit={() => table.options.meta?.onUpdateRows()}
            />
          </PeriodEditWrapper>

          <PeriodDeleteAlertContent
            periodIds={[period.id]}
            onDelete={table.options.meta?.onDeleteRows}
          />
        </PeriodDeleteAlertWrapper>
      );
    },
  },
];

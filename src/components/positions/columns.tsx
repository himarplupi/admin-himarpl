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
  PositionDeleteAlertContent,
  PositionDeleteAlertTrigger,
  PositionDeleteAlertWrapper,
} from "./position-delete-alert";
import {
  PositionEditContent,
  PositionEditTrigger,
  PositionEditWrapper,
} from "./position-edit-dialog";
import type { Position } from "./position-type";

export const columns: ColumnDef<Position>[] = [
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
    accessorKey: "departmentId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Departement
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const position = row.original;
      return <div className="capitalize">{position.department?.name} ({position.department?.year})</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const position = row.original;

      return (
        <PositionDeleteAlertWrapper>
          <PositionEditWrapper>
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
                  onClick={() => navigator.clipboard.writeText(position.id)}
                >
                  <Copy className="h-4 w-4" />
                  Copy position ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <PositionEditTrigger>
                  <DropdownMenuItem className="gap-x-2">
                    <Pencil className="h-4 w-4" />
                    Edit position
                  </DropdownMenuItem>
                </PositionEditTrigger>
                <PositionDeleteAlertTrigger>
                  <DropdownMenuItem className="gap-x-2">
                    <Trash className="h-4 w-4" />
                    Delete position
                  </DropdownMenuItem>
                </PositionDeleteAlertTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

            <PositionEditContent
              position={position}
              onEdit={() => table.options.meta?.onUpdateRows()}
            />
          </PositionEditWrapper>

          <PositionDeleteAlertContent
            positionIds={[position.id]}
            onDelete={table.options.meta?.onDeleteRows}
          />
        </PositionDeleteAlertWrapper>
      );
    },
  },
];

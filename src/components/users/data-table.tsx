"use client";

import * as React from "react";
import { api } from "@/trpc/react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, XIcon, Trash, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { columns } from "./columns";
import { UserCreateDialog } from "./user-create-dialog";
import { UserDeleteAlertDialog } from "./user-delete-alert";
import type {
  VisibilityState,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  RowData,
} from "@tanstack/table-core";
import type { Department, User } from "@/components/users/types";
import type { Session } from "next-auth";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { usePathname, useRouter } from "next/navigation";

declare module "@tanstack/table-core" {
  interface TableMeta<TData extends RowData> {
    onUpdateRows: () => Promise<void>;
    onDeleteRows: () => Promise<void>;
    departments: Department[];
  }
}

export function DataTableUsers({ session }: { session: Session }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentPeriod = pathname.split("/")[2] ?? "";

  const utils = api.useUtils();

  const users = api.user.byPeriod.useQuery({ period: currentPeriod });

  const departments =
    (api.department.getManySelect.useQuery({
      acronym: true,
    }).data as Department[]) ?? [];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [parent] = useAutoAnimate();

  const getRowIdSelection = React.useCallback(() => {
    if (!users.data) return [];
    return users.data
      .filter((user, index) => {
        if (rowSelection[index]) {
          return user.id;
        }
      })
      .map((user) => user.id);
  }, [users, rowSelection]);

  const table = useReactTable({
    columns,
    data: (users.data as User[]) ?? [],
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      onUpdateRows: async () => {
        await utils.user.invalidate();
      },
      onDeleteRows: async () => {
        await utils.user.invalidate();
        table.resetRowSelection();
      },
      departments,
    },
  });

  return (
    <div className="w-full">
      {/* If table row not selected show filter columns */}
      {table.getFilteredSelectedRowModel().rows.length === 0 && (
        <div className="flex items-center py-4">
          <UserCreateDialog
            currentPeriod={currentPeriod}
            departments={departments}
            onCreate={async () => {
              await utils.user.invalidate();
            }}
          />
          <Input
            placeholder="Filter names..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="ml-4 max-w-sm"
          />

          <div className="ml-auto flex gap-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            <Select
              value={currentPeriod}
              onValueChange={(value) => {
                router.push(`/users/${value}`);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Tahun Periode</SelectLabel>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* If table row selected show controls */}
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="my-4 h-10 rounded-md border">
          <Card className="h-full">
            <CardContent className="flex h-full items-center gap-x-2 p-0 px-1 text-muted-foreground">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  table.resetRowSelection();
                }}
              >
                <XIcon className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected
              </div>
              <UserDeleteAlertDialog
                onDelete={table.options.meta?.onDeleteRows}
                userIds={getRowIdSelection()}
              >
                <Button variant="ghost" size="icon">
                  <Trash className="h-4 w-4" />
                </Button>
              </UserDeleteAlertDialog>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody ref={parent}>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {table.getRowModel().rows.length < 1 && !users.isLoading && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}

            {users.isLoading && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="space-y-4 text-center"
                >
                  <Skeleton className="h-16 w-full rounded-md " />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center py-4">
        <div className="ml-auto flex gap-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

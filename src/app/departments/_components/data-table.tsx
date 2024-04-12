"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, XIcon, Trash, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { CreateDepartment } from "./create-department";
import { DeleteAlertDialog } from "./delete-alert";
import type { Department } from "@prisma/client";
import type {
  VisibilityState,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  RowData,
} from "@tanstack/table-core";

declare module "@tanstack/table-core" {
  interface TableMeta<TData extends RowData> {
    deleteRows: (ids: string[]) => void;
    updateRow: (newData?: TData) => void;
  }
}

export function DataTableDepartments({ data }: { data: Department[] }) {
  const [departments, setDepartments] = React.useState<Department[]>(data);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const getRowIdSelection = React.useCallback(
    () =>
      departments
        .filter((department, index) => {
          if (rowSelection[index]) {
            return department.id;
          }
        })
        .map((department) => department.id),
    [departments, rowSelection],
  );

  const table = useReactTable({
    columns,
    data: departments,
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
      deleteRows: (ids: string[]) => {
        setDepartments((prevData) =>
          prevData.filter((department) => !ids.includes(department.id)),
        );
        table.resetRowSelection();
      },
      updateRow: (newDepartment?: Department) => {
        if (!newDepartment) return;
        setDepartments((prevData) =>
          prevData.map((prevDepartment) =>
            prevDepartment.id === newDepartment.id
              ? newDepartment
              : prevDepartment,
          ),
        );
      },
    },
  });

  return (
    <div className="w-full">
      {/* If table row not selected show filter columns */}
      {table.getFilteredSelectedRowModel().rows.length === 0 && (
        <div className="flex items-center py-4">
          <CreateDepartment
            onCreate={(newData) =>
              setDepartments((prevData) => [...prevData, newData])
            }
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
              <DeleteAlertDialog
                onDelete={table.options.meta?.deleteRows}
                departmentIds={getRowIdSelection()}
              >
                <Button variant="ghost" size="icon">
                  <Trash className="h-4 w-4" />
                </Button>
              </DeleteAlertDialog>
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
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
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

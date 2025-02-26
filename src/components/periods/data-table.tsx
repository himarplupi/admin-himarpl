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
import { DepartmentCreateDialog } from "./period-create-dialog";
import { PeriodDeleteAlertDialog } from "./period-delete-alert";
import type {
  VisibilityState,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
} from "@tanstack/table-core";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export function DataTablePeriods() {
  const utils = api.useUtils();
  const periods = api.period.all.useQuery();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const [parent] = useAutoAnimate();

  const getRowIdSelection = React.useCallback(() => {
    if (!periods.data) return [];
    return periods.data
      .filter((period, index) => {
        if (rowSelection[index]) {
          return period.id;
        }
      })
      .map((period) => period.id);
  }, [periods, rowSelection]);

  const table = useReactTable({
    columns,
    data: periods.data ?? [],
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
        await utils.period.invalidate();
      },
      onDeleteRows: async () => {
        await utils.period.invalidate();
        table.resetRowSelection();
      },
    },
  });

  return (
    <div>
      {/* If table row not selected show filter columns */}
      {table.getFilteredSelectedRowModel().rows.length === 0 && (
        <div className="flex items-center py-4">
          <DepartmentCreateDialog
            onCreate={async () => {
              await utils.period.invalidate();
            }}
          />
          <Input
            placeholder="Filter names..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="ml-4 hidden max-w-sm sm:flex"
          />

          <div className="ml-auto flex gap-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="hidden sm:flex">
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
              <PeriodDeleteAlertDialog
                onDelete={table.options.meta?.onDeleteRows}
                periodIds={getRowIdSelection()}
              >
                <Button variant="ghost" size="icon">
                  <Trash className="h-4 w-4" />
                </Button>
              </PeriodDeleteAlertDialog>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="w-[82vw] rounded-md border sm:w-[80vw] md:w-[85vw] lg:w-full">
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
            {table?.getRowModel()?.rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell?.id}>
                    {flexRender(
                      cell?.column?.columnDef?.cell,
                      cell?.getContext(),
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {table.getRowModel()?.rows.length < 1 && !periods.isLoading && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}

            {periods.isLoading && (
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

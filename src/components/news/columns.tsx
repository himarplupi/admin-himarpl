"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreVertical, Trash, Copy, Pencil } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NewsDeleteAlertContent,
  NewsDeleteAlertTrigger,
  NewsDeleteAlertWrapper,
} from "./news-delete-alert";
import {
  PostEditContent,
  PostEditTrigger,
  PostEditWrapper,
} from "./news-edit-dialog";
import { abbreviation } from "@/lib/utils";
import type { Post } from "./news-types";
import { useState } from "react";

export const columns: ColumnDef<Post>[] = [
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
      const post = row.original;

      return (
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md">
          <Avatar>
            <AvatarImage
              className="scale-125 object-cover object-center"
              src={post?.image ?? ""}
              alt={post?.title ?? ""}
            />
            <AvatarFallback>{abbreviation(post.title)}</AvatarFallback>
          </Avatar>
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Author
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const author = row.original.author;
      return <div className="capitalize">{author?.name}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Create Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return date ? new Date(date).toLocaleString("id-ID") : "-";
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Update Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.original.updatedAt;
      return date ? new Date(date).toLocaleString("id-ID") : "-";
    },
  },

  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const news = row.original;
      const [isEditOpen, setIsEditOpen] = useState(false);
      return (
        <NewsDeleteAlertWrapper>
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
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
                  onClick={() => navigator.clipboard.writeText(news.id)}
                >
                  <Copy className="h-4 w-4" />
                  Copy news ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DialogTrigger>
                  <DropdownMenuItem
                    className="gap-x-2"
                    onSelect={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit News
                  </DropdownMenuItem>
                </DialogTrigger>
                <PostEditContent
                  post={news}
                  onEdit={() => table.options.meta?.onUpdateRows()}
                />
                <NewsDeleteAlertTrigger>
                  <DropdownMenuItem
                    className="gap-x-2"
                    onSelect={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <Trash className="h-4 w-4" />
                    Delete News
                  </DropdownMenuItem>
                </NewsDeleteAlertTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
          </Dialog>

          <NewsDeleteAlertContent
            newsIds={[news.id]}
            onDelete={table.options.meta?.onDeleteRows}
          />
        </NewsDeleteAlertWrapper>
      );
    },
  },
];

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
import { type InferSelectModel } from "drizzle-orm";
import { posts } from "@/server/db/schema";
import { type NewsFormSchema, newsFormSchema } from "./news-form-schema";
import { Textarea } from "../ui/textarea";

type Post = InferSelectModel<typeof posts>;

export function NewsCreateDialog({
  onCreate,
}: {
  onCreate: (data: Post) => void;
}) {
  const [parent] = useAutoAnimate();
  const createMutation = api.post.create.useMutation();
  const [open, setOpen] = useState(false);

  const form = useForm<NewsFormSchema>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      metaTitle: "",
      content: "",
      image: "",
      link: "",
      rawHtml: "",
      publishedAt: null,
      createdAt: null,
      updatedAt: null,
    },
  });

  const onSubmit = async (values: NewsFormSchema) => {
    setOpen(false);
    const now = new Date();

    const mutationPromise = createMutation.mutateAsync({
      title: values.title,
      slug: values.slug,
      metaTitle: values.metaTitle,
      image: values.image || "",
      content: values.content,
      postTagIds: ["cly42b4o80000e0epuhox87kq"],
      link: values.link || "",
    });
    toast.promise(mutationPromise, {
      loading: "Membuat post...",
      success: "Post berhasil dibuat",
      error: "Gagal membuat post",
      duration: 3000,
    });
    await mutationPromise.then((data) => onCreate(data));
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={createMutation.isLoading}>
          <Plus className="mr-2 h-4 w-4" /> New Post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen p-0 sm:max-w-[512px]">
        <div className="max-h-screen overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>New Post</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} id="create-post-form">
              <div className="grid gap-4 py-6" ref={parent}>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter post title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="example-slug" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter meta title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post Link</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter post link" />
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
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://example.com/image.jpg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Write your content here..."
                          rows={6}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
          <DialogFooter>
            <Button form="create-post-form" type="submit">
              Create
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

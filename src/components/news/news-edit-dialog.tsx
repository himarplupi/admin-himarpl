"use client";

import { useState, createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ReactLenis } from "lenis/react";
import { toast } from "sonner";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { type NewsFormSchema, newsFormSchema } from "./news-form-schema";
import type { Post } from "./news-types";

const EditPostContext = createContext<{
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}>({
  open: false,
  setOpen: () => false,
});

export function PostEditWrapper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <EditPostContext.Provider value={{ open, setOpen }}>
      <Dialog open={open} onOpenChange={setOpen}>
        {children}
      </Dialog>
    </EditPostContext.Provider>
  );
}

export function PostEditTrigger({ children }: { children: React.ReactNode }) {
  return <DialogTrigger asChild>{children}</DialogTrigger>;
}

export function PostEditContent({
  post,
  onEdit,
}: {
  post: Post;
  onEdit: () => void;
}) {
  const [parent] = useAutoAnimate();
  const { setOpen } = useContext(EditPostContext);
  const updateMutation = api.post.update.useMutation();

  const form = useForm<NewsFormSchema>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      title: post.title ?? "",
      slug: post.slug ?? "",
      metaTitle: post.metaTitle ?? "",
      content: post.content ?? "",
      rawHtml: post.content ?? "",
      link: post.link ?? "",
      image: post.image ?? "",
    },
  });

  const onSubmit = async (values: NewsFormSchema) => {
    setOpen(false);
    const mutationPromise = updateMutation.mutateAsync({
      id: post.id,
      title: values.title,
      slug: values.slug,
      link: values.link,
      metaTitle: values.metaTitle,
      image: values.image ?? "",
      content: values.content,
    });

    toast.promise(mutationPromise, {
      loading: "Mengubah postingan...",
      success: "Postingan berhasil diubah",
      error: "Gagal mengubah postingan",
      duration: 3000,
    });

    await mutationPromise.then(() => onEdit());
  };

  return (
    <DialogContent className="max-h-screen p-0 sm:max-w-[512px]">
      <ReactLenis className="max-h-screen overflow-y-auto">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} id="edit-post-form">
              <div className="grid gap-4 py-6" ref={parent}>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judul</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} />
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
                        <Input {...field} />
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
                      <FormLabel>Link</FormLabel>
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
                      <FormLabel>URL Gambar</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." />
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
                      <FormLabel>Konten</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[150px]"
                          {...field}
                          placeholder="Isi konten berita..."
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
            <Button
              variant="secondary"
              type="button"
              onClick={() => setOpen(false)}
            >
              Batalkan
            </Button>
            <Button form="edit-post-form" type="submit">
              Simpan perubahan
            </Button>
          </DialogFooter>
        </div>
      </ReactLenis>
    </DialogContent>
  );
}

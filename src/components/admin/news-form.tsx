
"use client";

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addNewsArticle, updateNewsArticle } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {  type NewsArticleFormData } from "@/types/client";
import { newsArticleFormSchemaRaw, type NewsArticle} from "@/types/server";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardDescription } from "@/components/ui/card";


// Construct the Zod schema using the imported raw parts
const newsSchema = z.object({
  title: newsArticleFormSchemaRaw.title(z),
  slug: newsArticleFormSchemaRaw.slug(z),
  summary: newsArticleFormSchemaRaw.summary(z),
  category: newsArticleFormSchemaRaw.category(z),
  publishedDate: newsArticleFormSchemaRaw.publishedDate(z),
  content: newsArticleFormSchemaRaw.content(z),
  imageUrl: newsArticleFormSchemaRaw.imageUrl(z).nullable(),
  dataAiHint: newsArticleFormSchemaRaw.dataAiHint(z).nullable(),
}) as z.ZodType<NewsArticleFormData>;


interface NewsArticleFormProps {
  initialData?: NewsArticle; // For editing
  articleId?: string; // For editing
  onSuccess?: () => void;
}

export function NewsArticleForm({ initialData, articleId, onSuccess }: NewsArticleFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditMode = !!articleId;
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);

  const { control, register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<NewsArticleFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: initialData ? {
      ...initialData,
      publishedDate: initialData.publishedDate ? new Date(initialData.publishedDate) : new Date(),
      imageUrl: initialData.imageUrl || "", // Ensure string for form
      dataAiHint: initialData.dataAiHint || "", // Ensure string for form
    } : {
      title: "",
      slug: "",
      summary: "",
      category: "",
      publishedDate: new Date(),
      content: "",
      imageUrl: "",
      dataAiHint: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        publishedDate: initialData.publishedDate ? new Date(initialData.publishedDate) : new Date(),
        imageUrl: initialData.imageUrl || "",
        dataAiHint: initialData.dataAiHint || "",
      });
      setImagePreview(initialData.imageUrl || null);
    }
  }, [initialData, reset]);

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  setImagePreview(URL.createObjectURL(file));

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok && data.secure_url) {
      setValue("imageUrl", data.secure_url);
      toast({ title: "Image Uploaded", description: "Successfully uploaded" });
    } else {
      throw new Error(data.error || "Unknown error");
    }
  } catch (err) {
    console.error("Upload failed:", err);
    toast({ title: "Upload Failed", description: "Unable to upload image.", variant: "destructive" });
  }
};


  const onSubmit: SubmitHandler<NewsArticleFormData> = async (data) => {
    const dataToSubmit = {
      ...data,
      imageUrl: data.imageUrl || null,
      dataAiHint: data.dataAiHint || null,
    };

    let result;
    if (isEditMode && articleId) {
      result = await updateNewsArticle(articleId, dataToSubmit);
    } else {
      result = await addNewsArticle(dataToSubmit);
    }

    if (result.success) {
      toast({
        title: isEditMode ? "News Article Updated!" : "News Article Added!",
        description: result.message,
      });
      if (!isEditMode) {
        reset();
        setImagePreview(null);
      }
      if (onSuccess) onSuccess();
      router.push("/dashboard/admin/manage-news");
      router.refresh();
    } else {
      toast({
        title: isEditMode ? "Error Updating Article" : "Error Adding Article",
        description: result.message || "An unknown error occurred.",
        variant: "destructive",
      });
      console.error("Error details:", result.errorDetails);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title")} className="mt-1" />
          {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <Label htmlFor="slug">Slug (URL-friendly identifier)</Label>
          <Input id="slug" {...register("slug")} className="mt-1" placeholder="e.g., new-policy-announced" readOnly={isEditMode} />
          {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
           {isEditMode && <p className="text-xs text-muted-foreground mt-1">Slug cannot be changed after creation.</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="summary">Summary</Label>
        <Textarea id="summary" {...register("summary")} rows={3} className="mt-1" />
        {errors.summary && <p className="text-sm text-destructive mt-1">{errors.summary.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="category">Category</Label>
          <Input id="category" {...register("category")} className="mt-1" placeholder="e.g., Governance, Health" />
          {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
        </div>
        <div>
          <Label htmlFor="publishedDate">Published Date</Label>
          <Controller
            name="publishedDate"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal mt-1", !field.value && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.publishedDate && <p className="text-sm text-destructive mt-1">{errors.publishedDate.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="content">Full Content</Label>
        <Textarea id="content" {...register("content")} rows={10} className="mt-1" placeholder="Write the full news article here..." />
        {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
      </div>

      <Card className="p-4 space-y-3 bg-muted/30">
        <Label htmlFor="imageFile">Featured Image</Label>
        <Input id="imageFile" type="file" accept="image/*" onChange={handleImageFileChange} className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
        {imagePreview && (
          <div className="mt-2">
            <Label>Image Preview:</Label>
            <Image src={imagePreview} alt="Preview" width={200} height={120} className="mt-1 rounded-md border object-cover aspect-video" />
          </div>
        )}
        <CardDescription className="text-xs">
          Slect an image to upload
        </CardDescription>
      </Card>

       {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="imageUrl">Image URL (Paste after uploading)</Label>
          <Input id="imageUrl" {...register("imageUrl")} className="mt-1" placeholder="https://your-storage.com/image.png" />
          {errors.imageUrl && <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>}
        </div>
         <div>
          <Label htmlFor="dataAiHint">Image AI Hint (Optional, max 2 words)</Label>
          <Input id="dataAiHint" {...register("dataAiHint")} className="mt-1" placeholder="e.g., government building" />
          {errors.dataAiHint && <p className="text-sm text-destructive mt-1">{errors.dataAiHint.message}</p>}
        </div>
      </div> */}

      <Button type="submit" className="w-full sm:w-auto button-hover" disabled={isSubmitting}>
        {isSubmitting ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update Article" : "Add News Article")}
      </Button>
    </form>
  );
}

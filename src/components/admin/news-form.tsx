'use client';

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
import { type NewsArticleFormData } from "@/types/client";
import { newsArticleFormSchemaRaw, type NewsArticle } from "@/types/server";
import { useEffect, useState } from "react";
import { Card, CardDescription } from "@/components/ui/card";
import QuillEditor from '../QuillEditor';

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
}

export default function NewsArticleForm({ initialData, articleId }: NewsArticleFormProps) {
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

    try {
      let result;
      if (isEditMode && articleId) {
        result = await updateNewsArticle(articleId, dataToSubmit);
      } else {
        result = await addNewsArticle(dataToSubmit);
      }

      if (result.success) {
        toast({
          title: "Success",
          description: isEditMode 
            ? "News article updated successfully!" 
            : "News article created successfully!"
        });
        router.push("/dashboard/admin/manage-news");
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter article title"
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="enter-slug-here"
            />
            {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary *</Label>
            <Textarea
              id="summary"
              {...register("summary")}
              placeholder="Brief summary of the article"
              rows={3}
            />
            {errors.summary && <p className="text-sm text-red-500">{errors.summary.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              {...register("category")}
              placeholder="e.g., Politics, Economy, Health"
            />
            {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="publishedDate">Published Date *</Label>
            <Controller
              name="publishedDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.publishedDate && <p className="text-sm text-red-500">{errors.publishedDate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataAiHint">AI Hint</Label>
            <Input
              id="dataAiHint"
              {...register("dataAiHint")}
              placeholder="Hint for AI image generation"
            />
            {errors.dataAiHint && <p className="text-sm text-red-500">{errors.dataAiHint.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Featured Image</Label>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <Input
                id="imageUrl"
                {...register("imageUrl")}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter image URL or upload an image below
              </p>
              {errors.imageUrl && <p className="text-sm text-red-500">{errors.imageUrl.message}</p>}
            </div>
            <div className="flex flex-col items-center gap-2">
              <Label
                htmlFor="imageUpload"
                className="cursor-pointer flex flex-col items-center gap-1 p-2 border rounded hover:bg-muted"
              >
                <ImageIcon className="h-5 w-5" />
                <span className="text-xs">Upload</span>
              </Label>
              <Input
                id="imageUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFileChange}
              />
            </div>
          </div>
        </div>

        {imagePreview && (
          <div className="space-y-2">
            <Label>Image Preview</Label>
            <div className="relative w-full h-48 rounded-md overflow-hidden border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="content">Content *</Label>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <QuillEditor
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : isEditMode ? (
              "Update Article"
            ) : (
              "Create Article"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
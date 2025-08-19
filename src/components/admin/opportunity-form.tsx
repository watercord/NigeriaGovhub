"use client";

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addOpportunity, updateOpportunity } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { type OpportunityFormData } from "@/lib/actions";
import { opportunityFormSchemaRaw, type Opportunity } from "@/types/server";
import { useEffect, useState } from "react";
import { Card, CardDescription } from "@/components/ui/card";
import QuillEditor from "../QuillEditor";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const opportunitySchema = z.object({
  title: opportunityFormSchemaRaw.title(z),
  slug: opportunityFormSchemaRaw.slug(z),
  summary: opportunityFormSchemaRaw.summary(z),
  category: opportunityFormSchemaRaw.category(z),
  publishedDate: opportunityFormSchemaRaw.publishedDate(z),
  content: opportunityFormSchemaRaw.content(z),
  imageUrl: opportunityFormSchemaRaw.imageUrl(z).nullable().optional(),
  dataAiHint: opportunityFormSchemaRaw.dataAiHint(z).nullable().optional(),
}) as z.ZodType<OpportunityFormData>;

interface OpportunityFormProps {
  initialData?: Opportunity;
  opportunityId?: string;
  onSuccess?: () => void;
}

export function OpportunityForm({
  initialData,
  opportunityId,
  onSuccess,
}: OpportunityFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditMode = !!opportunityId;
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageUrl || null
  );

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: initialData
      ? {
          ...initialData,
          publishedDate: initialData.publishedDate
            ? new Date(initialData.publishedDate)
            : new Date(),
          imageUrl: initialData.imageUrl || "",
          dataAiHint: initialData.dataAiHint || "",
        }
      : {
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
        publishedDate: initialData.publishedDate
          ? new Date(initialData.publishedDate)
          : new Date(),
        imageUrl: initialData.imageUrl || "",
        dataAiHint: initialData.dataAiHint || "",
      });
      setImagePreview(initialData.imageUrl || null);
    }
  }, [initialData, reset]);

  const handleImageFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
        toast({
          title: "Image Uploaded",
          description: "Successfully uploaded",
        });
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      toast({
        title: "Upload Failed",
        description: "Unable to upload image.",
        variant: "destructive",
      });
    }
  };

  const onSubmit: SubmitHandler<OpportunityFormData> = async (data) => {
    const dataToSubmit = {
      ...data,
      imageUrl: data.imageUrl || null,
      dataAiHint: data.dataAiHint || null,
      publishedDate: new Date(data.publishedDate),
    };

    let result;
    if (isEditMode && opportunityId) {
      result = await updateOpportunity(opportunityId, dataToSubmit);
    } else {
      result = await addOpportunity(dataToSubmit);
    }

    if (result.success) {
      toast({
        title: isEditMode ? "Opportunity Updated!" : "Opportunity Added!",
        description: result.message,
      });
      if (!isEditMode) {
        reset();
        setImagePreview(null);
      }
      if (onSuccess) onSuccess();
      router.push("/dashboard/admin/manage-opportunity");
      router.refresh();
    } else {
      toast({
        title: isEditMode
          ? "Error Updating Opportunity"
          : "Error Adding Opportunity",
        description: result.message || "An unknown error occurred.",
        variant: "destructive",
      });
      console.error("Error details:", result.errorDetails);
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
              placeholder="Enter opportunity title"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="enter-slug-here"
            />
            {errors.slug && (
              <p className="text-sm text-red-500">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary *</Label>
            <Textarea
              id="summary"
              {...register("summary")}
              placeholder="Brief summary"
              rows={3}
            />
            {errors.summary && (
              <p className="text-sm text-red-500">{errors.summary.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              {...register("category")}
              placeholder="e.g., Finance, Agriculture, Education"
            />
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
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
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
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
            {errors.publishedDate && (
              <p className="text-sm text-red-500">
                {errors.publishedDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataAiHint">AI Hint</Label>
            <Input
              id="dataAiHint"
              {...register("dataAiHint")}
              placeholder="Hint for AI image generation"
            />
            {errors.dataAiHint && (
              <p className="text-sm text-red-500">
                {errors.dataAiHint.message}
              </p>
            )}
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
              {errors.imageUrl && (
                <p className="text-sm text-red-500">
                  {errors.imageUrl.message}
                </p>
              )}
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
              <QuillEditor value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.content && (
            <p className="text-sm text-red-500">{errors.content.message}</p>
          )}
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
            {isSubmitting
              ? isEditMode
                ? "Updating..."
                : "Adding..."
              : isEditMode
                ? "Update Opportunity"
                : "Add Opportunity"}
          </Button>
        </div>
      </form>
    </Card>
  );
}


"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addService, updateService } from "@/lib/actions";
import { useRouter } from "next/navigation";
import {  type ServiceItems, type ServiceFormData } from "@/types/client";
import { serviceFormSchemaRaw } from "@/types/server"
import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardDescription } from "@/components/ui/card";
import QuillEditor from "@/components/QuillEditor";


const serviceSchema = z.object({
  title: serviceFormSchemaRaw.title(z),
  slug: serviceFormSchemaRaw.slug(z),
  summary: serviceFormSchemaRaw.summary(z),
  category: serviceFormSchemaRaw.category(z),
  link: serviceFormSchemaRaw.link(z).nullable().optional(),
  imageUrl: serviceFormSchemaRaw.imageUrl(z).nullable().optional(),
  dataAiHint: serviceFormSchemaRaw.dataAiHint(z).nullable().optional(),
  iconName: serviceFormSchemaRaw.iconName(z).nullable().optional(),
}) as z.ZodType<ServiceFormData>;


interface ServiceFormProps {
  initialData?: ServiceItems;
  serviceId?: string;
  onSuccess?: () => void;
}

export function ServiceForm({ initialData, serviceId, onSuccess }: ServiceFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditMode = !!serviceId;
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: initialData ? {
      ...initialData,
      link: initialData.link || "",
      imageUrl: initialData.imageUrl || "",
      dataAiHint: initialData.dataAiHint || "",
      iconName: initialData.iconName || undefined,
    } : {
      title: "",
      slug: "",
      summary: "",
      category: "",
      link: "",
      imageUrl: "",
      dataAiHint: "",
      iconName: undefined,
    },
  });

  const watchSummary = watch("summary", initialData?.summary || "");

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        link: initialData.link || "",
        imageUrl: initialData.imageUrl || "",
        dataAiHint: initialData.dataAiHint || "",
        iconName: initialData.iconName || undefined,
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
      toast({ title: "image Uploaded", description: "Successfully uploaded" });
    } else {
      throw new Error(data.error || "Unknown error");
    }
  } catch (err) {
    console.error("Upload failed:", err);
    toast({ title: "Upload Failed", description: "Unable to upload image.", variant: "destructive" });
  }
};

  const onSubmit: SubmitHandler<ServiceFormData> = async (data) => {
    const dataToSubmit = {
      ...data,
      link: data.link || null,
      imageUrl: data.imageUrl || null,
      dataAiHint: data.dataAiHint || null,
      iconName: data.iconName || null,
    };

    let result;
    if (isEditMode && serviceId) {
      result = await updateService(serviceId, dataToSubmit);
    } else {
      result = await addService(dataToSubmit);
    }

    if (result.success) {
      toast({
        title: isEditMode ? "Service Updated!" : "Service Added!",
        description: result.message,
      });
      if (!isEditMode) {
        reset();
        setImagePreview(null);
      }
      if (onSuccess) onSuccess();
      router.push("/dashboard/admin/manage-services");
      router.refresh();
    } else {
      toast({
        title: isEditMode ? "Error Updating Service" : "Error Adding Service",
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
          <Label htmlFor="title">Service Title</Label>
          <Input id="title" {...register("title")} className="mt-1" />
          {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <Label htmlFor="slug">Slug (URL-friendly identifier)</Label>
          <Input id="slug" {...register("slug")} className="mt-1" placeholder="e.g., apply-for-passport" readOnly={isEditMode} />
          {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
          {isEditMode && <p className="text-xs text-muted-foreground mt-1">Slug cannot be changed after creation.</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="summary">Summary</Label>
        <QuillEditor 
          value={watchSummary} 
          onChange={(content) => setValue("summary", content)} 
        />
        {errors.summary && <p className="text-sm text-destructive mt-1">{errors.summary.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="category">Category</Label>
          <Input id="category" {...register("category")} className="mt-1" placeholder="e.g., Immigration, Health" />
          {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
        </div>
        <div>
          <Label htmlFor="iconName">Icon Name (Optional, e.g., Plane, Briefcase)</Label>
          <Input id="iconName" {...register("iconName")} className="mt-1" placeholder="Lucide icon name" />
          {errors.iconName && <p className="text-sm text-destructive mt-1">{errors.iconName.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="link">Direct Link to Service (Optional)</Label>
        <Input id="link" {...register("link")} className="mt-1" placeholder="https://example.gov.ng/service-portal" />
        {errors.link && <p className="text-sm text-destructive mt-1">{errors.link.message}</p>}
      </div>

      <Card className="p-4 space-y-3 bg-muted/30">
        <Label htmlFor="imageFile">Service Image (Optional)</Label>
        <Input id="imageFile" type="file" accept="image/*" onChange={handleImageFileChange} className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
        {imagePreview && (
          <div className="mt-2">
            <Label>Image Preview:</Label>
            <Image src={imagePreview} alt="Preview" width={200} height={120} className="mt-1 rounded-md border object-cover aspect-video" />
          </div>
        )}
        <CardDescription className="text-xs">
          Select an image to preview. Then, upload it to your storage and paste the URL into the 'Image URL' field below.
        </CardDescription>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="imageUrl">Image URL (Optional, paste after uploading)</Label>
          <Input id="imageUrl" {...register("imageUrl")} className="mt-1" placeholder="https://example.com/image.png" />
          {errors.imageUrl && <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>}
        </div>
         <div>
          <Label htmlFor="dataAiHint">Image AI Hint (Optional, max 2 words)</Label>
          <Input id="dataAiHint" {...register("dataAiHint")} className="mt-1" placeholder="e.g., service logo" />
          {errors.dataAiHint && <p className="text-sm text-destructive mt-1">{errors.dataAiHint.message}</p>}
        </div>
      </div>

      <Button type="submit" className="w-full sm:w-auto button-hover" disabled={isSubmitting}>
        {isSubmitting ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update Service" : "Add Service")}
      </Button>
    </form>
  );
}

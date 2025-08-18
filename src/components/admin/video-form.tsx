
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addVideo, updateVideo } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { type VideoFormData } from "@/types/client";
import { videoFormSchemaRaw, type Video } from "@/types/server"
import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardDescription } from "@/components/ui/card";

// Function to convert YouTube URL to embed format
const convertToEmbedUrl = (url: string): string => {
  // Handle different YouTube URL formats
  let videoId = '';
  
  // Format: https://www.youtube.com/watch?v=VIDEO_ID
  const youtubeWatchRegex = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;
  const watchMatch = url.match(youtubeWatchRegex);
  
  // Format: https://youtu.be/VIDEO_ID
  const youtuBeRegex = /youtu\.be\/([a-zA-Z0-9_-]+)/;
  const shortMatch = url.match(youtuBeRegex);
  
  // Format: https://www.youtube.com/embed/VIDEO_ID
  const embedRegex = /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/;
  const embedMatch = url.match(embedRegex);
  
  if (watchMatch) {
    videoId = watchMatch[1];
  } else if (shortMatch) {
    videoId = shortMatch[1];
  } else if (embedMatch) {
    videoId = embedMatch[1];
  } else {
    // If no match, return original URL
    return url;
  }
  
  // Return embed URL
  return `https://www.youtube.com/embed/${videoId}`;
};

const videoSchema = z.object({
  title: videoFormSchemaRaw.title(z),
  url: videoFormSchemaRaw.url(z),
  thumbnailUrl: videoFormSchemaRaw.thumbnailUrl(z).nullable().optional(),
  dataAiHint: videoFormSchemaRaw.dataAiHint(z).nullable().optional(),
  description: videoFormSchemaRaw.description(z).nullable().optional(),
}) as z.ZodType<VideoFormData>;

interface VideoFormProps {
  initialData?: Video;
  videoId?: string;
  onSuccess?: () => void;
}

export function VideoForm({ initialData, videoId, onSuccess }: VideoFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditMode = !!videoId;
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initialData?.thumbnailUrl || null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: initialData ? {
      ...initialData,
      thumbnailUrl: initialData.thumbnailUrl || "",
      dataAiHint: initialData.dataAiHint || "",
      description: initialData.description || "",
    } : {
      title: "",
      url: "",
      thumbnailUrl: "",
      dataAiHint: "",
      description: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        thumbnailUrl: initialData.thumbnailUrl || "",
        dataAiHint: initialData.dataAiHint || "",
        description: initialData.description || "",
      });
      setThumbnailPreview(initialData.thumbnailUrl || null);
    }
  }, [initialData, reset]);

  const handleThumbnailFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setValue('thumbnailUrl', '');
    } else {
      setThumbnailPreview(initialData?.thumbnailUrl || null);
      setValue('thumbnailUrl', initialData?.thumbnailUrl || '');
    }
  };

  const onSubmit: SubmitHandler<VideoFormData> = async (data) => {
    // Convert YouTube URL to embed format before submitting
    const dataToSubmit = {
      ...data,
      url: convertToEmbedUrl(data.url),
      thumbnailUrl: data.thumbnailUrl || null,
      dataAiHint: data.dataAiHint || null,
      description: data.description || null,
    };

    let result;
    if (isEditMode && videoId) {
      result = await updateVideo(videoId, dataToSubmit);
    } else {
      result = await addVideo(dataToSubmit);
    }

    if (result.success) {
      toast({
        title: isEditMode ? "Video Updated!" : "Video Added!",
        description: result.message,
      });
      if (!isEditMode) {
        reset();
        setThumbnailPreview(null);
      }
      if (onSuccess) onSuccess();
      router.push("/dashboard/admin/manage-videos");
      router.refresh();
    } else {
      toast({
        title: isEditMode ? "Error Updating Video" : "Error Adding Video",
        description: result.message || "An unknown error occurred.",
        variant: "destructive",
      });
      console.error("Error details:", result.errorDetails);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="title">Video Title</Label>
        <Input id="title" {...register("title")} className="mt-1" />
        {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="url">YouTube Video URL</Label>
        <Input 
          id="url" 
          {...register("url")} 
          className="mt-1" 
          placeholder="e.g., https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID" 
        />
        <p className="text-sm text-muted-foreground mt-1">
          Enter a YouTube video URL. It will be automatically converted to embed format.
        </p>
        {errors.url && <p className="text-sm text-destructive mt-1">{errors.url.message}</p>}
      </div>

      {/* <Card className="p-4 space-y-3 bg-muted/30">
        <Label htmlFor="thumbnailFile">Video Thumbnail (Optional)</Label>
        <Input id="thumbnailFile" type="file" accept="image/*" onChange={handleThumbnailFileChange} className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
        {thumbnailPreview && (
          <div className="mt-2">
            <Label>Thumbnail Preview:</Label>
            <Image src={thumbnailPreview} alt="Thumbnail Preview" width={200} height={120} className="mt-1 rounded-md border object-cover aspect-video" />
          </div>
        )}
        <CardDescription className="text-xs">
          Select a thumbnail image to preview. Then, upload it and paste the URL into the 'Thumbnail URL' field below.
        </CardDescription>
      </Card>

      <div>
        <Label htmlFor="thumbnailUrl">Thumbnail URL (Optional, paste after uploading)</Label>
        <Input id="thumbnailUrl" {...register("thumbnailUrl")} className="mt-1" placeholder="https://example.com/thumbnail.jpg" />
        {errors.thumbnailUrl && <p className="text-sm text-destructive mt-1">{errors.thumbnailUrl.message}</p>}
      </div>

      <div>
        <Label htmlFor="dataAiHint">Thumbnail AI Hint (Optional, max 2 words)</Label>
        <Input id="dataAiHint" {...register("dataAiHint")} className="mt-1" placeholder="e.g., government building" />
        {errors.dataAiHint && <p className="text-sm text-destructive mt-1">{errors.dataAiHint.message}</p>}
      </div> */}

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea id="description" {...register("description")} rows={3} className="mt-1" />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
      </div>

      <Button type="submit" className="w-full sm:w-auto button-hover" disabled={isSubmitting}>
        {isSubmitting ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update Video" : "Add Video")}
      </Button>
    </form>
  );
}

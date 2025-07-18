import { NextRequest, NextResponse } from "next/server";
import { getVideoByIdAction as getVideoById, updateVideo as updateVideoInDb } from "@/lib/actions";
import { videoFormSchemaRaw } from "@/types/server";
import { VideoFormData } from "@/types/client";
import * as z from "zod";

// Define Zod schema using videoFormSchemaRaw
const videoSchema = z.object({
  title: videoFormSchemaRaw.title(z),
  url: videoFormSchemaRaw.url(z),
  thumbnailUrl: videoFormSchemaRaw.thumbnailUrl(z).nullable().optional(),
  dataAiHint: videoFormSchemaRaw.dataAiHint(z).nullable().optional(),
  description: videoFormSchemaRaw.description(z).nullable().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("📦 GET /api/videos/[id] called with ID:", params.id);

  try {
    const video = await getVideoById(params.id);
    if (!video) {
      console.warn("⚠️ Video not found for ID:", params.id);
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error("❌ Error fetching video:", error);
    return NextResponse.json({ message: "Failed to fetch video" }, { status: 500 });
  }
}


export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    // Validate incoming data
    const parsedData = videoSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json({ message: "Invalid input", errors: parsedData.error.format() }, { status: 400 });
    }

    const updatedVideo = await updateVideoInDb(params.id, parsedData.data);
    if (!updatedVideo) {
      return NextResponse.json({ message: "Failed to update video" }, { status: 500 });
    }

    return NextResponse.json({ message: "Video updated successfully", video: updatedVideo });
  } catch (error) {
    console.error("PATCH /api/videos/[id] error:", error);
    return NextResponse.json({ message: "Error updating video" }, { status: 500 });
  }
}

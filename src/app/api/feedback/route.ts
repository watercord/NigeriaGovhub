"use server";
import { submitProjectFeedback } from "@/lib/actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, ...formData } = body;

    const result = await submitProjectFeedback(projectId, formData);
    return Response.json(result);
  } catch (err) {
    console.error("API Feedback Error", err);
    return Response.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

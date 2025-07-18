// src/app/api/reset/route.ts
import { NextResponse } from "next/server";
import { resetAction } from "@/lib/actions";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const result = await resetAction(email);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Password reset error:", err);
    return NextResponse.json(
      { success: "", error: "Failed to send reset email." },
      { status: 500 }
    );
  }
}

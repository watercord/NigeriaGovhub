// src/app/api/verify/route.ts
import { NextResponse } from "next/server";
import { newVerificationAction } from "@/lib/actions";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Verification token missing." }, { status: 400 });
    }

    const result = await newVerificationAction(token);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: result.success });
  } catch (error) {
    return NextResponse.json({ error: "Server error while verifying account." }, { status: 500 });
  }
}

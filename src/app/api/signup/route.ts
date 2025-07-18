// src/app/api/signup/route.ts
import { NextResponse } from "next/server";
import { createUserAction } from "@/lib/actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await createUserAction(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Signup API error:", err);
    return NextResponse.json({ success: false, message: "Signup failed." }, { status: 500 });
  }
}

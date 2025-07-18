
import { NextResponse } from "next/server";
import { newPasswordAction } from "@/lib/actions";

export async function POST(req: Request) {
  try {
    const { password, token } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required." }, { status: 400 });
    }

    const result = await newPasswordAction(password, token);
    return NextResponse.json(result);
  } catch (err) {
    console.error("New password error:", err);
    return NextResponse.json(
      { error: "Failed to reset your password." },
      { status: 500 }
    );
  }
}

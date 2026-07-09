import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message:
        "Demo seeding is disabled. Create a real account via /register, then sign in.",
    },
    { status: 410 }
  );
}

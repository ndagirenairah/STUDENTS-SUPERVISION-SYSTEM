import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/actions";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await login(
      String(body.email ?? ""),
      String(body.password ?? "")
    );

    if (result.error) {
      return NextResponse.json(result, { status: 401 });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

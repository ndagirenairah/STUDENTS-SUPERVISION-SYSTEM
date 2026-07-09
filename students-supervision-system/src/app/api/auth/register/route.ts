import { NextRequest, NextResponse } from "next/server";
import { register } from "@/lib/actions";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await register({
      email: String(body.email ?? ""),
      password: String(body.password ?? ""),
      confirmPassword: String(body.confirmPassword ?? body.password ?? ""),
      name: String(body.name ?? ""),
      role: body.role === "supervisor" ? "supervisor" : "student",
      department: String(body.department ?? ""),
      studentId: body.studentId ? String(body.studentId) : undefined,
    });

    if (result.error) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

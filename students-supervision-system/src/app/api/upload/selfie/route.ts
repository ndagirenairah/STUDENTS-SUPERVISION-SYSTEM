import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_") || "selfie.jpg";
    const relativePath = path.join("selfies", user.id, `${timestamp}-${randomUUID().slice(0, 8)}-${safeName}`);
    const absoluteDir = path.join(process.cwd(), "uploads", "selfies", user.id);
    const absolutePath = path.join(process.cwd(), "uploads", relativePath);

    await mkdir(absoluteDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(absolutePath, buffer);

    return NextResponse.json({
      pathname: relativePath.replace(/\\/g, "/"),
    });
  } catch (error: unknown) {
    console.error("[Upload Error]:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

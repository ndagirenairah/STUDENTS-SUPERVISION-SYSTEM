import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readFile, stat } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

function contentTypeFromPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".jpg":
    case ".jpeg":
    default:
      return "image/jpeg";
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pathname = request.nextUrl.searchParams.get("pathname");
    if (!pathname) {
      return NextResponse.json({ error: "Missing pathname" }, { status: 400 });
    }

    // Prevent path traversal
    const normalized = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, "");
    if (normalized.includes("..")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Students may only access their own selfies; supervisors/admins can view any
    if (
      normalized.startsWith("selfies/") &&
      user.role === "student" &&
      !normalized.includes(user.id)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const absolutePath = path.join(process.cwd(), "uploads", normalized);

    try {
      await stat(absolutePath);
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const data = await readFile(absolutePath);
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentTypeFromPath(absolutePath),
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error: unknown) {
    console.error("[File Serving Error]:", error);
    return NextResponse.json({ error: "Failed to retrieve file" }, { status: 500 });
  }
}

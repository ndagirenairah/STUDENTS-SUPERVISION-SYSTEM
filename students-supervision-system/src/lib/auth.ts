import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID, createHash } from "crypto";

export async function hashPassword(password: string): Promise<string> {
  return createHash("sha256")
    .update(password + "student-supervision-salt")
    .digest("hex");
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const hashed = await hashPassword(password);
  return hashed === hash;
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  try {
    const cookieStore = await cookies();
    cookieStore.set("session_id", sessionId, {
      httpOnly: true,
      // Keep sessions usable in local/sandbox previews without HTTPS.
      secure: false,
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });
  } catch (cookieErr) {
    // Cookie APIs require a request scope. Session row is still valid.
    console.warn("[Auth] Cookie setting warning:", cookieErr);
  }

  return sessionId;
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;
    if (!sessionId) return null;

    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    return user ?? null;
  } catch {
    return null;
  }
}

export async function logout() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (sessionId) {
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    }

    cookieStore.delete("session_id");
  } catch (err) {
    console.warn("[Auth] Logout warning:", err);
  }
}

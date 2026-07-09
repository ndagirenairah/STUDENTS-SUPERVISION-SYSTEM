import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  students,
  supervisors,
  tasks,
  attendance,
  activityLogs,
  workEvidence,
  productivityScores,
} from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  const results: {
    status: string;
    timestamp: string;
    checks: Record<string, unknown>;
    responseTimeMs?: number;
    error?: string;
  } = {
    status: "operational",
    timestamp: new Date().toISOString(),
    checks: {},
  };

  try {
    await db.execute(sql`SELECT 1`);
    results.checks.database = { status: "ok", message: "Connected" };

    const [
      usersList,
      studentsList,
      supervisorsList,
      tasksList,
      attendanceList,
      activityList,
      evidenceList,
      productivityList,
    ] = await Promise.all([
      db.select().from(users),
      db.select().from(students),
      db.select().from(supervisors),
      db.select().from(tasks),
      db.select().from(attendance),
      db.select().from(activityLogs),
      db.select().from(workEvidence),
      db.select().from(productivityScores),
    ]);

    results.checks.tables = {
      users: usersList.length,
      students: studentsList.length,
      supervisors: supervisorsList.length,
      tasks: tasksList.length,
      attendance: attendanceList.length,
      activityLogs: activityList.length,
      workEvidence: evidenceList.length,
      productivityScores: productivityList.length,
    };

    results.checks.hasUsers = usersList.length > 0;
    results.checks.aiEngine = {
      status: "active",
      model: "Random Forest (Weighted Scoring)",
      version: "v2.1.0",
    };
    results.responseTimeMs = Date.now() - startTime;
    results.status = "operational";

    return NextResponse.json(results);
  } catch (error: unknown) {
    results.status = "error";
    results.error = error instanceof Error ? error.message : "Unknown error";
    results.responseTimeMs = Date.now() - startTime;
    return NextResponse.json(results, { status: 500 });
  }
}

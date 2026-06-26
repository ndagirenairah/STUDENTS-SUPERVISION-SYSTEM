import { NextResponse } from 'next/server';
import { seedDatabase } from '@/db/seed';
import { db } from '@/db';
import { users, students, supervisors, tasks, attendance } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check current state
    const [userCount, studentCount, supervisorCount, taskCount, attendanceCount] = await Promise.all([
      db.select().from(users),
      db.select().from(students),
      db.select().from(supervisors),
      db.select().from(tasks),
      db.select().from(attendance),
    ]);

    const alreadySeeded = userCount.length > 0;

    if (!alreadySeeded) {
      await seedDatabase();
    }

    return NextResponse.json({
      success: true,
      alreadySeeded,
      stats: {
        users: userCount.length,
        students: studentCount.length,
        supervisors: supervisorCount.length,
        tasks: taskCount.length,
        attendance: attendanceCount.length,
      },
      message: alreadySeeded ? 'Database already seeded' : 'Database seeded successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to seed database', details: error?.message },
      { status: 500 }
    );
  }
}

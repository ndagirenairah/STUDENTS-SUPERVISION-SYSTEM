import { NextResponse } from 'next/server';
import { seedDatabase } from '@/db/seed';

export async function GET() {
  try {
    await seedDatabase();
    return NextResponse.json({ success: true, message: 'Database seeded' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}

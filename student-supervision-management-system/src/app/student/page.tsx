import { getStudentDashboard, logout } from '@/lib/actions';
import { redirect } from 'next/navigation';
import StudentDashboardClient from './dashboard-client';

export const dynamic = 'force-dynamic';

export default async function StudentDashboardPage() {
  const data = await getStudentDashboard();
  
  if (!data) {
    redirect('/');
  }

  return <StudentDashboardClient data={data} logoutAction={logout} />;
}

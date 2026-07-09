import { getSupervisorDashboard, logout } from '@/lib/actions';
import { redirect } from 'next/navigation';
import SupervisorDashboardClient from './dashboard-client';

export const dynamic = 'force-dynamic';

export default async function SupervisorDashboardPage() {
  const data = await getSupervisorDashboard();
  
  if (!data) {
    redirect('/');
  }

  return <SupervisorDashboardClient data={data} logoutAction={logout} />;
}

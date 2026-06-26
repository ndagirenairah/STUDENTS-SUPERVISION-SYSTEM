import { getAdminDashboard, logout } from '@/lib/actions';
import { redirect } from 'next/navigation';
import AdminDashboardClient from './dashboard-client';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const data = await getAdminDashboard();
  
  if (!data) {
    redirect('/');
  }

  return <AdminDashboardClient data={data} logoutAction={logout} />;
}

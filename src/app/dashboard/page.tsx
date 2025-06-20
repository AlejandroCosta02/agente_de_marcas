import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import DashboardClient from '@/components/dashboard/DashboardClient';
// import Navbar from '@/components/Navbar'; // Removed

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  console.log('Dashboard page - Session check:', {
    hasSession: !!session,
    sessionData: session,
    timestamp: new Date().toISOString()
  });

  if (!session) {
    console.log('No session found, redirecting to landing page');
    redirect('/');
  }

  console.log('Session found, rendering dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> Removed */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <DashboardClient />
      </main>
    </div>
  );
} 
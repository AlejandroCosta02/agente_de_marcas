import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import DashboardClient from '@/components/dashboard/DashboardClient';
import Navbar from '@/components/Navbar';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

async function getData() {
  const marcas = await prisma.marca.findMany({
    orderBy: {
      renovar: 'asc',
    },
  });
  return marcas;
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/?error=Unauthorized');
  }

  const initialMarcas = await getData();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <DashboardClient initialMarcas={initialMarcas} />
      </main>
    </div>
  );
} 
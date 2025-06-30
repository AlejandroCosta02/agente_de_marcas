import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import DashboardClient from '@/components/dashboard/DashboardClient';
import type { Metadata } from 'next';
// import Navbar from '@/components/Navbar'; // Removed

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Panel de control de Gestiona tus Marcas. Gestioná tus expedientes de marcas, seguí fechas importantes y organizá tu portafolio de marcas comerciales.",
  keywords: [
    "dashboard gestiona tus marcas",
    "panel control marcas",
    "expedientes marcas",
    "gestión marcas comerciales",
    "seguimiento marcas",
    "portafolio marcas",
    "fechas vencimiento"
  ],
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: "Dashboard - Gestiona tus Marcas",
    description: "Panel de control de Gestiona tus Marcas. Gestioná tus expedientes de marcas y seguí fechas importantes.",
    url: "https://gestionatusmarcas.com/dashboard",
    images: [
      {
        url: "https://gestionatusmarcas.com/logo-d.svg",
        width: 1200,
        height: 630,
        alt: "Gestiona tus Marcas - Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard - Gestiona tus Marcas",
    description: "Panel de control de Gestiona tus Marcas. Gestioná tus expedientes de marcas.",
    images: ["https://gestionatusmarcas.com/logo-d.svg"],
  },
  alternates: {
    canonical: "https://gestionatusmarcas.com/dashboard",
  },
};

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
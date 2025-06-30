import type { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';

export const metadata: Metadata = {
  title: "Inicio",
  description: "La plataforma más completa para gestionar tus expedientes de marcas ante el INPI. Organizá, seguí y protegé tu portafolio de marcas desde un solo lugar.",
  keywords: [
    "gestión de marcas",
    "expedientes INPI",
    "portafolio de marcas",
    "agentes de marcas",
    "propiedad intelectual Argentina",
    "registro de marcas",
    "seguimiento de marcas",
    "plataforma legaltech"
  ],
  openGraph: {
    title: "Gestiona tus Marcas - La Plataforma Más Completa para Gestión de Marcas",
    description: "La plataforma más completa para gestionar tus expedientes de marcas ante el INPI. Organizá, seguí y protegé tu portafolio de marcas desde un solo lugar.",
    url: "https://gestionatusmarcas.com",
    images: [
      {
        url: "/captura-1.png",
        width: 1200,
        height: 800,
        alt: "Dashboard de Gestiona tus Marcas - Vista principal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gestiona tus Marcas - La Plataforma Más Completa para Gestión de Marcas",
    description: "La plataforma más completa para gestionar tus expedientes de marcas ante el INPI.",
    images: ["/captura-1.png"],
  },
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return <HomeClient />;
}

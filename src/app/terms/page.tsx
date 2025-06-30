import type { Metadata } from 'next';
import TermsClient from '@/components/TermsClient';

export const metadata: Metadata = {
  title: "Términos de Servicio",
  description: "Términos de Servicio de Gestiona tus Marcas. Lea nuestros términos y condiciones para el uso de la plataforma de gestión de marcas comerciales en Argentina.",
  keywords: [
    "términos de servicio",
    "condiciones uso",
    "gestiona tus marcas términos",
    "plataforma marcas términos",
    "uso aceptable",
    "propiedad intelectual",
    "limitación responsabilidad"
  ],
  openGraph: {
    title: "Términos de Servicio - Gestiona tus Marcas",
    description: "Términos de Servicio de Gestiona tus Marcas. Lea nuestros términos y condiciones para el uso de la plataforma.",
    url: "https://gestionatusmarcas.com/terms",
    images: [
      {
        url: "/logo-d.svg",
        width: 1200,
        height: 630,
        alt: "Gestiona tus Marcas - Términos de Servicio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Términos de Servicio - Gestiona tus Marcas",
    description: "Términos de Servicio de Gestiona tus Marcas. Lea nuestros términos y condiciones.",
    images: ["/logo-d.svg"],
  },
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return <TermsClient />;
} 
import type { Metadata } from 'next';
import AboutClient from '@/components/AboutClient';

export const metadata: Metadata = {
  title: "Sobre Nosotros",
  description: "Somos la plataforma líder en Argentina para la gestión profesional de marcas comerciales. Simplificamos el trabajo de agentes, estudios jurídicos y empresas con herramientas inteligentes.",
  keywords: [
    "sobre gestiona tus marcas",
    "plataforma gestión marcas Argentina",
    "agentes de marcas profesionales",
    "herramientas derecho marcario",
    "gestión expedientes INPI",
    "legaltech Argentina",
    "propiedad intelectual"
  ],
  openGraph: {
    title: "Sobre Gestiona tus Marcas - Plataforma Líder en Gestión de Marcas",
    description: "Somos la plataforma líder en Argentina para la gestión profesional de marcas comerciales. Simplificamos el trabajo de agentes, estudios jurídicos y empresas.",
    url: "https://gestionatusmarcas.com/about",
    images: [
      {
        url: "/logo-d.svg",
        width: 1200,
        height: 630,
        alt: "Gestiona tus Marcas - Sobre Nosotros",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre Gestiona tus Marcas - Plataforma Líder en Gestión de Marcas",
    description: "Somos la plataforma líder en Argentina para la gestión profesional de marcas comerciales.",
    images: ["/logo-d.svg"],
  },
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return <AboutClient />;
} 
import type { Metadata } from 'next';
import PrivacyClient from '@/components/PrivacyClient';

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de Privacidad de Gestiona tus Marcas. Conozca cómo protegemos y manejamos su información personal en nuestra plataforma de gestión de marcas.",
  keywords: [
    "política de privacidad",
    "protección datos",
    "privacidad gestiona tus marcas",
    "datos personales",
    "seguridad información",
    "cookies",
    "derechos usuario"
  ],
  openGraph: {
    title: "Política de Privacidad - Gestiona tus Marcas",
    description: "Política de Privacidad de Gestiona tus Marcas. Conozca cómo protegemos y manejamos su información personal.",
    url: "https://gestionatusmarcas.com/privacy",
    images: [
      {
        url: "/logo-d.svg",
        width: 1200,
        height: 630,
        alt: "Gestiona tus Marcas - Política de Privacidad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Política de Privacidad - Gestiona tus Marcas",
    description: "Política de Privacidad de Gestiona tus Marcas. Conozca cómo protegemos su información.",
    images: ["/logo-d.svg"],
  },
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
} 
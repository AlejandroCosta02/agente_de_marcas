import type { Metadata } from 'next';
import ContactClient from '@/components/ContactClient';

export const metadata: Metadata = {
  title: "Contacto",
  description: "Conectá con nuestro equipo de Gestiona tus Marcas. Tu experiencia nos impulsa a mejorar. Valoramos profundamente tus comentarios y sugerencias para construir una mejor plataforma.",
  keywords: [
    "contacto gestiona tus marcas",
    "soporte plataforma marcas",
    "ayuda gestión marcas",
    "comentarios sugerencias",
    "equipo gestiona tus marcas",
    "contacto agentes marcas",
    "soporte técnico marcas"
  ],
  openGraph: {
    title: "Contacto - Gestiona tus Marcas",
    description: "Conectá con nuestro equipo. Tu experiencia nos impulsa a mejorar. Valoramos profundamente tus comentarios y sugerencias.",
    url: "https://gestionatusmarcas.com/contact",
    images: [
      {
        url: "/logo-d.svg",
        width: 1200,
        height: 630,
        alt: "Gestiona tus Marcas - Contacto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contacto - Gestiona tus Marcas",
    description: "Conectá con nuestro equipo. Tu experiencia nos impulsa a mejorar.",
    images: ["/logo-d.svg"],
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return <ContactClient />;
} 
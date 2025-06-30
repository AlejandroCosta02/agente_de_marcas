import type { Metadata } from 'next';
import RegisterClient from '@/components/auth/RegisterClient';

export const metadata: Metadata = {
  title: "Crear Cuenta",
  description: "Creá tu cuenta en Gestiona tus Marcas. Comenzá a gestionar tus expedientes de marcas comerciales de forma profesional y organizada.",
  keywords: [
    "crear cuenta",
    "registro gestiona tus marcas",
    "nueva cuenta marcas",
    "registrarse plataforma marcas",
    "cuenta agentes marcas",
    "expedientes marcas comerciales"
  ],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Crear Cuenta - Gestiona tus Marcas",
    description: "Creá tu cuenta en Gestiona tus Marcas. Comenzá a gestionar tus expedientes de marcas comerciales.",
    url: "https://gestionatusmarcas.com/auth/register",
    images: [
      {
        url: "/logo-d.svg",
        width: 1200,
        height: 630,
        alt: "Gestiona tus Marcas - Crear Cuenta",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crear Cuenta - Gestiona tus Marcas",
    description: "Creá tu cuenta en Gestiona tus Marcas. Comenzá a gestionar tus expedientes.",
    images: ["/logo-d.svg"],
  },
  alternates: {
    canonical: "/auth/register",
  },
};

export default function RegisterPage() {
  return <RegisterClient />;
} 
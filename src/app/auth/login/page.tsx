import type { Metadata } from 'next';
import LoginClient from '@/components/auth/LoginClient';

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Iniciá sesión en Gestiona tus Marcas. Accedé a tu panel de control para gestionar tus expedientes de marcas comerciales.",
  keywords: [
    "iniciar sesión",
    "login gestiona tus marcas",
    "acceso plataforma marcas",
    "autenticación marcas",
    "panel control marcas",
    "expedientes marcas"
  ],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Iniciar Sesión - Gestiona tus Marcas",
    description: "Iniciá sesión en Gestiona tus Marcas. Accedé a tu panel de control para gestionar tus expedientes.",
    url: "https://gestionatusmarcas.com/auth/login",
    images: [
      {
        url: "/logo-d.svg",
        width: 1200,
        height: 630,
        alt: "Gestiona tus Marcas - Iniciar Sesión",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Iniciar Sesión - Gestiona tus Marcas",
    description: "Iniciá sesión en Gestiona tus Marcas. Accedé a tu panel de control.",
    images: ["/logo-d.svg"],
  },
  alternates: {
    canonical: "/auth/login",
  },
};

export default function LoginPage() {
  return <LoginClient />;
} 
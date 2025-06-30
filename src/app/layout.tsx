import "./globals.css";
import { Inter } from "next/font/google";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import ClientLayout from "@/components/ClientLayout";
import CookieConsent from "@/components/CookieConsent";
import type { Metadata } from 'next';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Gestiona tus Marcas - Plataforma de Gestión de Marcas en Argentina",
    template: "%s | Gestiona tus Marcas"
  },
  description: "Plataforma profesional para la gestión, seguimiento y protección de marcas en Argentina. Herramientas para agentes, estudios y profesionales del derecho marcario.",
  keywords: [
    "marcas",
    "gestión de marcas", 
    "agentes de marcas",
    "propiedad intelectual",
    "registro de marcas",
    "Argentina",
    "estudios jurídicos",
    "abogados",
    "protección de marcas",
    "seguimiento de marcas",
    "legaltech",
    "derecho marcario",
    "plataforma online",
    "INPI",
    "expedientes de marcas"
  ],
  authors: [{ name: "Gestiona tus Marcas" }],
  creator: "Gestiona tus Marcas",
  publisher: "Gestiona tus Marcas",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://gestionatusmarcas.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://gestionatusmarcas.com',
    siteName: 'Gestiona tus Marcas',
    title: 'Gestiona tus Marcas - Plataforma de Gestión de Marcas en Argentina',
    description: 'Plataforma profesional para la gestión, seguimiento y protección de marcas en Argentina. Herramientas para agentes, estudios y profesionales del derecho marcario.',
    images: [
      {
        url: '/logo-d.svg',
        width: 1200,
        height: 630,
        alt: 'Gestiona tus Marcas - Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gestiona tus Marcas - Plataforma de Gestión de Marcas en Argentina',
    description: 'Plataforma profesional para la gestión, seguimiento y protección de marcas en Argentina.',
    images: ['/logo-d.svg'],
    creator: '@gestionatusmarcas',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Replace with actual verification code
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <NextAuthProvider>
          <ClientLayout>{children}</ClientLayout>
          <CookieConsent />
        </NextAuthProvider>
      </body>
    </html>
  );
}
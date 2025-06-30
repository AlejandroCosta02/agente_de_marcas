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
    canonical: 'https://gestionatusmarcas.com',
    languages: {
      'es-AR': 'https://gestionatusmarcas.com',
    },
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
        url: 'https://gestionatusmarcas.com/logo-d.svg',
        width: 1200,
        height: 630,
        alt: 'Gestiona tus Marcas - Logo',
        type: 'image/svg+xml',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gestiona tus Marcas - Plataforma de Gestión de Marcas en Argentina',
    description: 'Plataforma profesional para la gestión, seguimiento y protección de marcas en Argentina.',
    images: ['https://gestionatusmarcas.com/logo-d.svg'],
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
  category: 'legal',
  classification: 'business',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Structured data for better SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Gestiona tus Marcas",
    "url": "https://gestionatusmarcas.com",
    "logo": "https://gestionatusmarcas.com/logo-d.svg",
    "description": "Plataforma profesional para la gestión, seguimiento y protección de marcas en Argentina",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "AR"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Spanish"
    },
    "sameAs": [
      "https://twitter.com/gestionatusmarcas"
    ]
  };

  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="canonical" href="https://gestionatusmarcas.com" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Gestiona tus Marcas" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
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
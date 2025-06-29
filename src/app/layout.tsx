import "./globals.css";
import { Inter } from "next/font/google";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import ClientLayout from "@/components/ClientLayout";
import CookieConsent from "@/components/CookieConsent";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Gestiona tus Marcas",
  description: "Gestión profesional de marcas en Argentina",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="description" content="Gestionatusmarcas.com: Plataforma profesional para la gestión, seguimiento y protección de marcas en Argentina. Herramientas para agentes, estudios y profesionales del derecho marcario." />
        <meta name="keywords" content="marcas, gestión de marcas, agentes de marcas, propiedad intelectual, registro de marcas, Argentina, estudios jurídicos, abogados, protección de marcas, seguimiento de marcas, legaltech, derecho marcario, plataforma online" />
        <meta property="og:title" content="Gestiona tus Marcas" />
        <meta property="og:description" content="Gestionatusmarcas.com: Plataforma profesional para la gestión, seguimiento y protección de marcas en Argentina." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://gestionatusmarcas.com" />
        <meta property="og:image" content="/logo-d.svg" />
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
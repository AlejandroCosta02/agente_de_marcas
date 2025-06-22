import "./globals.css";
import { Inter } from "next/font/google";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import ClientLayout from "@/components/ClientLayout";
import CookieConsent from "@/components/CookieConsent";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Agente de Marcas",
  description: "Gestión profesional de marcas en Argentina",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <NextAuthProvider>
          <ClientLayout>{children}</ClientLayout>
          <CookieConsent />
        </NextAuthProvider>
      </body>
    </html>
  );
}
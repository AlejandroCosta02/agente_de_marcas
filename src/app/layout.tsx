import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agente de Marcas - Sistema de Gestión",
  description: "Sistema de gestión para agentes de marcas en Argentina",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <NextAuthProvider>{children}</NextAuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

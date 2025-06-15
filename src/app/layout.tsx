import "./globals.css";
import { Inter } from "next/font/google";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import NavSwitcher from "@/components/NavSwitcher";

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
          <NavSwitcher />
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow">{children}</main>
          </div>
        </NextAuthProvider>
      </body>
    </html>
  );
}
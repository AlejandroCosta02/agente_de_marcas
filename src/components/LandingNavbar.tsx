"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LandingNavbar() {
  const router = useRouter();
  return (
    <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <img src="/logo-d.svg" alt="Logo" className="h-10 w-10" />
          <span className="text-xl font-bold" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <span className="text-white">Gestiona tus </span>
            <span className="text-blue-400">Marcas</span>
          </span>
        </Link>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push("/auth/login")}
            className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200 font-medium"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => router.push("/auth/register")}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Registrarse
          </button>
        </div>
      </div>
    </nav>
  );
} 
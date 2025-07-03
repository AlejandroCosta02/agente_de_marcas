"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LandingNavbar() {
  const router = useRouter();
  return (
    <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center h-auto sm:h-16 gap-2 sm:gap-0 py-2 sm:py-0">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity mb-2 sm:mb-0">
          <Image src="/logo-d.svg" alt="Logo" width={40} height={40} className="h-10 w-10" />
          <span className="text-xl font-bold" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <span className="text-white">Gestiona tus </span>
            <span className="text-blue-400">Marcas</span>
          </span>
        </Link>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button
            onClick={() => router.push("/auth/login")}
            className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200 font-medium w-full sm:w-auto"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => router.push("/auth/register")}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg w-full sm:w-auto"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Registrarse
          </button>
        </div>
      </div>
    </nav>
  );
} 
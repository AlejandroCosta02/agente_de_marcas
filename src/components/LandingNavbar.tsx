"use client";
import { useRouter } from "next/navigation";

export default function LandingNavbar() {
  const router = useRouter();
  return (
    <nav className="bg-transparent shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <span className="ml-3 text-xl font-semibold text-white">Agente de Marcas</span>
        <div>
          <button
            onClick={() => router.push("/auth/login")}
            className="mr-2 px-4 py-2 bg-white text-indigo-600 rounded cursor-pointer"
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => router.push("/auth/register")}
            className="px-4 py-2 bg-indigo-600 text-white rounded cursor-pointer"
          >
            Registrarse
          </button>
        </div>
      </div>
    </nav>
  );
} 
"use client";

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaUserCircle } from 'react-icons/fa';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // First, call the signout API
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // Then sign out from NextAuth
      await signOut({ 
        redirect: false
      });
      // Try to clear cookies (client-side, best effort)
      document.cookie = 'next-auth.session-token=; Max-Age=0; path=/; secure; samesite=lax';
      document.cookie = '__Secure-next-auth.session-token=; Max-Age=0; path=/; secure; samesite=lax';
      // Clear any local storage
      localStorage.clear();
      sessionStorage.clear();
      // Force a complete page reload to login page
      window.location.href = "/auth/login";
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, try to force reload
      window.location.href = "/auth/login";
    }
  };

  const handleLoginClick = () => {
    router.push("/auth/login");
  };

  const handleRegisterClick = () => {
    router.push("/auth/register");
  };

  return (
    <nav key={status} className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <svg
              className="h-8 w-8 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="ml-3 text-xl font-semibold text-gray-800">
              Agente de Marcas
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {status === "authenticated" ? (
              <>
                <button
                  onClick={() => router.push('/perfil')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 cursor-pointer group"
                  title="Ver perfil"
                >
                  <FaUserCircle className="mr-2 h-5 w-5 text-indigo-500 group-hover:scale-110 transition-transform duration-200" />
                  <span>{session?.user?.name || 'Usuario'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <svg 
                    className="mr-2 -ml-1 h-5 w-5" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLoginClick}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={handleRegisterClick}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Registrarse
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 
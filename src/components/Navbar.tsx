"use client";

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaUserCircle } from 'react-icons/fa';
import Link from 'next/link';

export default function Navbar() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/' }); // Let NextAuth handle cookie deletion and redirect
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  const handleLoginClick = () => {
    router.push("/auth/login");
  };

  const handleRegisterClick = () => {
    router.push("/auth/register");
  };

  const handleProfileClick = async () => {
    // Force session update before navigating to profile
    await update();
    router.push('/perfil');
  };

  return (
    <nav key={`${status}-${session?.user?.name}`} className="bg-black/20 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img src="/logo-d.svg" alt="Logo" className="h-10 w-10" />
            <span className="text-xl font-bold" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              <span className="text-white">Gestiona tus </span>
              <span className="text-blue-400">Marcas</span>
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {status === "authenticated" ? (
              <>
                <button
                  onClick={handleProfileClick}
                  className="inline-flex items-center px-4 py-2 border border-white/20 text-sm font-medium rounded-lg text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 cursor-pointer group"
                  title="Ver perfil"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  <FaUserCircle className="mr-2 h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform duration-200" />
                  <span>{session?.user?.name || 'Usuario'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
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
                  className="inline-flex items-center px-4 py-2 border border-white/20 text-sm font-medium rounded-lg text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={handleRegisterClick}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
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
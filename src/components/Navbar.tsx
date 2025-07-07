"use client";

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaUserCircle, FaEllipsisV } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';

export default function Navbar() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Usuario');
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Only render on client side to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update userName when session changes
  useEffect(() => {
    if (session?.user?.name) {
      setUserName(session.user.name);
    } else if (status === 'authenticated') {
      setUserName('Usuario');
    }
  }, [session?.user?.name, status]);

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

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Image src="/logo-d.svg" alt="Logo" width={40} height={40} className="h-10 w-10" />
              <span className="text-xl font-bold" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                <span className="text-white">Gestiona tus </span>
                <span className="text-blue-400">Marcas</span>
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Image src="/logo-d.svg" alt="Logo" width={40} height={40} className="h-10 w-10" />
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
                    <span>{userName}</span>
                  </button>
                  <button
                    onClick={() => setMenuOpen(true)}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    title="Más opciones"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                  >
                    <FaEllipsisV className="h-5 w-5" />
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
                  {menuOpen && (
                    <div className="fixed inset-0 z-50 flex justify-end menu-overlay">
                      <div className={`w-full sm:w-96 bg-white shadow-xl h-full flex flex-col menu-panel${menuClosing ? ' menu-closing' : ''}`}
                        onAnimationEnd={() => { if (menuClosing) { setMenuOpen(false); setMenuClosing(false); } }}>
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                          <span className="text-lg font-semibold text-gray-900">Opciones</span>
                          <button onClick={() => setMenuClosing(true)} className="text-gray-400 hover:text-gray-600 transition-colors text-2xl">&times;</button>
                        </div>
                        <div className="flex-1 flex flex-col p-6 space-y-4 bg-[#f8f9fa] rounded-xl">
                          <button
                            onClick={async () => {
                              setMenuClosing(true);
                              const res = await fetch('/api/marcas/export-json');
                              if (res.ok) {
                                const blob = await res.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = 'marcas.json';
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                                window.URL.revokeObjectURL(url);
                              } else {
                                alert('Error al descargar el JSON');
                              }
                            }}
                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors text-center"
                          >
                            Descargar JSON
                          </button>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold shadow-md hover:bg-green-700 transition-colors text-center"
                          >
                            Subir JSON
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/json"
                            style={{ display: 'none' }}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                const text = await file.text();
                                const res = await fetch('/api/marcas/import-json', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: text,
                                });
                                const result = await res.json();
                                if (res.ok) {
                                  alert(`Importación exitosa. Agregados: ${result.added.length}, Actualizados: ${result.updated.length}, Inválidos: ${result.invalid.length}`);
                                  window.dispatchEvent(new Event('marcas-imported'));
                                } else {
                                  alert(result.error || 'Error al importar el JSON');
                                }
                              } catch (err) {
                                alert('Error al leer o importar el archivo JSON');
                              } finally {
                                e.target.value = '';
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
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
      <style jsx global>{`
        @keyframes slideInRightMenu {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideOutRightMenu {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        }
        .menu-overlay {
          background: rgba(0,0,0,0.6);
          transition: background 0.3s;
        }
        .menu-panel {
          animation: slideInRightMenu 0.3s cubic-bezier(0.4,0,0.2,1) forwards;
          background: #f8f9fa;
        }
        .menu-panel.menu-closing {
          animation: slideOutRightMenu 0.3s cubic-bezier(0.4,0,0.2,1) forwards;
        }
      `}</style>
    </>
  );
} 
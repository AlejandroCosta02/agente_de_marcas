"use client";
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Error del servidor - Gestiona tus Marcas',
  description: 'Ha ocurrido un error inesperado. Por favor, intentá nuevamente o contactanos si el problema persiste.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://gestionatusmarcas.com/error',
  },
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-red-500 mb-4">⚠️</h1>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Error del servidor
              </h2>
              <p className="text-gray-600 mb-8">
                Ha ocurrido un error inesperado. Por favor, intentá nuevamente 
                o contactanos si el problema persiste.
              </p>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Detalles del error (solo desarrollo)
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded overflow-auto">
                    {error.message}
                    {error.digest && `\nDigest: ${error.digest}`}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="space-y-4">
              <button
                onClick={reset}
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Intentar nuevamente
              </button>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Volver al inicio
                </Link>
                <Link 
                  href="/contact"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Contactar soporte
                </Link>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 
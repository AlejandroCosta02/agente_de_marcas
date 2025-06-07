import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <h1 className="text-2xl font-bold">Agente de Marcas</h1>
          <div className="space-x-4">
            {!session ? (
              <>
                <Link 
                  href="/auth/login" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  href="/auth/register" 
                  className="px-4 py-2 bg-white text-blue-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Registrarse
                </Link>
              </>
            ) : (
              <Link 
                href="/dashboard" 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>
        </nav>

        <div className="max-w-4xl mx-auto text-center mt-32">
          <h2 className="text-5xl font-bold mb-8">
            Gestión Profesional de Marcas en Argentina
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Administre sus marcas de manera eficiente con nuestra plataforma especializada para agentes de marcas.
          </p>
          <div className="flex justify-center gap-6">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold transition-colors"
            >
              Comenzar Ahora
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 rounded-lg text-lg font-semibold transition-colors"
            >
              Conocer Más
            </Link>
          </div>
        </div>

        <div id="features" className="grid md:grid-cols-3 gap-8 mt-32">
          <div className="bg-blue-800/30 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-4">Gestión Simplificada</h3>
            <p className="text-gray-300">
              Administre todas sus marcas desde un único panel intuitivo y eficiente.
            </p>
          </div>
          <div className="bg-blue-800/30 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-4">Seguimiento Automático</h3>
            <p className="text-gray-300">
              Reciba notificaciones y alertas sobre vencimientos y trámites importantes.
            </p>
          </div>
          <div className="bg-blue-800/30 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-4">Reportes Detallados</h3>
            <p className="text-gray-300">
              Genere informes completos sobre el estado de sus marcas y trámites.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

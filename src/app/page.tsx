"use client";
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div>
      <main className="bg-gradient-to-br from-indigo-900 via-gray-800 via-blue-900 to-gray-700 text-white">
        {/* Hero Section - Centered, no particles */}
        <section className="relative h-screen flex flex-col items-center justify-center">
          <div className="relative z-10 mx-auto max-w-4xl w-full px-4">
            <h2 className="text-center text-5xl font-bold text-white lg:text-7xl md:text-4xl mb-8">
              Gestión Profesional de Marcas en Argentina
            </h2>
            <p className="mt-4 text-center text-xl font-normal text-white md:text-lg mb-12">
              Administre sus marcas de manera eficiente con nuestra plataforma especializada para agentes de marcas.
            </p>
            {/* --- TABLE SCREENSHOT PLACEHOLDER (HERO) --- */}
            <div className="flex justify-center mb-12">
              <div className="w-full max-w-2xl h-56 bg-gray-200/20 border-2 border-dashed border-indigo-400 rounded-xl flex items-center justify-center">
                {/* Aquí irá la captura de pantalla de la tabla */}
                <span className="text-gray-400">[Aquí se mostrará una captura de pantalla de la tabla]</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
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
        </section>
        {/* Rest of the landing page sections */}
        <div className="container mx-auto px-4 py-16">
          {/* <nav className="flex justify-between items-center mb-16">
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
          </nav> */}

          {/* ¿PARA QUIÉN ES ESTO? */}
          <section className="max-w-3xl mx-auto mt-32 text-center" id="para-quien">
            <h3 className="text-3xl font-bold mb-6">¿Para Quién Es Esto?</h3>
            <p className="text-lg text-gray-300 mb-8">
              Nuestra plataforma está diseñada para:
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-8">
              <div className="bg-blue-800/30 p-6 rounded-xl flex-1">
                <h4 className="text-xl font-semibold mb-2">Agentes de Marcas</h4>
                <p className="text-gray-300">Profesionales que gestionan múltiples marcas y necesitan eficiencia y control.</p>
              </div>
              <div className="bg-blue-800/30 p-6 rounded-xl flex-1">
                <h4 className="text-xl font-semibold mb-2">Empresas</h4>
                <p className="text-gray-300">Empresas que desean proteger y monitorear su portafolio de marcas.</p>
              </div>
              <div className="bg-blue-800/30 p-6 rounded-xl flex-1">
                <h4 className="text-xl font-semibold mb-2">Emprendedores</h4>
                <p className="text-gray-300">Emprendedores que buscan registrar y cuidar su marca desde el inicio.</p>
              </div>
            </div>
          </section>

          {/* CARACTERÍSTICAS DESTACADAS */}
          <section className="max-w-5xl mx-auto mt-32" id="features">
            <h3 className="text-3xl font-bold mb-10 text-center">Características Destacadas</h3>
            {/* --- TABLE SCREENSHOT PLACEHOLDER (FEATURES) --- */}
            <div className="flex justify-center mb-10">
              <div className="w-full max-w-2xl h-56 bg-gray-200/20 border-2 border-dashed border-indigo-400 rounded-xl flex items-center justify-center">
                {/* Aquí irá la captura de pantalla de la tabla */}
                <span className="text-gray-400">[Aquí se mostrará una captura de pantalla de la tabla]</span>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-blue-800/30 p-6 rounded-xl">
                <h4 className="text-xl font-semibold mb-4">Gestión Simplificada</h4>
                <p className="text-gray-300">
                  Administre todas sus marcas desde un único panel intuitivo y eficiente.
                </p>
              </div>
              <div className="bg-blue-800/30 p-6 rounded-xl">
                <h4 className="text-xl font-semibold mb-4">Seguimiento Automático</h4>
                <p className="text-gray-300">
                  Reciba notificaciones y alertas sobre vencimientos y trámites importantes.
                </p>
              </div>
              <div className="bg-blue-800/30 p-6 rounded-xl">
                <h4 className="text-xl font-semibold mb-4">Reportes Detallados</h4>
                <p className="text-gray-300">
                  Genere informes completos sobre el estado de sus marcas y trámites.
                </p>
              </div>
              <div className="bg-blue-800/30 p-6 rounded-xl">
                <h4 className="text-xl font-semibold mb-4">Soporte Personalizado</h4>
                <p className="text-gray-300">
                  Nuestro equipo está disponible para ayudarte en cada paso del proceso.
                </p>
              </div>
              <div className="bg-blue-800/30 p-6 rounded-xl">
                <h4 className="text-xl font-semibold mb-4">Acceso Seguro</h4>
                <p className="text-gray-300">
                  Tus datos están protegidos con los más altos estándares de seguridad.
                </p>
              </div>
              <div className="bg-blue-800/30 p-6 rounded-xl">
                <h4 className="text-xl font-semibold mb-4">Actualizaciones Constantes</h4>
                <p className="text-gray-300">
                  Mejoramos la plataforma continuamente para ofrecerte nuevas funcionalidades.
                </p>
              </div>
            </div>
          </section>

          {/* TESTIMONIOS DE CLIENTES */}
          <section className="max-w-4xl mx-auto mt-32" id="testimonios">
            <h3 className="text-3xl font-bold mb-10 text-center">Testimonios de Clientes</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-blue-800/30 p-6 rounded-xl">
                <p className="text-lg italic mb-4">“La plataforma me permitió ahorrar tiempo y tener todo bajo control. ¡Excelente soporte!”</p>
                <p className="font-semibold">— María G., Agente de Marcas</p>
              </div>
              <div className="bg-blue-800/30 p-6 rounded-xl">
                <p className="text-lg italic mb-4">“Como emprendedor, fue clave para registrar mi marca y recibir alertas importantes.”</p>
                <p className="font-semibold">— Juan P., Emprendedor</p>
              </div>
            </div>
          </section>

          {/* PREGUNTAS FRECUENTES */}
          <section className="max-w-3xl mx-auto mt-32" id="faq">
            <h3 className="text-3xl font-bold mb-10 text-center">Preguntas Frecuentes</h3>
            <div className="space-y-6">
              <div className="bg-blue-800/30 p-6 rounded-xl">
                <h4 className="font-semibold mb-2">¿Puedo gestionar varias marcas a la vez?</h4>
                <p className="text-gray-300">Sí, la plataforma está diseñada para gestionar múltiples marcas y trámites simultáneamente.</p>
              </div>
              <div className="bg-blue-800/30 p-6 rounded-xl">
                <h4 className="font-semibold mb-2">¿Recibiré alertas de vencimientos?</h4>
                <p className="text-gray-300">Por supuesto, recibirás notificaciones automáticas sobre fechas importantes y vencimientos.</p>
              </div>
              <div className="bg-blue-800/30 p-6 rounded-xl">
                <h4 className="font-semibold mb-2">¿Es seguro almacenar mis datos aquí?</h4>
                <p className="text-gray-300">Tus datos están protegidos con cifrado y buenas prácticas de seguridad.</p>
              </div>
            </div>
          </section>

          {/* PLANES & PRECIOS */}
          <section className="max-w-4xl mx-auto mt-32 mb-32" id="precios">
            <h3 className="text-3xl font-bold mb-10 text-center">Planes & Precios</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-blue-800/30 p-6 rounded-xl flex flex-col items-center">
                <h4 className="text-xl font-semibold mb-2">Básico</h4>
                <p className="text-3xl font-bold mb-4">Gratis</p>
                <ul className="text-gray-300 mb-6 space-y-2 text-center">
                  <li>Gestión de hasta 3 marcas</li>
                  <li>Alertas básicas</li>
                  <li>Soporte por email</li>
                </ul>
                <Link href="/auth/register" className="mt-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors">Comenzar</Link>
              </div>
              <div className="bg-blue-800/30 p-6 rounded-xl flex flex-col items-center border-2 border-indigo-400">
                <h4 className="text-xl font-semibold mb-2">Profesional</h4>
                <p className="text-3xl font-bold mb-4">$990/mes</p>
                <ul className="text-gray-300 mb-6 space-y-2 text-center">
                  <li>Gestión ilimitada de marcas</li>
                  <li>Alertas avanzadas</li>
                  <li>Reportes detallados</li>
                  <li>Soporte prioritario</li>
                </ul>
                <Link href="/auth/register" className="mt-auto px-6 py-2 bg-indigo-400 text-blue-900 hover:bg-indigo-300 rounded-lg font-semibold transition-colors">Comenzar</Link>
              </div>
              <div className="bg-blue-800/30 p-6 rounded-xl flex flex-col items-center">
                <h4 className="text-xl font-semibold mb-2">Empresas</h4>
                <p className="text-3xl font-bold mb-4">Consultar</p>
                <ul className="text-gray-300 mb-6 space-y-2 text-center">
                  <li>Soluciones personalizadas</li>
                  <li>Integraciones</li>
                  <li>Soporte dedicado</li>
                </ul>
                <Link href="/contact" className="mt-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors">Contactar</Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

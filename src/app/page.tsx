"use client";

import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import FadeContent from '@/components/FadeContent';
import GradientText from '@/components/GradientText';

export default function Home() {
  return (
    <div>
      <main className="bg-gradient-to-br from-indigo-900 via-gray-800 via-blue-900 to-gray-700 text-white">
        {/* Hero Section - Centered, no particles */}
        <section className="relative h-screen flex flex-col items-center justify-center">
          <div className="relative z-10 mx-auto max-w-4xl w-full px-4">
            <FadeContent blur={false} duration={1000} easing="ease-out" initialOpacity={0} delay={0}>
              <h1 className="text-5xl md:text-7xl font-hero mb-6 text-center">
                Gestiona tus Marcas
              </h1>
            </FadeContent>
            <FadeContent blur={false} duration={1000} easing="ease-out" initialOpacity={0} delay={200}>
              <p className="text-xl md:text-2xl text-gray-300 text-center mb-8 font-body">
                La plataforma más completa para gestionar tus expedientes de marcas ante el INPI. Organizá, seguí y protegé tu portafolio de marcas desde un solo lugar.
              </p>
            </FadeContent>
            {/* --- TABLE SCREENSHOT PLACEHOLDER (HERO) --- */}
            <FadeContent blur={true} duration={1000} easing="ease-out" initialOpacity={0}>
              <div className="flex justify-center mb-10">
                <div className="w-full max-w-4xl">
                  <Image 
                    src="/captura-1.png" 
                    alt="Dashboard de Gestiona tus Marcas - Vista principal" 
                    width={1200}
                    height={800}
                    className="w-full h-auto rounded-xl shadow-2xl border border-gray-700"
                  />
                </div>
              </div>
            </FadeContent>
            <div className="flex justify-center">
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold transition-colors"
              >
                Comenzar Ahora
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
          <section className="max-w-4xl mx-auto mt-32 text-center" id="para-quien">
            <h3 className="text-3xl font-heading mb-6">🎯 ¿Quiénes se Benefician con Gestiona tus Marcas?</h3>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="bg-blue-800/30 p-6 rounded-xl">
                <div className="text-4xl mb-4">👩‍⚖️</div>
                <h4 className="text-xl font-semibold mb-3">Agentes de Marcas</h4>
                <p className="text-gray-300">Profesionales que administran decenas (o cientos) de expedientes y necesitan mantener todo bajo control, sin perder tiempo en tareas repetitivas.</p>
              </div>
              <div className="bg-blue-800/30 p-6 rounded-xl">
                <div className="text-4xl mb-4">🏢</div>
                <h4 className="text-xl font-semibold mb-3">Estudios y Empresas</h4>
                <p className="text-gray-300">Organizaciones que desean centralizar la información de sus marcas, hacer seguimiento ágil y colaborar con su equipo legal desde un solo lugar.</p>
              </div>
              <div className="bg-blue-800/30 p-6 rounded-xl">
                <div className="text-4xl mb-4">🚀</div>
                <h4 className="text-xl font-semibold mb-3">Nuevos Agentes, Emprendedores & Marcas Personales</h4>
                <p className="text-gray-300">Personas que comienzan a ejercer como agentes de marcas o lanzan sus propios proyectos, y necesitan una plataforma que los acompañe con orden, claridad y respaldo profesional desde el principio.</p>
              </div>
            </div>
          </section>

          {/* CARACTERÍSTICAS DESTACADAS */}
          <section className="max-w-5xl mx-auto mt-32" id="features">
            <h3 className="text-3xl font-heading mb-10 text-center">Características Destacadas</h3>
            {/* --- TABLE SCREENSHOT PLACEHOLDER (FEATURES) --- */}
            <FadeContent blur={true} duration={1000} easing="ease-out" initialOpacity={0}>
              <div className="flex justify-center mb-10">
                <div className="w-full max-w-4xl">
                  <Image 
                    src="/captura-2.png" 
                    alt="Características de Gestiona tus Marcas - Funcionalidades" 
                    width={1200}
                    height={800}
                    className="w-full h-auto rounded-xl shadow-2xl border border-gray-700"
                  />
                </div>
              </div>
            </FadeContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={0}>
                <div className="bg-blue-800/30 p-6 rounded-xl">
                  <div className="text-3xl mb-4">🔍</div>
                  <h4 className="text-lg font-semibold mb-3">Visión Clara del Expediente</h4>
                  <p className="text-gray-300 text-sm">Visualizá en segundos el tipo de marca, número de expediente y estado actual.</p>
                </div>
              </FadeContent>
              <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={100}>
                <div className="bg-blue-800/30 p-6 rounded-xl">
                  <div className="text-3xl mb-4">📅</div>
                  <h4 className="text-lg font-semibold mb-3">Fechas Clave en un Solo Lugar</h4>
                  <p className="text-gray-300 text-sm">Consultá fácilmente las fechas de vencimiento, renovación y seguimiento.</p>
                </div>
              </FadeContent>
              <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={200}>
                <div className="bg-blue-800/30 p-6 rounded-xl">
                  <div className="text-3xl mb-4">👤</div>
                  <h4 className="text-lg font-semibold mb-3">Información del Titular Accesible</h4>
                  <p className="text-gray-300 text-sm">Accedé al instante a los datos del titular: nombre, email y teléfono para contacto directo.</p>
                </div>
              </FadeContent>
              <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={300}>
                <div className="bg-blue-800/30 p-6 rounded-xl">
                  <div className="text-3xl mb-4">📂</div>
                  <h4 className="text-lg font-semibold mb-3">Organización Inteligente por Marca</h4>
                  <p className="text-gray-300 text-sm">Agrupá toda la información esencial por cada marca, con secciones ordenadas y editables.</p>
                </div>
              </FadeContent>
            </div>
          </section>

          {/* TESTIMONIOS */}
          <section className="max-w-4xl mx-auto mt-32" id="testimonios">
            <h3 className="text-3xl font-heading text-center mb-12">Testimonios de Clientes</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={0}>
                <div className="bg-blue-800/30 p-6 rounded-xl">
                  <p className="text-gray-300 mb-4">&ldquo;Gestiona tus Marcas me ha simplificado enormemente el trabajo. Ahora puedo manejar todos mis expedientes desde un solo lugar sin perder tiempo.&rdquo;</p>
                  <div className="font-semibold">María González</div>
                  <div className="text-sm text-gray-400">Agente de Marcas</div>
                </div>
              </FadeContent>
              <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={100}>
                <div className="bg-blue-800/30 p-6 rounded-xl">
                  <p className="text-gray-300 mb-4">&ldquo;La plataforma es intuitiva y profesional. Los recordatorios automáticos me han salvado de perder fechas importantes en varios expedientes.&rdquo;</p>
                  <div className="font-semibold">Carlos Rodríguez</div>
                  <div className="text-sm text-gray-400">Estudio Jurídico</div>
                </div>
              </FadeContent>
              <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={200}>
                <div className="bg-blue-800/30 p-6 rounded-xl">
                  <p className="text-gray-300 mb-4">&ldquo;Como emprendedor, necesitaba una herramienta que me ayude a proteger mi marca desde el inicio. Esta plataforma es exactamente lo que buscaba.&rdquo;</p>
                  <div className="font-semibold">Ana Martínez</div>
                  <div className="text-sm text-gray-400">Emprendedora</div>
                </div>
              </FadeContent>
            </div>
          </section>

          {/* PREGUNTAS FRECUENTES */}
          <section className="max-w-4xl mx-auto mt-32" id="faq">
            <h3 className="text-3xl font-heading text-center mb-12">Preguntas Frecuentes</h3>
            <div className="space-y-6">
              <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={0}>
                <div className="bg-blue-800/30 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold mb-3">¿Puedo gestionar varias marcas desde una sola cuenta?</h4>
                  <p className="text-gray-300">Sí. La plataforma está diseñada para centralizar la gestión de múltiples expedientes de marcas, ideal para agentes que trabajan con varios clientes o empresas con un portafolio amplio.</p>
                </div>
              </FadeContent>
              <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={100}>
                <div className="bg-blue-800/30 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold mb-3">¿Recibiré recordatorios sobre fechas importantes?</h4>
                  <p className="text-gray-300">Claro. Te notificamos sobre vencimientos, renovaciones y etapas clave del proceso registral para que nunca se te pase una fecha crítica.</p>
                </div>
              </FadeContent>
              <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={200}>
                <div className="bg-blue-800/30 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold mb-3">¿Qué nivel de seguridad tienen mis datos?</h4>
                  <p className="text-gray-300">Tus datos están protegidos con cifrado y prácticas recomendadas en la industria. Solo vos tenés acceso a tu cuenta y contenido.</p>
                </div>
              </FadeContent>
              <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={300}>
                <div className="bg-blue-800/30 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold mb-3">¿Puedo comunicarme fácilmente con mis clientes desde la plataforma?</h4>
                  <p className="text-gray-300">Sí. Podés crear accesos directos personalizados para mantener contacto con cada cliente de forma rápida, ya sea por correo o WhatsApp, desde los datos que tengas cargados en el sistema.</p>
                </div>
              </FadeContent>
              <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={400}>
                <div className="bg-blue-800/30 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold mb-3">¿Puedo probar la plataforma antes de contratar un plan?</h4>
                  <p className="text-gray-300">Por supuesto. Contamos con un plan de prueba para que explores la herramienta y veas cómo se adapta a tu forma de trabajar.</p>
                </div>
              </FadeContent>
            </div>
          </section>

          {/* PRECIOS */}
          <section className="max-w-6xl mx-auto mt-32" id="precios">
            <h3 className="text-3xl font-heading text-center mb-12">Planes y Precios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={0}>
                <div className="bg-blue-800/30 p-6 rounded-xl text-center hover:scale-105 transition-transform duration-300 cursor-pointer">
                  <h4 className="text-xl font-semibold mb-4">Free</h4>
                  <div className="text-3xl font-bold mb-2">$0</div>
                  <div className="text-sm text-gray-400 mb-6">Hasta 3 marcas</div>
                  <ul className="text-sm text-gray-300 space-y-2 mb-6">
                    <li>• Gestión básica de marcas</li>
                    <li>• Recordatorios de vencimientos</li>
                    <li>• Soporte por email</li>
                  </ul>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                    Comenzar Gratis
                  </button>
                </div>
              </FadeContent>
              <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={100}>
                <div className="bg-blue-800/30 p-6 rounded-xl text-center hover:scale-105 transition-transform duration-300 cursor-pointer">
                  <h4 className="text-xl font-semibold mb-4">Essential</h4>
                  <div className="text-3xl font-bold mb-2">$32.000</div>
                  <div className="text-sm text-gray-400 mb-6">Hasta 10 marcas</div>
                  <ul className="text-sm text-gray-300 space-y-2 mb-6">
                    <li>• Todo del plan Free</li>
                    <li>• Gestión avanzada</li>
                    <li>• Reportes detallados</li>
                    <li>• Soporte prioritario</li>
                  </ul>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                    Elegir Essential
                  </button>
                </div>
              </FadeContent>
              <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={200}>
                <div className="bg-blue-800/30 p-6 rounded-xl text-center hover:scale-105 transition-transform duration-300 cursor-pointer">
                  <h4 className="text-xl font-semibold mb-4">Trademark Pro</h4>
                  <div className="text-3xl font-bold mb-2">$48.000</div>
                  <div className="text-sm text-gray-400 mb-6">Hasta 25 marcas</div>
                  <ul className="text-sm text-gray-300 space-y-2 mb-6">
                    <li>• Todo del plan Essential</li>
                    <li>• Análisis de oposiciones</li>
                    <li>• Integración con INPI</li>
                    <li>• Soporte telefónico</li>
                  </ul>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                    Elegir Pro
                  </button>
                </div>
              </FadeContent>
              <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0} delay={300}>
                <div className="bg-blue-800/30 p-6 rounded-xl text-center hover:scale-105 transition-transform duration-300 cursor-pointer">
                  <h4 className="text-xl font-semibold mb-4">Master Brand</h4>
                  <div className="text-3xl font-bold mb-2">$72.000</div>
                  <div className="text-sm text-gray-400 mb-6">Marcas ilimitadas</div>
                  <ul className="text-sm text-gray-300 space-y-2 mb-6">
                    <li>• Todo del plan Pro</li>
                    <li>• Marcas ilimitadas</li>
                    <li>• API personalizada</li>
                    <li>• Soporte dedicado</li>
                  </ul>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                    Elegir Master
                  </button>
                </div>
              </FadeContent>
            </div>
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="spin-animation inline-block text-2xl">🔆</span>
                <GradientText
                  colors={["#60a5fa", "#f97316", "#3b82f6", "#ea580c", "#1d4ed8", "#f97316", "#60a5fa"]}
                  animationSpeed={3}
                  showBorder={false}
                  className="text-lg font-semibold"
                >
                  Tip del día: Revisá las promociones activas antes de elegir tu plan. Podés ahorrar más de lo que pensás
                </GradientText>
                <span className="spin-animation inline-block text-2xl">🔆</span>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

'use client';

import Link from 'next/link';
import { FaInfoCircle, FaBullseye, FaShieldAlt, FaUsers } from 'react-icons/fa';
import LegalNavbar from '@/components/LegalNavbar';
import Footer from '@/components/Footer';
import SmartBackButton from '@/components/SmartBackButton';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-blue-800 to-black">
      <LegalNavbar />

      <main className="flex-grow">
        <div className="bg-white/10 backdrop-blur-sm py-4 border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <SmartBackButton />
            </div>
        </div>
        {/* Header Section */}
        <div className="bg-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-heading tracking-tight text-white sm:text-5xl lg:text-6xl">
              Sobre Gestiona tus Marcas
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300 font-body">
              Somos la plataforma líder en Argentina para la gestión profesional de marcas comerciales. 
              Simplificamos el trabajo de agentes, estudios jurídicos y empresas con herramientas 
              inteligentes que ahorran tiempo y previenen errores.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="py-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 space-y-8 sm:px-6 lg:px-8">
            
            {/* Our Mission */}
            <div className="relative z-10 text-base max-w-prose mx-auto lg:max-w-none">
              <div className="flex items-center text-blue-400 mb-4">
                <FaBullseye size={24} className="mr-3" />
                <h2 className="text-3xl leading-8 font-heading tracking-tight text-white">
                  Nuestra Misión
                </h2>
              </div>
              <p className="mt-4 text-lg text-gray-300 font-body">
                En Gestiona tus Marcas, creemos que la gestión de marcas debe ser simple, eficiente y 
                sin errores. Nuestra plataforma nació de la necesidad real de agentes y estudios que 
                buscaban una solución integral para centralizar información, automatizar procesos y 
                mantener todo bajo control. Hoy, somos el aliado tecnológico que miles de profesionales 
                eligen para proteger y gestionar sus portafolios de marcas.
              </p>
            </div>

            {/* What We Offer */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
              <div className="relative">
                <div className="text-gray-300 mx-auto lg:max-w-none">
                  <div className="flex items-center text-blue-400 mb-4">
                     <FaInfoCircle size={24} className="mr-3" />
                    <h3 className="text-2xl font-heading text-white">¿Por Qué Elegirnos?</h3>
                  </div>
                  <ul className="mt-6 space-y-4 font-body">
                    <li className="flex items-start">
                      <FaShieldAlt className="flex-shrink-0 h-6 w-6 text-blue-400 mt-1" />
                      <span className="ml-3">
                        <strong className="text-white">Gestión Centralizada y Segura:</strong> Todo en un solo lugar. 
                        Accedé a tus expedientes, documentos y fechas importantes desde cualquier dispositivo, 
                        con la máxima seguridad y respaldo en la nube.
                      </span>
                    </li>
                    <li className="flex items-start">
                       <FaUsers className="flex-shrink-0 h-6 w-6 text-blue-400 mt-1" />
                       <span className="ml-3">
                        <strong className="text-white">Ahorro de Tiempo Real:</strong> Automatizamos recordatorios, 
                        seguimiento de oposiciones y renovaciones. Dedicate a lo que realmente importa: 
                        crecer tu negocio y atender mejor a tus clientes.
                      </span>
                    </li>
                     <li className="flex items-start">
                       <FaBullseye className="flex-shrink-0 h-6 w-6 text-blue-400 mt-1" />
                       <span className="ml-3">
                        <strong className="text-white">Herramientas Profesionales:</strong> Reportes detallados, 
                        análisis de oposiciones, integración con INPI y más. Todo lo que necesitás para 
                        dar un servicio de excelencia.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-12 relative text-base max-w-prose mx-auto lg:max-w-none lg:mt-0">
                <div className="relative bg-white/10 backdrop-blur-sm rounded-lg shadow-2xl p-8 border border-white/20">
                   <h4 className="text-xl font-heading text-white">Nuestro Compromiso</h4>
                   <p className="mt-4 text-gray-300 font-body">
                    Nos comprometemos a ser tu socio tecnológico de confianza. Desarrollamos cada 
                    funcionalidad basándonos en el feedback de profesionales reales del sector, 
                    asegurando que cada herramienta resuelva problemas concretos y mejore tu 
                    productividad día a día.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/contact"
                      className="inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-body"
                    >
                      Hablá con Nosotros
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 
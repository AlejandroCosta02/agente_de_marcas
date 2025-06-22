'use client';

import Link from 'next/link';
import { FaInfoCircle, FaBullseye, FaShieldAlt, FaUsers } from 'react-icons/fa';
import LegalNavbar from '@/components/LegalNavbar';
import Footer from '@/components/Footer';
import SmartBackButton from '@/components/SmartBackButton';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <LegalNavbar />

      <main className="flex-grow">
        <div className="bg-white py-4 border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <SmartBackButton />
            </div>
        </div>
        {/* Header Section */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Sobre Agente de Marcas
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
              Nuestra misión es simplificar la gestión de marcas comerciales en Argentina, 
              ofreciendo una herramienta poderosa y segura para agentes y profesionales.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="py-16 bg-gray-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 space-y-8 sm:px-6 lg:px-8">
            
            {/* Our Mission */}
            <div className="relative z-10 text-base max-w-prose mx-auto lg:max-w-none">
              <div className="flex items-center text-blue-600 mb-4">
                <FaBullseye size={24} className="mr-3" />
                <h2 className="text-3xl leading-8 font-extrabold tracking-tight text-gray-900">
                  Nuestra Misión
                </h2>
              </div>
              <p className="mt-4 text-lg text-gray-500">
                En Agente de Marcas, entendemos la complejidad y la importancia de una gestión de marcas
                eficiente. Por eso, hemos desarrollado una plataforma integral que centraliza toda la
                información y automatiza los procesos clave, permitiendo a los agentes de la propiedad
                industrial y a los estudios jurídicos optimizar su tiempo y minimizar errores.
              </p>
            </div>

            {/* What We Offer */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
              <div className="relative">
                <div className="prose prose-blue text-gray-500 mx-auto lg:max-w-none">
                  <div className="flex items-center text-blue-600 mb-4">
                     <FaInfoCircle size={24} className="mr-3" />
                    <h3 className="text-2xl font-bold text-gray-900">¿Qué Ofrecemos?</h3>
                  </div>
                  <ul className="mt-6 space-y-4">
                    <li className="flex items-start">
                      <FaShieldAlt className="flex-shrink-0 h-6 w-6 text-green-500 mt-1" />
                      <span className="ml-3">
                        <strong>Gestión Segura y Centralizada:</strong> Un único panel para controlar todas
                        sus marcas, con la seguridad de que sus datos están protegidos en la nube.
                      </span>
                    </li>
                    <li className="flex items-start">
                       <FaUsers className="flex-shrink-0 h-6 w-6 text-green-500 mt-1" />
                       <span className="ml-3">
                        <strong>Eficiencia y Productividad:</strong> Automatice el seguimiento de vencimientos,
                        renovaciones y oposiciones. Dedique menos tiempo a tareas administrativas y más
                        a estrategias de valor.
                      </span>
                    </li>
                     <li className="flex items-start">
                       <FaBullseye className="flex-shrink-0 h-6 w-6 text-green-500 mt-1" />
                       <span className="ml-3">
                        <strong>Almacenamiento de Documentos:</strong> Suba y gestione todos los archivos
                        relevantes de sus marcas de forma segura, accesible desde cualquier lugar.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-12 relative text-base max-w-prose mx-auto lg:max-w-none lg:mt-0">
                <div className="relative bg-white rounded-lg shadow-lg p-8">
                   <h4 className="text-xl font-bold text-gray-900">Nuestro Compromiso</h4>
                   <p className="mt-4 text-gray-600">
                    Estamos comprometidos con la innovación continua, la seguridad de los datos
                    y el éxito de nuestros clientes. Nuestra plataforma está diseñada por y para
                    profesionales de la propiedad industrial, asegurando que cada funcionalidad
                    responda a una necesidad real del sector.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/contact"
                      className="inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Contáctenos
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
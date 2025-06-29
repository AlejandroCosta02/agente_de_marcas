'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaGithub, FaLinkedin, FaEnvelope, FaShieldAlt, FaFileContract, FaMap, FaInfoCircle, FaQuestionCircle } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-black/20 backdrop-blur-md border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Image src="/logo-d.svg" alt="Logo" width={40} height={40} className="h-10 w-10" />
              <span className="text-xl font-bold" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                <span className="text-white">Gestiona tus </span>
                <span className="text-blue-400">Marcas</span>
              </span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              La plataforma más completa para gestionar tus expedientes de marcas ante el INPI. 
              Organizá, seguí y protegé tu portafolio de marcas desde un solo lugar.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com/AlejandroCosta02" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
                aria-label="GitHub"
              >
                <FaGithub className="w-5 h-5" />
              </a>
              <a 
                href="https://www.linkedin.com/in/alejandro-costa-cv/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a 
                href="mailto:costa.claudio.alejandro@gmail.com"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
                aria-label="Email"
              >
                <FaEnvelope className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              <FaShieldAlt className="w-4 h-4 mr-2 text-blue-400" />
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/terms"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center group"
                >
                  <FaFileContract className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Términos de Servicio
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center group"
                >
                  <FaShieldAlt className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link 
                  href="/sitemap"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center group"
                >
                  <FaMap className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Mapa del Sitio
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              <FaInfoCircle className="w-4 h-4 mr-2 text-blue-400" />
              Empresa
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/about"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center group"
                >
                  <FaInfoCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center group"
                >
                  <FaEnvelope className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Contacto
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:costa.claudio.alejandro@gmail.com"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center group"
                >
                  <FaQuestionCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Soporte
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 Gestiona tus Marcas. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link 
                href="/terms"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
              >
                Términos
              </Link>
              <Link 
                href="/privacy"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
              >
                Privacidad
              </Link>
              <Link 
                href="/contact"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
              >
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
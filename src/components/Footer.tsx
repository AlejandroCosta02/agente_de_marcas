'use client';

import Link from 'next/link';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <img src="/logo.svg" alt="Logo" className="h-7 w-7" />
              <span className="text-lg font-bold" style={{ fontFamily: 'Merriweather Sans, Orbitron, Roboto, sans-serif' }}>
                <span className="text-gray-900">Gestiona tus </span>
                <span className="text-indigo-400">Marcas</span>
              </span>
            </div>
            <p className="text-gray-600 mb-4">
              © {currentYear} Gestiona tus Marcas. Todos los derechos reservados.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600"
              >
                <FaGithub size={24} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600"
              >
                <FaLinkedin size={24} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600"
              >
                <FaInstagram size={24} />
              </a>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Enlaces Rápidos
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gray-900">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gray-900">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="text-gray-600 hover:text-gray-900">
                  Mapa del Sitio
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900">
                  Términos de Servicio
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
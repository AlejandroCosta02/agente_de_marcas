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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agente de Marcas</h3>
            <p className="text-gray-600 mb-4">
              © {currentYear} Agente de Marcas. Todos los derechos reservados.
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
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  Inicio🔴
                </Link>
              </li>
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
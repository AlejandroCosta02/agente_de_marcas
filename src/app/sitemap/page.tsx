'use client';

import Link from 'next/link';
import { FaSitemap, FaHome, FaFileAlt, FaBalanceScale, FaEnvelope, FaInfoCircle } from 'react-icons/fa';
import LegalNavbar from '@/components/LegalNavbar';
import Footer from '@/components/Footer';

interface SitemapLink {
  href: string;
  label: string;
  icon: React.ReactElement;
  children?: SitemapLink[];
}

const sitemapLinks: SitemapLink[] = [
  { href: '/', label: 'Inicio', icon: <FaHome /> },
  {
    href: '#', 
    label: 'Legal', 
    icon: <FaBalanceScale />,
    children: [
      { href: '/privacy', label: 'Política de Privacidad', icon: <FaFileAlt /> },
      { href: '/terms', label: 'Términos de Servicio', icon: <FaFileAlt /> },
    ],
  },
  { href: '/about', label: 'Sobre Nosotros', icon: <FaInfoCircle /> },
  { href: '/contact', label: 'Contacto', icon: <FaEnvelope /> },
];

export default function SitemapPage() {
  const renderLinks = (links: SitemapLink[], isChild = false) => (
    <ul className={isChild ? 'pl-6 mt-2 space-y-2' : 'space-y-4'}>
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
            <span className="mr-3 text-gray-500">{link.icon}</span>
            <span className="font-medium">{link.label}</span>
          </Link>
          {link.children && renderLinks(link.children, true)}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <LegalNavbar />

      <main className="flex-grow py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <FaSitemap className="mx-auto h-12 w-12 text-gray-400" />
            <h1 className="mt-4 text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Mapa del Sitio
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              Encuentre rápidamente las páginas que necesita. Aquí tiene una descripción
              general de la estructura de nuestro sitio.
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-lg p-8 sm:p-12">
            {renderLinks(sitemapLinks)}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 
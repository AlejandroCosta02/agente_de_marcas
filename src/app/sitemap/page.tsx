'use client';

import Link from 'next/link';
import { FaSitemap, FaHome, FaFileAlt, FaBalanceScale, FaEnvelope, FaInfoCircle } from 'react-icons/fa';
import LegalNavbar from '@/components/LegalNavbar';
import Footer from '@/components/Footer';
import SmartBackButton from '@/components/SmartBackButton';

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
          <Link href={link.href} className="flex items-center text-blue-400 hover:text-blue-300 transition-colors">
            <span className="mr-3 text-gray-400">{link.icon}</span>
            <span className="font-medium font-body">{link.label}</span>
          </Link>
          {link.children && renderLinks(link.children, true)}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-blue-800 to-black">
      <LegalNavbar />

      <main className="flex-grow">
        <div className="bg-white/10 backdrop-blur-sm py-4 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SmartBackButton />
          </div>
        </div>
        <div className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <FaSitemap className="mx-auto h-12 w-12 text-blue-400" />
              <h1 className="mt-4 text-4xl font-heading text-white sm:text-5xl">
                Mapa del Sitio
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300 font-body">
                Encuentre rápidamente las páginas que necesita. Aquí tiene una descripción
                general de la estructura de nuestro sitio.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm shadow-2xl rounded-lg p-8 sm:p-12 border border-white/20">
              {renderLinks(sitemapLinks)}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 
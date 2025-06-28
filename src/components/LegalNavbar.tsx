"use client";

import Link from 'next/link';

export default function LegalNavbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="Logo" className="h-10 w-10" />
            <span className="text-xl font-bold" style={{ fontFamily: 'Merriweather Sans, Orbitron, Roboto, sans-serif' }}>
              <span className="text-gray-800">Gestiona tus </span>
              <span className="text-indigo-600">Marcas</span>
            </span>
          </Link>
          
          {/* Empty div to maintain flex layout */}
          <div></div>
        </div>
      </div>
    </nav>
  );
} 
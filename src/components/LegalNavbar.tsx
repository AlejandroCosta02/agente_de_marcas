"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function LegalNavbar() {
  return (
    <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Image src="/logo-d.svg" alt="Logo" width={40} height={40} className="h-10 w-10" />
            <span className="text-xl font-bold" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              <span className="text-white">Gestiona tus </span>
              <span className="text-blue-400">Marcas</span>
            </span>
          </Link>
          
          {/* Empty div to maintain flex layout */}
          <div></div>
        </div>
      </div>
    </nav>
  );
} 
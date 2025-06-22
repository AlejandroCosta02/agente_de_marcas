'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FaArrowLeft } from 'react-icons/fa';

export default function SmartBackButton() {
  const { data: session, status } = useSession();
  
  // Determine the back URL based on authentication status
  const backUrl = status === 'authenticated' ? '/dashboard' : '/';
  
  return (
    <Link 
      href={backUrl} 
      className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800"
    >
      <FaArrowLeft className="mr-2 h-4 w-4" />
      Volver
    </Link>
  );
} 
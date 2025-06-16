"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import NavSwitcher from './NavSwitcher';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status, data: session } = useSession();

  useEffect(() => {
    // Clear any stored session data on mount
    localStorage.removeItem('selectedTimeRange');
    sessionStorage.clear();

    // Handle authentication state
    if (status === 'authenticated' && window.location.pathname.startsWith('/auth')) {
      // If authenticated and on auth page, redirect to dashboard
      window.location.href = '/dashboard';
    } else if (status === 'unauthenticated' && !window.location.pathname.startsWith('/auth') && window.location.pathname !== '/') {
      // If unauthenticated and not on auth page or home page, redirect to login
      window.location.href = '/auth/login';
    }
  }, [status]);

  return (
    <>
      <NavSwitcher />
      {children}
    </>
  );
} 
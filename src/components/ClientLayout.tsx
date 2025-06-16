"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import NavSwitcher from './NavSwitcher';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();

  useEffect(() => {
    // Clear any stored session data on mount
    localStorage.removeItem('selectedTimeRange');
    sessionStorage.clear();

    // Handle authentication state
    if (status === 'authenticated') {
      // If on auth pages, redirect to dashboard
      if (window.location.pathname.startsWith('/auth')) {
        window.location.href = '/dashboard';
      }
    } else if (status === 'unauthenticated') {
      // If unauthenticated and trying to access protected routes
      if (!window.location.pathname.startsWith('/auth') && window.location.pathname !== '/') {
        // Force sign out to clear any lingering session
        signOut({ redirect: false }).then(() => {
          window.location.href = '/auth/login';
        });
      }
    }
  }, [status]);

  return (
    <>
      <NavSwitcher />
      {children}
    </>
  );
} 
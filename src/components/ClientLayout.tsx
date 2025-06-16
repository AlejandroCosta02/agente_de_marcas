"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import NavSwitcher from './NavSwitcher';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();

  useEffect(() => {
    // Only redirect if we're on an auth page and authenticated
    if (status === 'authenticated' && window.location.pathname.startsWith('/auth')) {
      window.location.href = '/dashboard';
    }
  }, [status]);

  return (
    <>
      <NavSwitcher />
      {children}
    </>
  );
} 
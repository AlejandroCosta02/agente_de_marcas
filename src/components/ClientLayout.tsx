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
    // Clear any stored session data on mount
    localStorage.removeItem('selectedTimeRange');
    sessionStorage.clear();
  }, []);

  return (
    <>
      <NavSwitcher />
      {children}
    </>
  );
} 
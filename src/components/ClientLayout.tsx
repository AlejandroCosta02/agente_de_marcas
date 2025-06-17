"use client";

import { useEffect } from "react";
import NavSwitcher from './NavSwitcher';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
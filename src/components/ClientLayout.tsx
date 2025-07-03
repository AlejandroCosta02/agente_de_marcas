"use client";

import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import NavSwitcher from './NavSwitcher';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Clear any stored session data on mount
    localStorage.removeItem('selectedTimeRange');
    sessionStorage.clear();
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <NavSwitcher />
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#EF4444',
            },
          },
        }}
      />
    </>
  );
} 
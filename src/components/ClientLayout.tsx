"use client";

import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
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
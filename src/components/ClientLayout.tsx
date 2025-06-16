"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      window.location.href = '/dashboard';
    }
  }, [status]);

  return <>{children}</>;
} 
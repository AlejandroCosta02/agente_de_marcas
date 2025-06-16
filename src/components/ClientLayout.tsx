"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import NavSwitcher from "./NavSwitcher";

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

  return (
    <>
      <NavSwitcher />
      {children}
    </>
  );
} 
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
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Handle session state changes
    if (status === "unauthenticated") {
      // Clear any client-side state if needed
      localStorage.removeItem("selectedTimeRange");
    }
  }, [status]);

  return (
    <>
      <NavSwitcher />
      {children}
    </>
  );
} 
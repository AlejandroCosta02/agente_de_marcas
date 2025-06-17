"use client";
import { usePathname } from "next/navigation";
import LandingNavbar from "@/components/LandingNavbar";
import DashboardNavbar from "@/components/Navbar";

export default function NavSwitcher() {
  const pathname = usePathname();
  // Show LandingNavbar only on the landing page
  if (pathname === "/") {
    return <LandingNavbar />;
  }
  return <DashboardNavbar />;
} 
"use client";
import { usePathname } from "next/navigation";
import LandingNavbar from "@/components/LandingNavbar";
import DashboardNavbar from "@/components/Navbar";

export default function NavSwitcher() {
  const pathname = usePathname();

  // Define routes that should not have a default navbar from the layout
  const noNavRoutes = ["/privacy", "/terms", "/about", "/contact", "/sitemap"];

  if (noNavRoutes.includes(pathname)) {
    return null; // Don't render any navbar on these pages
  }

  // Show LandingNavbar only on the landing page
  if (pathname === "/") {
    return <LandingNavbar />;
  }

  return <DashboardNavbar />;
} 
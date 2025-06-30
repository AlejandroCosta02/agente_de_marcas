"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterClient() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're sure the user is authenticated
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-black flex items-center justify-center p-4">
        <div className="text-white font-body">Loading...</div>
      </div>
    );
  }

  // Don't show anything while redirecting
  if (status === "authenticated") {
    return null;
  }

  // Show register form for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 p-8">
        <h2 className="text-3xl font-heading text-center text-white mb-8">
          Crear Cuenta
        </h2>
        <RegisterForm />
      </div>
    </div>
  );
} 
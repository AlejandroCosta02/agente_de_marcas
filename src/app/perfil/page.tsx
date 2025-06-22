"use client";

import { useEffect, useState } from "react";
import { FaUser, FaMapMarkerAlt, FaEnvelope, FaPhone, FaIdBadge, FaCity, FaMailBulk, FaSave } from "react-icons/fa";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const initialProfile = {
  name: "",
  email: "",
  address: "",
  contact_email: "",
  contact_number: "",
  agent_number: "",
  province: "",
  zip_code: "",
};

export default function PerfilPage() {
  const [profile, setProfile] = useState(initialProfile);
  const [saving, setSaving] = useState(false);
  const { data: session, status, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          throw new Error("Error al cargar el perfil");
        }
        const data = await res.json();
        if (data && data.profile) {
          setProfile(data.profile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Error al cargar el perfil");
      } finally {
        setSaving(false);
      }
    };

    if (session?.user?.email) {
      fetchProfile();
    }
  }, [session, status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        throw new Error("Error al guardar el perfil");
      }
      
      // Force session update to refresh navbar
      await update();
      
      toast.success("Perfil actualizado");
      
      // Small delay to ensure session is updated before redirecting
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
      
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Error al guardar el perfil");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Cargando...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white rounded-xl shadow-lg p-8 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-indigo-700">
        <FaUser className="text-indigo-500" /> Perfil de Usuario
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-2">
          <FaUser className="text-gray-400" />
          <input
            type="text"
            name="name"
            placeholder="Nombre completo"
            value={profile.name ?? ""}
            onChange={handleChange}
            className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-400 text-black"
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <FaEnvelope className="text-gray-400" />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={profile.email ?? ""}
            onChange={handleChange}
            className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-400 text-black"
            required
            disabled
          />
        </div>
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-gray-400" />
          <input
            type="text"
            name="address"
            placeholder="Dirección"
            value={profile.address ?? ""}
            onChange={handleChange}
            className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-400 text-black"
          />
        </div>
        <div className="flex items-center gap-2">
          <FaPhone className="text-gray-400" />
          <input
            type="text"
            name="contact_number"
            placeholder="Teléfono de contacto"
            value={profile.contact_number ?? ""}
            onChange={handleChange}
            className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-400 text-black"
          />
        </div>
        <div className="flex items-center gap-2">
          <FaIdBadge className="text-gray-400" />
          <input
            type="text"
            name="agent_number"
            placeholder="Número de agente"
            value={profile.agent_number ?? ""}
            onChange={handleChange}
            className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-400 text-black"
          />
        </div>
        <div className="flex items-center gap-2">
          <FaCity className="text-gray-400" />
          <input
            type="text"
            name="province"
            placeholder="Provincia"
            value={profile.province ?? ""}
            onChange={handleChange}
            className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-400 text-black"
          />
        </div>
        <div className="flex items-center gap-2">
          <FaMailBulk className="text-gray-400" />
          <input
            type="text"
            name="zip_code"
            placeholder="Código postal"
            value={profile.zip_code ?? ""}
            onChange={handleChange}
            className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-400 text-black"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full flex justify-center items-center gap-2 py-2 px-4 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 font-semibold text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60"
        >
          <FaSave className={saving ? "animate-spin" : ""} />
          {saving ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="w-full flex justify-center items-center gap-2 py-2 px-4 rounded-md text-indigo-600 bg-white border border-indigo-600 hover:bg-indigo-50 transition-all duration-200 font-semibold text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2"
        >
          Cerrar
        </button>
      </form>
    </div>
  );
} 
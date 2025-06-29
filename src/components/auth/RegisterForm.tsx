'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useSession, signOut } from 'next-auth/react';

export default function RegisterForm() {
  const router = useRouter();
  const { status } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form fields and clear session on mount
  useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    // Clear any existing session
    signOut({ redirect: false });
    localStorage.removeItem('selectedTimeRange');
    sessionStorage.clear();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (res.ok) {
        toast.success('Registro exitoso');
        // Clear any existing session data
        await signOut({ redirect: false });
        localStorage.removeItem('selectedTimeRange');
        sessionStorage.clear();
        // Redirect to login page
        router.push('/auth/login');
      } else {
        const data = await res.json();
        setError(data.error || 'Error al registrar usuario');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated, redirect to dashboard
  if (status === 'authenticated') {
    router.push('/dashboard');
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
      {error && (
        <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-sm font-body border border-red-500/30">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-white font-body"
        >
          Nombre
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="off"
          className="mt-1 block w-full rounded-md border border-white/20 bg-white px-3 py-2 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 text-black placeholder-gray-500 font-body"
          placeholder="Ingresa tu nombre completo"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-white font-body"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="off"
          className="mt-1 block w-full rounded-md border border-white/20 bg-white px-3 py-2 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 text-black placeholder-gray-500 font-body"
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-white font-body"
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="mt-1 block w-full rounded-md border border-white/20 bg-white px-3 py-2 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 text-black placeholder-gray-500 font-body"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors font-body"
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </div>

      <div className="text-sm text-center font-body">
        <span className="text-gray-300">¿Ya tienes una cuenta? </span>
        <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition-colors">
          Inicia sesión aquí
        </Link>
      </div>
    </form>
  );
} 
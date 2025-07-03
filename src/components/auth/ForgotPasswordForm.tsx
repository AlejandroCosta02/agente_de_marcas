'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Por favor ingresa tu email');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSent(true);
        if (data.resetUrl) {
          setResetUrl(data.resetUrl);
        }
        toast.success('Se ha enviado un enlace de recuperación a tu email');
      } else {
        toast.error(data.error || 'Error al enviar el email de recuperación');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="mb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Email enviado
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
          Revisa tu bandeja de entrada y sigue las instrucciones.
        </p>
        {resetUrl && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Desarrollo:</strong> Enlace de recuperación:
            </p>
            <a 
              href={resetUrl}
              className="text-sm text-blue-600 hover:text-blue-800 break-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              {resetUrl}
            </a>
          </div>
        )}
        <div className="space-y-3">
          <button
            onClick={() => {
              setSent(false);
              setEmail('');
              setResetUrl('');
            }}
            className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Enviar otro email
          </button>
          <Link
            href="/auth/login"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Volver al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
          Email
        </label>
        <div className="mt-2">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="tu@email.com"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
        </button>
      </div>

      <div className="text-center">
        <Link
          href="/auth/login"
          className="text-sm font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
        >
          Volver al login
        </Link>
      </div>
    </form>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface ResetPasswordFormProps {
  token?: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [validating, setValidating] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setValidating(false);
      return;
    }

    // Validate token
    const validateToken = async () => {
      try {
        const response = await fetch('/api/auth/validate-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
        }
      } catch (error) {
        console.error('Token validation error:', error);
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Token de recuperación inválido');
      return;
    }
    
    if (!password.trim()) {
      toast.error('Por favor ingresa una contraseña');
      return;
    }
    
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          password: password.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Contraseña actualizada exitosamente');
        router.push('/auth/login');
      } else {
        toast.error(data.error || 'Error al actualizar la contraseña');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Validando enlace...</p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="text-center">
        <div className="mb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Enlace inválido o expirado
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          El enlace de recuperación no es válido o ha expirado. 
          Solicita un nuevo enlace de recuperación.
        </p>
        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
          Nueva contraseña
        </label>
        <div className="mt-2 relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Mínimo 6 caracteres"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? (
              <span className="text-lg">👁️‍🗨️</span>
            ) : (
              <span className="text-lg">👁️</span>
            )}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900">
          Confirmar contraseña
        </label>
        <div className="mt-2 relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Repite la contraseña"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showConfirmPassword ? (
              <span className="text-lg">👁️‍🗨️</span>
            ) : (
              <span className="text-lg">👁️</span>
            )}
          </button>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Actualizando...' : 'Actualizar contraseña'}
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
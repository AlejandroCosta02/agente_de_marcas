'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!email.trim()) {
      toast.error('Por favor ingresa tu email');
      return;
    }
    
    if (!password.trim()) {
      toast.error('Por favor ingresa tu contraseña');
      return;
    }
    
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl: '/dashboard'
      });
      
      console.log('signIn result:', result);

      if (result?.error) {
        // Handle specific error messages from NextAuth
        let errorMessage = 'Error al iniciar sesión';
        
        console.log('Auth error received:', result.error);
        
        if (result.error === 'Credenciales requeridas') {
          errorMessage = 'Por favor completa todos los campos';
        } else if (result.error === 'Usuario no encontrado') {
          errorMessage = 'No existe una cuenta con este email';
        } else if (result.error === 'Contraseña incorrecta') {
          errorMessage = 'Contraseña incorrecta';
        } else if (result.error.includes('Invalid credentials')) {
          errorMessage = 'Email o contraseña incorrectos';
        } else {
          errorMessage = result.error;
        }
        
        console.log('Showing error toast:', errorMessage);
        toast.error(errorMessage);
        setLoading(false);
        return;
      }
      
      if (result?.ok) {
        toast.success('Inicio de sesión exitoso');
        console.log('Login successful, checking session...');
        
        // Wait for session to be established
        let attempts = 0;
        const maxAttempts = 10;
        
        const checkSession = async () => {
          try {
            const session = await getSession();
            console.log('Session check attempt', attempts + 1, ':', session);
            
            if (session) {
              console.log('Session established, redirecting to dashboard');
              router.push('/dashboard');
              return;
            }
            
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(checkSession, 500);
            } else {
              console.log('Max attempts reached, forcing redirect');
              router.push('/dashboard');
            }
          } catch (error) {
            console.error('Error checking session:', error);
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(checkSession, 500);
            } else {
              router.push('/dashboard');
            }
          }
        };
        
        checkSession();
      } else {
        toast.error('No se pudo iniciar sesión. Intenta nuevamente.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error de conexión. Verifica tu conexión a internet e intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white font-body">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-white/20 bg-white px-3 py-2 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 text-black placeholder-gray-500 font-body"
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-white font-body">
            Contraseña
          </label>
          <div className="text-sm">
            <Link href="/auth/forgot-password" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
        <div className="mt-1 relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-md border border-white/20 bg-white px-3 py-2 pr-10 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 text-black placeholder-gray-500 font-body"
            placeholder="Ingresa tu contraseña"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
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
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors font-body"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </div>

      <div className="text-sm text-center font-body">
        <span className="text-gray-300">¿No tienes una cuenta? </span>
        <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 transition-colors">
          Regístrate aquí
        </Link>
      </div>
    </form>
  );
} 
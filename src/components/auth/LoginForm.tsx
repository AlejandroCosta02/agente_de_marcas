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
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
              Email address
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
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Password
              </label>
              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>
            <div className="mt-2 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Not a member?{' '}
          <Link href="/auth/register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
} 
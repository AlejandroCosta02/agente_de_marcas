import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center items-center px-6 py-12 lg:px-8 bg-gradient-to-b from-blue-900 to-black">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Recuperar contraseña
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
        </p>
        <div className="mt-10">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
} 
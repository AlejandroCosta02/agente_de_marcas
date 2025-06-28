import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

interface ResetPasswordPageProps {
  searchParams?: Promise<{
    token?: string;
  }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center items-center px-6 py-12 lg:px-8 bg-gradient-to-b from-blue-900 to-black">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Restablecer contraseña
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ingresa tu nueva contraseña
        </p>
        <div className="mt-10">
          <ResetPasswordForm token={params?.token} />
        </div>
      </div>
    </div>
  );
} 
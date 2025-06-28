import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900 to-black text-white">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">¡Gracias por tu compra!</h1>
        <p className="text-lg mb-6 text-center max-w-xl">
          Tu pago fue procesado correctamente.<br />
          En breve tu cuenta será actualizada y tendrás acceso a todos los beneficios del plan Master Brand.<br />
          ¡Bienvenido a Gestiona tus Marcas!
        </p>
        <Link href="/dashboard">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg mt-6 hover:bg-blue-700 transition-all">
            Ir al Panel
          </button>
        </Link>
      </main>
      <Footer />
    </div>
  );
} 
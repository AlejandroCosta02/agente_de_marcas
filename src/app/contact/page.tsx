'use client';

import { useState } from 'react';
import { FaPaperPlane, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import LegalNavbar from '@/components/LegalNavbar';
import Footer from '@/components/Footer';
import SmartBackButton from '@/components/SmartBackButton';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, email, subject, message } = formData;
    const mailtoLink = `mailto:costa.claudio.alejandro@gmail.com?subject=${encodeURIComponent(
      `[Contacto Agente de Marcas] ${subject}`
    )}&body=${encodeURIComponent(
      `Nombre: ${fullName}\nEmail: ${email}\n\nMensaje:\n${message}`
    )}`;
    
    // Open user's default email client
    window.location.href = mailtoLink;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-blue-800 to-black">
      <LegalNavbar />

      <main className="flex-grow">
        <div className="bg-white/10 backdrop-blur-sm py-4 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SmartBackButton />
          </div>
        </div>
        <div className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-heading text-white sm:text-5xl">
                Póngase en Contacto
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300 font-body">
                Estamos aquí para ayudar. Envíenos un mensaje y nos pondremos en contacto
                a la brevedad.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm shadow-2xl rounded-lg overflow-hidden lg:grid lg:grid-cols-2 lg:gap-4 border border-white/20">
              {/* Contact Form */}
              <div className="px-6 py-8 sm:p-10 lg:p-12">
                <h3 className="text-2xl font-heading text-white">Enviar un Mensaje</h3>
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-white font-body">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-3 border border-white/20 bg-white rounded-md shadow-sm focus:ring-blue-400 focus:border-blue-400 text-black placeholder-gray-500 font-body"
                      placeholder="Ingresa tu nombre completo"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white font-body">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-3 border border-white/20 bg-white rounded-md shadow-sm focus:ring-blue-400 focus:border-blue-400 text-black placeholder-gray-500 font-body"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-white font-body">
                      Asunto
                    </label>
                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-3 border border-white/20 bg-white rounded-md shadow-sm focus:ring-blue-400 focus:border-blue-400 text-black placeholder-gray-500 font-body"
                      placeholder="¿En qué podemos ayudarte?"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-white font-body">
                      Mensaje
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-3 border border-white/20 bg-white rounded-md shadow-sm focus:ring-blue-400 focus:border-blue-400 text-black placeholder-gray-500 font-body"
                      placeholder="Describe tu consulta o solicitud..."
                    ></textarea>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-body"
                    >
                      <FaPaperPlane className="mr-3 mt-1" />
                      Enviar Mensaje
                    </button>
                  </div>
                </form>
              </div>

              {/* Contact Info */}
              <div className="px-6 py-8 bg-blue-900/30 sm:p-10 lg:p-12">
                <h3 className="text-2xl font-heading text-white">Información de Contacto</h3>
                <p className="mt-3 text-base text-gray-300 font-body">
                  También puede contactarnos a través de los siguientes medios.
                </p>
                <dl className="mt-8 space-y-6">
                  <dt><span className="sr-only">Email</span></dt>
                  <dd className="flex text-base text-gray-300 font-body">
                    <FaEnvelope className="flex-shrink-0 w-6 h-6 text-blue-400" />
                    <span className="ml-3">costa.claudio.alejandro@gmail.com</span>
                  </dd>
                  <dt><span className="sr-only">Address</span></dt>
                  <dd className="flex text-base text-gray-300 font-body">
                    <FaMapMarkerAlt className="flex-shrink-0 w-6 h-6 text-blue-400" />
                    <span className="ml-3">[Dirección de la Empresa], [Ciudad, País]</span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 
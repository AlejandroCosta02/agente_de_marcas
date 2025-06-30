'use client';

import { useState } from 'react';
import { FaPaperPlane, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import emailjs from '@emailjs/browser';
import LegalNavbar from '@/components/LegalNavbar';
import Footer from '@/components/Footer';
import SmartBackButton from '@/components/SmartBackButton';

export default function ContactClient() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Replace with your actual EmailJS credentials
      const result = await emailjs.send(
        'service_kxdlk3o',
        'template_ob055aa',
        {
          from_name: formData.fullName,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
          name: formData.fullName, // for {{name}} in subject/from
          email: formData.email,   // for {{email}} in reply-to
          title: formData.subject, // for {{title}} in subject
        },
        '-Y3CJzT57ERFS-6I7'
      );

      if (result.status === 200) {
        setSubmitStatus('success');
        setFormData({
          fullName: '',
          email: '',
          subject: '',
          message: '',
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('EmailJS error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
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
                Conectá con Nuestro Equipo
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300 font-body whitespace-pre-line">
                🚀 <strong>Tu experiencia nos impulsa a mejorar.</strong> <br />
                En <span className="text-blue-300">gestionatusmarcas.com</span>, nuestro equipo trabaja continuamente para optimizar la plataforma, incorporar nuevas funcionalidades y brindar un servicio cada vez más completo para agentes y estudios de marcas.<br /><br />
                📬 <strong>Valoramos profundamente tus comentarios y sugerencias.</strong> <br />
                Si tenés alguna observación o idea para mejorar, no dudes en escribirnos. Cada mensaje nos ayuda a construir una mejor experiencia para vos y toda la comunidad profesional.
              </p>
            </div>

            {/* Success/Error Messages */}
            {submitStatus === 'success' && (
              <div className="mb-6 bg-green-500/20 border border-green-400 text-green-100 px-4 py-3 rounded-md">
                ¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="mb-6 bg-red-500/20 border border-red-400 text-red-100 px-4 py-3 rounded-md">
                Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.
              </div>
            )}

            <div className="bg-white/10 backdrop-blur-sm shadow-2xl rounded-lg overflow-hidden lg:grid lg:grid-cols-2 lg:gap-4 border border-white/20">
              {/* Contact Form */}
              <div className="px-6 py-8 sm:p-10 lg:p-12">
                <h3 className="text-2xl font-heading text-white">Enviar un Mensaje</h3>
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-white font-body">
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="mt-1 block w-full px-4 py-3 border border-white/20 bg-white rounded-md shadow-sm focus:ring-blue-400 focus:border-blue-400 text-black placeholder-gray-500 font-body disabled:opacity-50"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white font-body">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="mt-1 block w-full px-4 py-3 border border-white/20 bg-white rounded-md shadow-sm focus:ring-blue-400 focus:border-blue-400 text-black placeholder-gray-500 font-body disabled:opacity-50"
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
                      disabled={isSubmitting}
                      className="mt-1 block w-full px-4 py-3 border border-white/20 bg-white rounded-md shadow-sm focus:ring-blue-400 focus:border-blue-400 text-black placeholder-gray-500 font-body disabled:opacity-50"
                      placeholder="Motivo del mensaje"
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
                      disabled={isSubmitting}
                      className="mt-1 block w-full px-4 py-3 border border-white/20 bg-white rounded-md shadow-sm focus:ring-blue-400 focus:border-blue-400 text-black placeholder-gray-500 font-body disabled:opacity-50"
                      placeholder="Escribe tu mensaje aquí..."
                    ></textarea>
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-body disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="mr-3 mt-1" />
                          Enviar Mensaje
                        </>
                      )}
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
                    <span className="ml-3">consultas@gestionatusmarcas.com</span>
                  </dd>
                  <dt><span className="sr-only">Address</span></dt>
                  <dd className="flex text-base text-gray-300 font-body">
                    <FaMapMarkerAlt className="flex-shrink-0 w-6 h-6 text-blue-400" />
                    <span className="ml-3">Argentina, Buenos Aires</span>
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
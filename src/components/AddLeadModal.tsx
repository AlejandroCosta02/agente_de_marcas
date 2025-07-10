'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaGlobe, FaInstagram, FaFacebook, FaTwitter, FaWhatsapp, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { LeadSubmissionData } from '@/types/lead';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeadSubmissionData) => void;
  initialData?: LeadSubmissionData | null;
}

export default function AddLeadModal({ isOpen, onClose, onSubmit, initialData }: AddLeadModalProps) {
  const [formData, setFormData] = useState<LeadSubmissionData>({
    nombre: initialData?.nombre || '',
    direccion: initialData?.direccion || '',
    website: initialData?.website || '',
    socialMedia: initialData?.socialMedia || '',
    whatsapp: initialData?.whatsapp || '',
    email: initialData?.email || ''
  });

  const [errors, setErrors] = useState<Partial<LeadSubmissionData>>({});

  const handleInputChange = (field: keyof LeadSubmissionData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LeadSubmissionData> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'Nombre es requerido';
    } else if (formData.nombre.length > 50) {
      newErrors.nombre = 'Nombre debe tener máximo 50 caracteres';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      direccion: '',
      website: '',
      socialMedia: '',
      whatsapp: '',
      email: ''
    });
    setErrors({});
    onClose();
  };

  const getSocialMediaIcon = (url: string) => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('instagram')) return <FaInstagram className="text-pink-500" />;
    if (lowerUrl.includes('facebook')) return <FaFacebook className="text-blue-600" />;
    if (lowerUrl.includes('twitter') || lowerUrl.includes('x.com')) return <FaTwitter className="text-blue-400" />;
    return <FaGlobe className="text-gray-500" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blur background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-md transition-all duration-300"
            onClick={handleClose}
          />
          
          {/* Modal content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 z-20"
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
              onClick={handleClose}
              aria-label="Cerrar"
            >
              <FaTimes />
            </button>

            <div className="flex flex-col items-center gap-2 mb-6">
              <div className="bg-blue-100 rounded-full p-4 mb-2">
                <FaGlobe className="text-blue-600 text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {initialData ? 'Editar Lead' : 'Agregar Lead'}
              </h2>
              <p className="text-gray-600 text-center max-w-xs">
                {initialData ? 'Actualiza la información del lead' : 'Agrega un nuevo lead a tu lista'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 placeholder-gray-500 ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nombre del lead"
                  maxLength={50}
                />
                {errors.nombre && (
                  <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
                )}
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaMapMarkerAlt className="inline mr-1" />
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 placeholder-gray-500"
                  placeholder="Dirección del lead"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaGlobe className="inline mr-1" />
                  Website (opcional)
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 placeholder-gray-500"
                  placeholder="google.com (se agregará https:// automáticamente)"
                />
              </div>

              {/* Social Media */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.socialMedia ? getSocialMediaIcon(formData.socialMedia) : <FaGlobe className="inline mr-1" />}
                  Red Social
                </label>
                <input
                  type="url"
                  value={formData.socialMedia}
                  onChange={(e) => handleInputChange('socialMedia', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 placeholder-gray-500"
                  placeholder="https://instagram.com/usuario"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaWhatsapp className="inline mr-1" />
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 placeholder-gray-500"
                  placeholder="+54 9 11 1234-5678"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaEnvelope className="inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 placeholder-gray-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="ejemplo@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                {initialData ? 'Actualizar Lead' : 'Agregar Lead'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 
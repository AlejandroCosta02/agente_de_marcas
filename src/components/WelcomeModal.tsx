'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient background */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl"></div>
          
          {/* Content */}
          <div className="text-center space-y-6">
            {/* Welcome Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎉</span>
              </div>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Bienvenido a Gestiona tus Marcas!
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
            </div>

            {/* Message */}
            <div className="text-gray-700 space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">👋</span>
                <p className="text-sm leading-relaxed">
                  Gracias por registrarte y ser parte de esta comunidad. Nuestro equipo trabaja constantemente para mejorar la plataforma, incorporar nuevas funciones y hacerte la gestión de marcas cada vez más fácil.
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🛠️</span>
                <p className="text-sm leading-relaxed">
                  Valoramos tus ideas y sugerencias. Si tenés comentarios, nos encantaría escucharte. ¡Estamos construyendo esto con vos!
                </p>
              </div>
            </div>

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <FaCheck className="text-lg" />
              <span>Entendido</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRocket, FaLightbulb, FaUsers, FaCode, FaTimes } from 'react-icons/fa';
import { useSession } from 'next-auth/react';

export default function GrowthBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { data: session, status } = useSession();

  // Show banner every time user logs in
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Show banner when user is authenticated
      setIsVisible(true);
    } else {
      // Hide banner when user is not authenticated
      setIsVisible(false);
    }
  }, [status, session]);

  const handleClose = () => {
    setIsVisible(false);
  };

  // Don't show banner if not authenticated or loading
  if (status !== 'authenticated' || !session?.user) {
    return null;
  }

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white shadow-2xl border-t border-white/20 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Main Content */}
            <div className="flex items-center space-x-4">
              {/* Animated Rocket Icon */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <FaRocket className="h-8 w-8 text-yellow-300" />
                <motion.div
                  className="absolute inset-0 bg-yellow-300 rounded-full opacity-20"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.2, 0, 0.2],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>

              {/* Text Content */}
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">
                  Gestionatusmarcas está evolucionando constantemente
                </h3>
                
                <p className="text-sm text-blue-100 max-w-2xl">
                  Nuestro equipo trabaja día a día para traerte nuevas funcionalidades increíbles. 
                  Pronto tendrás acceso a herramientas más potentes para gestionar tus marcas comerciales.
                </p>
              </div>
            </div>

            {/* Right Side - Features Icons and Close Button */}
            <div className="flex items-center space-x-4">
              {/* Feature Icons */}
              <div className="hidden md:flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="flex items-center space-x-1 text-xs bg-white/10 px-2 py-1 rounded-full"
                >
                  <FaLightbulb className="h-3 w-3 text-yellow-300" />
                  <span>Nuevas Funciones</span>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  className="flex items-center space-x-1 text-xs bg-white/10 px-2 py-1 rounded-full"
                >
                  <FaUsers className="h-3 w-3 text-green-300" />
                  <span>Mejor UX</span>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="flex items-center space-x-1 text-xs bg-white/10 px-2 py-1 rounded-full"
                >
                  <FaCode className="h-3 w-3 text-blue-300" />
                  <span>Innovación</span>
                </motion.div>
              </div>

              {/* Close Button */}
              <motion.button
                onClick={handleClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center justify-center w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-colors duration-200 group"
                title="Cerrar banner"
              >
                <FaTimes className="h-4 w-4 text-white group-hover:text-red-200 transition-colors duration-200" />
              </motion.button>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <motion.div
            className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, delay: 1 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>

          {/* Pulsing Dots */}
          <div className="flex justify-center space-x-1 mt-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-white/60 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 
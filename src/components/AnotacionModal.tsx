'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Anotacion } from '@/types/marca';

interface AnotacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (anotacion: Omit<Anotacion, 'id'>) => void;
  initialData?: Anotacion;
}

export default function AnotacionModal({ isOpen, onClose, onSubmit, initialData }: AnotacionModalProps) {
  const [text, setText] = useState(initialData?.text || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      text,
      date: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-60"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative top-20 mx-auto p-8 border w-[600px] shadow-xl rounded-lg bg-white"
          >
            <div className="mt-2">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                {initialData ? 'Editar Anotación' : 'Nueva Anotación'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
                    rows={4}
                    placeholder="Escriba su anotación aquí..."
                    required
                  />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {initialData ? 'Guardar Cambios' : 'Crear Anotación'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 
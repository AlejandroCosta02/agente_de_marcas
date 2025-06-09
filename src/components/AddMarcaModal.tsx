'use client';

import React, { useState, useEffect } from 'react';
import { Marca, MarcaSubmissionData, TipoMarca } from '@/types/marca';
import { motion, AnimatePresence } from 'framer-motion';

interface AddMarcaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MarcaSubmissionData) => void;
  initialData?: Marca | null;
}

const TIPOS_MARCA: TipoMarca[] = [
  "denominativa",
  "mixta",
  "figurativa",
  "tridimensional",
  "olfativa",
  "sonora",
  "movimiento",
  "holografica",
  "colectiva",
  "certificacion"
];

export default function AddMarcaModal({ isOpen, onClose, onSubmit, initialData }: AddMarcaModalProps) {
  const [formData, setFormData] = useState<MarcaSubmissionData>({
    name: '',
    description: '',
    status: '',
    acta: '',
    resolucion: '',
    clases: [],
    tipoMarca: 'denominativa'
  });

  const [selectedClases, setSelectedClases] = useState<number[]>([]);
  const [showClasesDropdown, setShowClasesDropdown] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        status: initialData.status,
        acta: initialData.acta.toString(),
        resolucion: initialData.resolucion.toString(),
        clases: initialData.clases || [],
        tipoMarca: initialData.tipoMarca
      });
      setSelectedClases(initialData.clases || []);
    } else {
      // Reset form when opening for a new marca
      setFormData({
        name: '',
        description: '',
        status: '',
        acta: '',
        resolucion: '',
        clases: [],
        tipoMarca: 'denominativa'
      });
      setSelectedClases([]);
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate name (string max 20 chars)
    if (!formData.name) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length > 20) {
      newErrors.name = 'El nombre no puede tener más de 20 caracteres';
    }

    // Validate acta and resolucion (must be numbers up to 8 digits)
    if (!formData.acta) {
      newErrors.acta = 'El acta es requerida';
    } else if (!/^\d{1,8}$/.test(formData.acta)) {
      newErrors.acta = 'El acta debe ser un número de hasta 8 dígitos';
    }

    if (!formData.resolucion) {
      newErrors.resolucion = 'La resolución es requerida';
    } else if (!/^\d{1,8}$/.test(formData.resolucion)) {
      newErrors.resolucion = 'La resolución debe ser un número de hasta 8 dígitos';
    }

    // Validate status
    if (!formData.status) {
      newErrors.status = 'El estado es requerido';
    }

    // Validate tipoMarca
    if (!formData.tipoMarca) {
      newErrors.tipoMarca = 'El tipo de marca es requerido';
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...formData,
      clases: selectedClases
    });
    onClose();
  };

  const handleClaseSelect = (clase: number) => {
    setSelectedClases(prev => {
      if (prev.includes(clase)) {
        return prev.filter(c => c !== clase);
      }
      return [...prev, clase].sort((a, b) => a - b);
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
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
                {initialData ? 'Editar Marca' : 'Nueva Marca'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                  {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <input
                    type="text"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                  {errors.status && <p className="mt-2 text-sm text-red-600">{errors.status}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Acta</label>
                  <input
                    type="text"
                    value={formData.acta}
                    onChange={(e) => setFormData({ ...formData, acta: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                  {errors.acta && <p className="mt-2 text-sm text-red-600">{errors.acta}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Resolución</label>
                  <input
                    type="text"
                    value={formData.resolucion}
                    onChange={(e) => setFormData({ ...formData, resolucion: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                  {errors.resolucion && <p className="mt-2 text-sm text-red-600">{errors.resolucion}</p>}
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">Clases</label>
                  <div 
                    className="mt-1 p-2 border rounded-md cursor-pointer flex items-center justify-between"
                    onClick={() => setShowClasesDropdown(!showClasesDropdown)}
                  >
                    <span className="text-gray-700">
                      {selectedClases.length > 0 
                        ? selectedClases.join(', ') 
                        : 'Seleccionar clases...'}
                    </span>
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {showClasesDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      <div className="grid grid-cols-5 gap-1 p-2">
                        {Array.from({ length: 45 }, (_, i) => i + 1).map((clase) => (
                          <div
                            key={clase}
                            onClick={() => handleClaseSelect(clase)}
                            className={`p-2 text-center cursor-pointer rounded ${
                              selectedClases.includes(clase)
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {clase}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Marca</label>
                  <select
                    value={formData.tipoMarca}
                    onChange={(e) => setFormData({ ...formData, tipoMarca: e.target.value as TipoMarca })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    {TIPOS_MARCA.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.tipoMarca && <p className="mt-2 text-sm text-red-600">{errors.tipoMarca}</p>}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {initialData ? 'Guardar Cambios' : 'Crear Marca'}
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
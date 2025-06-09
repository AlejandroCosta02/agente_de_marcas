'use client';

import { useState } from 'react';
import { Titular, TipoMarca } from '@/types/marca';
import { motion, AnimatePresence } from 'framer-motion';

interface MarcaFormData {
  marca: string;
  acta: string;
  resolucion: string;
  renovar: string;
  vencimiento: string;
  titular: Titular;
  anotaciones: string[];
  oposicion: string;
  tipoMarca: TipoMarca;
  clases: number[];
}

interface MarcaSubmissionData {
  marca: string;
  acta: number;
  resolucion: number;
  renovar: string;
  vencimiento: string;
  titular: Titular;
  anotaciones: string[];
  oposicion: string;
  tipoMarca: TipoMarca;
  clases: number[];
}

interface FormErrors {
  marca?: string;
  acta?: string;
  resolucion?: string;
  renovar?: string;
  vencimiento?: string;
  titular?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  tipoMarca?: string;
}

interface AddMarcaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MarcaSubmissionData) => void;
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

export default function AddMarcaModal({ isOpen, onClose, onSubmit }: AddMarcaModalProps) {
  const [formData, setFormData] = useState<MarcaFormData>({
    marca: '',
    acta: '',
    resolucion: '',
    renovar: new Date().toISOString().split('T')[0],
    vencimiento: new Date().toISOString().split('T')[0],
    titular: {
      fullName: '',
      email: '',
      phone: ''
    },
    anotaciones: [''],
    oposicion: '',
    tipoMarca: 'denominativa',
    clases: []
  });

  const [showClasesDropdown, setShowClasesDropdown] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Convert string numbers to actual numbers before submitting
    const submissionData = {
      ...formData,
      acta: parseInt(formData.acta, 10),
      resolucion: parseInt(formData.resolucion, 10)
    };

    onSubmit(submissionData);
    onClose();
  };

  const handleNumberChange = (field: 'acta' | 'resolucion', value: string) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  const handleClaseSelect = (clase: number) => {
    setFormData(prev => ({
      ...prev,
      clases: prev.clases.includes(clase)
        ? prev.clases.filter(c => c !== clase)
        : [...prev.clases, clase].sort((a, b) => a - b)
    }));
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.marca) {
      newErrors.marca = 'El nombre es requerido';
    } else if (formData.marca.length > 20) {
      newErrors.marca = 'El nombre no puede tener más de 20 caracteres';
    }

    if (!formData.acta) newErrors.acta = 'El acta es requerido';
    if (!formData.resolucion) newErrors.resolucion = 'La resolución es requerida';
    if (!formData.renovar) newErrors.renovar = 'La fecha de renovación es requerida';
    if (!formData.vencimiento) newErrors.vencimiento = 'La fecha de vencimiento es requerida';
    if (!formData.titular.fullName) newErrors.titular = { ...newErrors.titular, fullName: 'El nombre es requerido' };
    if (!formData.titular.email) newErrors.titular = { ...newErrors.titular, email: 'El email es requerido' };
    if (!formData.titular.phone) newErrors.titular = { ...newErrors.titular, phone: 'El teléfono es requerido' };
    if (!formData.tipoMarca) newErrors.tipoMarca = 'El tipo de marca es requerido';

    return newErrors;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-x-0 top-[5%] mx-auto max-w-3xl bg-white rounded-xl shadow-2xl z-50 overflow-y-auto max-h-[90vh]"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Agregar Nueva Marca</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 transition-colors cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Marca */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Marca <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="mt-1 block w-full text-black border-0 border-b border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                  />
                  {errors.marca && <p className="mt-1 text-sm text-red-600">{errors.marca}</p>}
                </div>

                {/* Tipo de Marca */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de Marca <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.tipoMarca}
                    onChange={(e) => setFormData({ ...formData, tipoMarca: e.target.value as TipoMarca })}
                    className="mt-1 block w-full text-black border-0 border-b border-gray-300 focus:border-indigo-500 focus:ring-0 bg-white"
                  >
                    {TIPOS_MARCA.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.tipoMarca && <p className="mt-1 text-sm text-red-600">{errors.tipoMarca}</p>}
                </div>

                {/* Clases */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">
                    Clases <span className="text-red-500">*</span>
                  </label>
                  <div 
                    className="mt-1 p-2 border rounded-md cursor-pointer flex items-center justify-between"
                    onClick={() => setShowClasesDropdown(!showClasesDropdown)}
                  >
                    <span className="text-gray-700">
                      {formData.clases.length > 0 
                        ? formData.clases.join(', ') 
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
                              formData.clases.includes(clase)
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

                {/* Acta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Acta n.º <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.acta}
                    onChange={(e) => handleNumberChange('acta', e.target.value)}
                    className="mt-1 block w-full text-black border-0 border-b border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                  />
                  {errors.acta && <p className="mt-1 text-sm text-red-600">{errors.acta}</p>}
                </div>

                {/* Resolución */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Resolución <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.resolucion}
                    onChange={(e) => handleNumberChange('resolucion', e.target.value)}
                    className="mt-1 block w-full text-black border-0 border-b border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                  />
                  {errors.resolucion && <p className="mt-1 text-sm text-red-600">{errors.resolucion}</p>}
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Renovar <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.renovar}
                      onChange={(e) => setFormData({ ...formData, renovar: e.target.value })}
                      className="mt-1 block w-full text-black border-0 border-b border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                    />
                    {errors.renovar && <p className="mt-1 text-sm text-red-600">{errors.renovar}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Vencimiento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.vencimiento}
                      onChange={(e) => setFormData({ ...formData, vencimiento: e.target.value })}
                      className="mt-1 block w-full text-black border-0 border-b border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                    />
                    {errors.vencimiento && <p className="mt-1 text-sm text-red-600">{errors.vencimiento}</p>}
                  </div>
                </div>

                {/* Titular */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Titular</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Nombre Completo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.titular.fullName}
                        onChange={(e) => setFormData({
                          ...formData,
                          titular: { ...formData.titular, fullName: e.target.value }
                        })}
                        className="mt-1 block w-full text-black border-0 border-b border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.titular.email}
                        onChange={(e) => setFormData({
                          ...formData,
                          titular: { ...formData.titular, email: e.target.value }
                        })}
                        className="mt-1 block w-full text-black border-0 border-b border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.titular.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          titular: { ...formData.titular, phone: e.target.value }
                        })}
                        className="mt-1 block w-full text-black border-0 border-b border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Anotaciones */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Anotaciones</label>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        anotaciones: [...prev.anotaciones, '']
                      }))}
                      className="text-sm text-indigo-600 hover:text-indigo-500 cursor-pointer"
                    >
                      + Agregar anotación
                    </button>
                  </div>
                  {formData.anotaciones.map((anotacion, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={anotacion}
                        onChange={(e) => {
                          const newAnotaciones = [...formData.anotaciones];
                          newAnotaciones[index] = e.target.value;
                          setFormData({ ...formData, anotaciones: newAnotaciones });
                        }}
                        className="flex-1 text-black border-0 border-b border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newAnotaciones = formData.anotaciones.filter((_, i) => i !== index);
                          setFormData({ ...formData, anotaciones: newAnotaciones });
                        }}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Oposición */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Oposición</label>
                  <textarea
                    value={formData.oposicion}
                    onChange={(e) => setFormData({ ...formData, oposicion: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full text-black border-0 border-b border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    Guardar Marca
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 
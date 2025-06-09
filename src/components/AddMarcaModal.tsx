import React, { useState, useEffect } from 'react';
import { Marca, MarcaSubmissionData } from '@/types/marca';
import { motion, AnimatePresence } from 'framer-motion';

interface AddMarcaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MarcaSubmissionData) => void;
  initialData?: Marca | null;
}

export default function AddMarcaModal({ isOpen, onClose, onSubmit, initialData }: AddMarcaModalProps) {
  const [formData, setFormData] = useState<MarcaSubmissionData>({
    marca: '',
    acta: '',
    resolucion: '',
    renovar: '',
    vencimiento: '',
    titular: {
      fullName: '',
      email: '',
      phone: ''
    },
    anotaciones: [],
    oposicion: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        marca: initialData.marca,
        acta: initialData.acta.toString(),
        resolucion: initialData.resolucion.toString(),
        renovar: initialData.renovar,
        vencimiento: initialData.vencimiento,
        titular: initialData.titular,
        anotaciones: initialData.anotaciones || [],
        oposicion: initialData.oposicion || []
      });
    } else {
      // Reset form when opening for a new marca
      setFormData({
        marca: '',
        acta: '',
        resolucion: '',
        renovar: '',
        vencimiento: '',
        titular: {
          fullName: '',
          email: '',
          phone: ''
        },
        anotaciones: [],
        oposicion: []
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate marca (string max 20 chars)
    if (!formData.marca) {
      newErrors.marca = 'La marca es requerida';
    } else if (formData.marca.length > 20) {
      newErrors.marca = 'La marca no puede tener más de 20 caracteres';
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

    // Validate dates
    if (!formData.renovar) {
      newErrors.renovar = 'La fecha de renovación es requerida';
    }
    if (!formData.vencimiento) {
      newErrors.vencimiento = 'La fecha de vencimiento es requerida';
    }

    // Validate titular
    if (!formData.titular.fullName) {
      newErrors['titular.fullName'] = 'El nombre completo es requerido';
    }
    if (!formData.titular.email) {
      newErrors['titular.email'] = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.titular.email)) {
      newErrors['titular.email'] = 'El email no es válido';
    }
    if (!formData.titular.phone) {
      newErrors['titular.phone'] = 'El teléfono es requerido';
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

    onSubmit(formData);
  };

  const addAnotacion = () => {
    setFormData(prev => ({
      ...prev,
      anotaciones: [...(prev.anotaciones || []), '']
    }));
  };

  const updateAnotacion = (index: number, value: string) => {
    const newAnotaciones = [...(formData.anotaciones || [])];
    newAnotaciones[index] = value;
    setFormData(prev => ({
      ...prev,
      anotaciones: newAnotaciones
    }));
  };

  const removeAnotacion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      anotaciones: (prev.anotaciones || []).filter((_, i) => i !== index)
    }));
  };

  const addOposicion = () => {
    setFormData(prev => ({
      ...prev,
      oposicion: [...(prev.oposicion || []), { text: '', completed: false }]
    }));
  };

  const updateOposicion = (index: number, value: string) => {
    const newOposiciones = [...(formData.oposicion || [])];
    newOposiciones[index] = { text: value, completed: false };
    setFormData(prev => ({
      ...prev,
      oposicion: newOposiciones
    }));
  };

  const removeOposicion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      oposicion: (prev.oposicion || []).filter((_, i) => i !== index)
    }));
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
                {/* Marca */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="marca">
                    Marca <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="marca"
                    maxLength={20}
                    className="form-input w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    placeholder="Nombre de la marca"
                  />
                  {errors.marca && <p className="mt-2 text-sm text-red-600">{errors.marca}</p>}
                </div>

                {/* Acta y Resolución */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="acta">
                      Acta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="acta"
                      maxLength={8}
                      pattern="\d*"
                      placeholder="12345678"
                      className="form-input w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      value={formData.acta}
                      onChange={(e) => setFormData({ ...formData, acta: e.target.value.replace(/\D/g, '') })}
                    />
                    {errors.acta && <p className="mt-2 text-sm text-red-600">{errors.acta}</p>}
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="resolucion">
                      Resolución <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="resolucion"
                      maxLength={8}
                      pattern="\d*"
                      placeholder="12345678"
                      className="form-input w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      value={formData.resolucion}
                      onChange={(e) => setFormData({ ...formData, resolucion: e.target.value.replace(/\D/g, '') })}
                    />
                    {errors.resolucion && <p className="mt-2 text-sm text-red-600">{errors.resolucion}</p>}
                  </div>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="renovar">
                      Renovar <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="renovar"
                      className="form-input w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      value={formData.renovar}
                      onChange={(e) => setFormData({ ...formData, renovar: e.target.value })}
                    />
                    {errors.renovar && <p className="mt-2 text-sm text-red-600">{errors.renovar}</p>}
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="vencimiento">
                      Vencimiento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="vencimiento"
                      className="form-input w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      value={formData.vencimiento}
                      onChange={(e) => setFormData({ ...formData, vencimiento: e.target.value })}
                    />
                    {errors.vencimiento && <p className="mt-2 text-sm text-red-600">{errors.vencimiento}</p>}
                  </div>
                </div>

                {/* Titular */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900">Titular</h4>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="form-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="titular-name">
                        Nombre Completo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="titular-name"
                        className="form-input w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        value={formData.titular.fullName}
                        onChange={(e) => setFormData({
                          ...formData,
                          titular: { ...formData.titular, fullName: e.target.value }
                        })}
                        placeholder="Nombre completo del titular"
                      />
                      {errors['titular.fullName'] && <p className="mt-2 text-sm text-red-600">{errors['titular.fullName']}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="form-group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="titular-email">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="titular-email"
                          className="form-input w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                          value={formData.titular.email}
                          onChange={(e) => setFormData({
                            ...formData,
                            titular: { ...formData.titular, email: e.target.value }
                          })}
                          placeholder="email@ejemplo.com"
                        />
                        {errors['titular.email'] && <p className="mt-2 text-sm text-red-600">{errors['titular.email']}</p>}
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="titular-phone">
                          Teléfono <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          id="titular-phone"
                          className="form-input w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                          value={formData.titular.phone}
                          onChange={(e) => setFormData({
                            ...formData,
                            titular: { ...formData.titular, phone: e.target.value }
                          })}
                          placeholder="+1234567890"
                        />
                        {errors['titular.phone'] && <p className="mt-2 text-sm text-red-600">{errors['titular.phone']}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Anotaciones */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700">Anotaciones</label>
                    <button
                      type="button"
                      onClick={addAnotacion}
                      className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      + Agregar anotación
                    </button>
                  </div>
                  {(formData.anotaciones || []).map((anotacion, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                      <input
                        type="text"
                        className="flex-1 text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={anotacion}
                        onChange={(e) => updateAnotacion(index, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeAnotacion(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Oposiciones */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Oposiciones
                  </label>
                  {formData.oposicion.map((op, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={op.text}
                        onChange={(e) => updateOposicion(index, e.target.value)}
                        className="form-input flex-1 px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        placeholder="Ingrese la oposición"
                      />
                      <button
                        type="button"
                        onClick={() => removeOposicion(index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOposicion}
                    className="mt-2 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Agregar oposición
                  </button>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 pt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out cursor-pointer hover:shadow-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-lg shadow-sm hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out cursor-pointer hover:shadow-md transform hover:scale-105"
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
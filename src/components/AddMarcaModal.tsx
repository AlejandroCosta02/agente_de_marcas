'use client';

import React, { useState, useEffect } from 'react';
import { Marca, MarcaSubmissionData, TipoMarca, Oposicion, Anotacion } from '@/types/marca';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import AnotacionModal from './AnotacionModal';
import OposicionModal from './OposicionModal';

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
    marca: '',
    renovar: new Date().toISOString().split('T')[0],
    vencimiento: new Date().toISOString().split('T')[0],
    titular: {
      fullName: '',
      email: '',
      phone: ''
    },
    oposicion: [],
    anotacion: [],
    clases: [],
    tipoMarca: 'denominativa'
  });

  const [selectedClases, setSelectedClases] = useState<number[]>([]);
  const [showClasesDropdown, setShowClasesDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAnotacionModal, setShowAnotacionModal] = useState(false);
  const [showOposicionModal, setShowOposicionModal] = useState(false);
  const [selectedAnotacion, setSelectedAnotacion] = useState<Anotacion | undefined>();
  const [selectedOposicion, setSelectedOposicion] = useState<Oposicion | undefined>();

  useEffect(() => {
    if (initialData) {
      setFormData({
        marca: initialData.marca,
        renovar: initialData.renovar ? new Date(initialData.renovar).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        vencimiento: initialData.vencimiento ? new Date(initialData.vencimiento).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        titular: {
          fullName: initialData.titular?.fullName || '',
          email: initialData.titular?.email || '',
          phone: initialData.titular?.phone || ''
        },
        oposicion: initialData.oposicion || [],
        anotacion: initialData.anotacion || [],
        clases: initialData.clases || [],
        tipoMarca: initialData.tipoMarca
      });
      setSelectedClases(initialData.clases || []);
    } else {
      // Reset form when opening for a new marca
      setFormData({
        marca: '',
        renovar: new Date().toISOString().split('T')[0],
        vencimiento: new Date().toISOString().split('T')[0],
        titular: {
          fullName: '',
          email: '',
          phone: ''
        },
        oposicion: [],
        anotacion: [],
        clases: [],
        tipoMarca: 'denominativa'
      });
      setSelectedClases([]);
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.marca) {
      newErrors.marca = 'El nombre es requerido';
    }

    if (!formData.renovar) {
      newErrors.renovar = 'La fecha de renovación es requerida';
    }

    if (!formData.vencimiento) {
      newErrors.vencimiento = 'La fecha de vencimiento es requerida';
    }

    if (!formData.titular.fullName) {
      newErrors['titular.fullName'] = 'El nombre del titular es requerido';
    }

    if (!formData.titular.email) {
      newErrors['titular.email'] = 'El email del titular es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.titular.email)) {
      newErrors['titular.email'] = 'Email inválido';
    }

    if (!formData.titular.phone) {
      newErrors['titular.phone'] = 'El teléfono del titular es requerido';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.titular.phone)) {
      newErrors['titular.phone'] = 'Teléfono inválido';
    }

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

  const handleAddAnotacion = (anotacion: Omit<Anotacion, 'id'>) => {
    const newAnotacion = {
      ...anotacion,
      id: Math.random().toString(36).substr(2, 9)
    };
    setFormData(prev => ({
      ...prev,
      anotacion: [...prev.anotacion, newAnotacion]
    }));
  };

  const handleEditAnotacion = (anotacion: Omit<Anotacion, 'id'>) => {
    if (!selectedAnotacion) return;
    setFormData(prev => ({
      ...prev,
      anotacion: prev.anotacion.map(a => 
        a.id === selectedAnotacion.id ? { ...anotacion, id: selectedAnotacion.id } : a
      )
    }));
    setSelectedAnotacion(undefined);
  };

  const handleDeleteAnotacion = (id: string) => {
    setFormData(prev => ({
      ...prev,
      anotacion: prev.anotacion.filter(a => a.id !== id)
    }));
  };

  const handleAddOposicion = (oposicion: Omit<Oposicion, 'id'>) => {
    const newOposicion = {
      ...oposicion,
      id: Math.random().toString(36).substr(2, 9)
    };
    setFormData(prev => ({
      ...prev,
      oposicion: [...prev.oposicion, newOposicion]
    }));
  };

  const handleEditOposicion = (oposicion: Omit<Oposicion, 'id'>) => {
    if (!selectedOposicion) return;
    setFormData(prev => ({
      ...prev,
      oposicion: prev.oposicion.map(o => 
        o.id === selectedOposicion.id ? { ...oposicion, id: selectedOposicion.id } : o
      )
    }));
    setSelectedOposicion(undefined);
  };

  const handleDeleteOposicion = (id: string) => {
    setFormData(prev => ({
      ...prev,
      oposicion: prev.oposicion.filter(op => op.id !== id)
    }));
  };

  return (
    <>
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
                    <label className="block text-sm font-medium text-gray-700">
                      Marca <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.marca}
                      onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                      className="mt-1 block w-full text-black border-0 border-b border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                    />
                    {errors.marca && <p className="mt-1 text-sm text-red-600">{errors.marca}</p>}
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Fecha de Renovación <span className="text-red-500">*</span>
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
                        Fecha de Vencimiento <span className="text-red-500">*</span>
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

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Datos del Titular</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                      <input
                        type="text"
                        value={formData.titular.fullName}
                        onChange={(e) => setFormData({
                          ...formData,
                          titular: { ...formData.titular, fullName: e.target.value }
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
                        required
                      />
                      {errors['titular.fullName'] && (
                        <p className="mt-1 text-sm text-red-600">{errors['titular.fullName']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={formData.titular.email}
                        onChange={(e) => setFormData({
                          ...formData,
                          titular: { ...formData.titular, email: e.target.value }
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
                        required
                      />
                      {errors['titular.email'] && (
                        <p className="mt-1 text-sm text-red-600">{errors['titular.email']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                      <input
                        type="tel"
                        value={formData.titular.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          titular: { ...formData.titular, phone: e.target.value }
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
                        required
                        placeholder="+1234567890"
                      />
                      {errors['titular.phone'] && (
                        <p className="mt-1 text-sm text-red-600">{errors['titular.phone']}</p>
                      )}
                    </div>
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
                              className={`p-2 text-center cursor-pointer rounded font-medium ${
                                formData.clases.includes(clase)
                                  ? 'bg-indigo-100 text-indigo-600 font-semibold'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black bg-white"
                      required
                    >
                      {TIPOS_MARCA.map((tipo) => (
                        <option key={tipo} value={tipo} className="text-black">
                          {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.tipoMarca && <p className="mt-1 text-sm text-red-600">{errors.tipoMarca}</p>}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Anotaciones</h4>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAnotacion(undefined);
                          setShowAnotacionModal(true);
                        }}
                        className="p-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <FaPlus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.anotacion.map((anotacion) => (
                        <div key={anotacion.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 mr-4">
                            <p className="text-sm text-gray-600">{anotacion.text}</p>
                            <p className="text-xs text-gray-400">{new Date(anotacion.date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAnotacion(anotacion);
                                setShowAnotacionModal(true);
                              }}
                              className="p-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAnotacion(anotacion.id)}
                              className="p-1 text-red-600 hover:text-red-800 transition-colors"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Oposiciones</h4>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOposicion(undefined);
                          setShowOposicionModal(true);
                        }}
                        className="p-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <FaPlus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.oposicion.map((oposicion) => (
                        <div key={oposicion.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 mr-4">
                            <p className="text-sm text-gray-600">{oposicion.text}</p>
                            <p className="text-xs text-gray-400">{new Date(oposicion.date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOposicion(oposicion);
                                setShowOposicionModal(true);
                              }}
                              className="p-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOposicion(oposicion.id)}
                              className="p-1 text-red-600 hover:text-red-800 transition-colors"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
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
                      {initialData ? 'Guardar Cambios' : 'Crear Marca'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnotacionModal
        isOpen={showAnotacionModal}
        onClose={() => {
          setShowAnotacionModal(false);
          setSelectedAnotacion(undefined);
        }}
        onSubmit={selectedAnotacion ? handleEditAnotacion : handleAddAnotacion}
        initialData={selectedAnotacion}
      />

      <OposicionModal
        isOpen={showOposicionModal}
        onClose={() => {
          setShowOposicionModal(false);
          setSelectedOposicion(undefined);
        }}
        onSubmit={selectedOposicion ? handleEditOposicion : handleAddOposicion}
        initialData={selectedOposicion}
      />
    </>
  );
} 
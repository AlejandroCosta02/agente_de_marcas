'use client';

import React, { useState, useEffect } from 'react';
import { Marca, MarcaSubmissionData, TipoMarca, Oposicion, Anotacion, Titular } from '@/types/marca';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaUser } from 'react-icons/fa';
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
    renovar: '',
    vencimiento: '',
    djumt: '',
    titulares: [{
      id: Math.random().toString(36).substr(2, 9),
      fullName: '',
      email: '',
      phone: ''
    }],
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

  // Helper function to convert ISO date to DD/MM/YYYY
  const formatDateToDDMMYYYY = (isoDate: string): string => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function to convert DD/MM/YYYY to ISO date
  const formatDateToISO = (ddmmyyyy: string): string => {
    if (!ddmmyyyy || ddmmyyyy.length !== 10) return '';
    const parts = ddmmyyyy.split('/');
    if (parts.length !== 3) return '';
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // Month is 0-indexed
    const year = parseInt(parts[2]);
    const date = new Date(year, month, day);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  // Helper function to validate DD/MM/YYYY format
  const isValidDate = (dateString: string): boolean => {
    if (!dateString || dateString.length !== 10) return false;
    const parts = dateString.split('/');
    if (parts.length !== 3) return false;
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        marca: initialData.marca,
        renovar: initialData.renovar ? formatDateToDDMMYYYY(initialData.renovar) : formatDateToDDMMYYYY(new Date().toISOString()),
        vencimiento: initialData.vencimiento ? formatDateToDDMMYYYY(initialData.vencimiento) : formatDateToDDMMYYYY(new Date().toISOString()),
        djumt: initialData.djumt || '',
        titulares: initialData.titulares && initialData.titulares.length > 0 
          ? initialData.titulares.map(t => ({
              id: t.id || Math.random().toString(36).substr(2, 9),
              fullName: t.fullName || '',
              email: t.email || '',
              phone: t.phone || ''
            }))
          : [{
              id: Math.random().toString(36).substr(2, 9),
              fullName: '',
              email: '',
              phone: ''
            }],
        oposicion: initialData.oposicion || [],
        anotacion: initialData.anotacion || [],
        clases: initialData.clases || [],
        tipoMarca: initialData.tipoMarca
      });
      setSelectedClases(initialData.clases || []);
    } else {
      // Reset form when opening for a new marca
      const today = formatDateToDDMMYYYY(new Date().toISOString());
      setFormData({
        marca: '',
        renovar: today,
        vencimiento: today,
        djumt: '',
        titulares: [{
          id: Math.random().toString(36).substr(2, 9),
          fullName: '',
          email: '',
          phone: ''
        }],
        oposicion: [],
        anotacion: [],
        clases: [],
        tipoMarca: 'denominativa'
      });
      setSelectedClases([]);
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Convert dates to ISO format before submitting
    const submissionData = {
      ...formData,
      renovar: formatDateToISO(formData.renovar),
      vencimiento: formatDateToISO(formData.vencimiento),
      djumt: formatDateToISO(formData.djumt),
      clases: selectedClases
    };

    onSubmit(submissionData);
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

  // Functions to handle multiple titulares
  const addTitular = () => {
    setFormData(prev => ({
      ...prev,
      titulares: [...prev.titulares, {
        id: Math.random().toString(36).substr(2, 9),
        fullName: '',
        email: '',
        phone: ''
      }]
    }));
  };

  const removeTitular = (id: string) => {
    if (formData.titulares.length > 1) {
      setFormData(prev => ({
        ...prev,
        titulares: prev.titulares.filter(t => t.id !== id)
      }));
    }
  };

  const updateTitular = (id: string, field: keyof Titular, value: string) => {
    setFormData(prev => ({
      ...prev,
      titulares: prev.titulares.map(t => 
        t.id === id ? { ...t, [field]: value } : t
      )
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.marca) {
      newErrors.marca = 'El nombre es requerido';
    } else if (formData.marca.length > 60) {
      newErrors.marca = 'El nombre de la marca no puede exceder 60 caracteres';
    }

    if (!formData.renovar) {
      newErrors.renovar = 'La fecha de renovación es requerida';
    } else if (!isValidDate(formData.renovar)) {
      newErrors.renovar = 'Formato de fecha inválido. Use DD/MM/YYYY';
    }

    if (!formData.vencimiento) {
      newErrors.vencimiento = 'La fecha de vencimiento es requerida';
    } else if (!isValidDate(formData.vencimiento)) {
      newErrors.vencimiento = 'Formato de fecha inválido. Use DD/MM/YYYY';
    }

    if (!formData.djumt) {
      newErrors.djumt = 'La fecha DJUMT es requerida';
    } else if (!isValidDate(formData.djumt)) {
      newErrors.djumt = 'Formato de fecha inválido. Use DD/MM/YYYY';
    }

    // Validate all titulares
    formData.titulares.forEach((titular, index) => {
      if (!titular.fullName) {
        newErrors[`titulares.${index}.fullName`] = 'El nombre del titular es requerido';
      }

      if (!titular.email) {
        newErrors[`titulares.${index}.email`] = 'El email del titular es requerido';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(titular.email)) {
        newErrors[`titulares.${index}.email`] = 'Email inválido';
      }

      // Phone is optional, but if provided, validate format
      if (titular.phone && !/^\+?[\d\s-]{10,}$/.test(titular.phone)) {
        newErrors[`titulares.${index}.phone`] = 'Teléfono inválido';
      }
    });

    if (!formData.tipoMarca) {
      newErrors.tipoMarca = 'El tipo de marca es requerido';
    }

    return newErrors;
  };

  return (
    <>
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
                  {initialData ? 'Editar Marca' : 'Nueva Marca'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marca <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.marca}
                      onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white shadow-sm hover:border-gray-400"
                      placeholder="Ingrese el nombre de la marca"
                      maxLength={60}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">
                        Máximo 60 caracteres
                      </p>
                      <p className={`text-xs ${formData.marca.length > 50 ? 'text-orange-500' : 'text-gray-400'}`}>
                        {formData.marca.length}/60
                      </p>
                    </div>
                    {errors.marca && <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.marca}
                    </p>}
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Renovación <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.renovar}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Allow only numbers and slashes
                            const cleaned = value.replace(/[^\d/]/g, '');
                            // Auto-format as DD/MM/YYYY
                            let formatted = cleaned;
                            if (cleaned.length >= 2 && !cleaned.includes('/')) {
                              formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
                            }
                            if (formatted.length >= 5 && formatted.split('/').length === 2) {
                              formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);
                            }
                            // Limit to DD/MM/YYYY format
                            if (formatted.length <= 10) {
                              setFormData({ ...formData, renovar: formatted });
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white shadow-sm hover:border-gray-400"
                          placeholder="DD/MM/YYYY"
                          maxLength={10}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Formato: DD/MM/YYYY (ej: 25/12/2024)</p>
                      {errors.renovar && <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.renovar}
                      </p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Vencimiento <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.vencimiento}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Allow only numbers and slashes
                            const cleaned = value.replace(/[^\d/]/g, '');
                            // Auto-format as DD/MM/YYYY
                            let formatted = cleaned;
                            if (cleaned.length >= 2 && !cleaned.includes('/')) {
                              formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
                            }
                            if (formatted.length >= 5 && formatted.split('/').length === 2) {
                              formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);
                            }
                            // Limit to DD/MM/YYYY format
                            if (formatted.length <= 10) {
                              setFormData({ ...formData, vencimiento: formatted });
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white shadow-sm hover:border-gray-400"
                          placeholder="DD/MM/YYYY"
                          maxLength={10}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Formato: DD/MM/YYYY (ej: 25/12/2024)</p>
                      {errors.vencimiento && <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.vencimiento}
                      </p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        DJUMT <span className="text-red-500">*</span>
                        <div className="relative ml-2 group">
                          <svg 
                            className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors duration-200" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            Declaración jurada de uso de medio término
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.djumt}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Allow only numbers and slashes
                            const cleaned = value.replace(/[^\d/]/g, '');
                            // Auto-format as DD/MM/YYYY
                            let formatted = cleaned;
                            if (cleaned.length >= 2 && !cleaned.includes('/')) {
                              formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
                            }
                            if (formatted.length >= 5 && formatted.split('/').length === 2) {
                              formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);
                            }
                            // Limit to DD/MM/YYYY format
                            if (formatted.length <= 10) {
                              setFormData({ ...formData, djumt: formatted });
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white shadow-sm hover:border-gray-400"
                          placeholder="DD/MM/YYYY"
                          maxLength={10}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Formato: DD/MM/YYYY (ej: 25/12/2024)</p>
                      {errors.djumt && <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.djumt}
                      </p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 text-lg border-b border-gray-200 pb-2">Titulares</h4>
                      <button
                        type="button"
                        onClick={addTitular}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                      >
                        <FaPlus className="w-4 h-4 mr-1" />
                        Agregar Titular
                      </button>
                    </div>
                    
                    {formData.titulares.map((titular, index) => (
                      <div key={titular.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <FaUser className="w-5 h-5 text-indigo-600 mr-2" />
                            <h5 className="font-medium text-gray-900">Titular {index + 1}</h5>
                          </div>
                          {formData.titulares.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTitular(titular.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all duration-200"
                              title="Eliminar titular"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nombre Completo <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={titular.fullName}
                              onChange={(e) => updateTitular(titular.id, 'fullName', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white shadow-sm hover:border-gray-400"
                              placeholder="Ingrese el nombre completo del titular"
                              required
                            />
                            {errors[`titulares.${index}.fullName`] && (
                              <p className="mt-2 text-sm text-red-600 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors[`titulares.${index}.fullName`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              value={titular.email}
                              onChange={(e) => updateTitular(titular.id, 'email', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white shadow-sm hover:border-gray-400"
                              placeholder="ejemplo@correo.com"
                              required
                            />
                            {errors[`titulares.${index}.email`] && (
                              <p className="mt-2 text-sm text-red-600 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors[`titulares.${index}.email`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              WhatsApp (Opcional)
                            </label>
                            <input
                              type="tel"
                              value={titular.phone}
                              onChange={(e) => updateTitular(titular.id, 'phone', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white shadow-sm hover:border-gray-400"
                              placeholder="+1234567890"
                            />
                            {errors[`titulares.${index}.phone`] && (
                              <p className="mt-2 text-sm text-red-600 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors[`titulares.${index}.phone`]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Clases</label>
                    <div 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer flex items-center justify-between bg-white shadow-sm hover:border-gray-400 transition-all duration-200"
                      onClick={() => setShowClasesDropdown(!showClasesDropdown)}
                    >
                      <span className="text-gray-700">
                        {selectedClases.length > 0 
                          ? selectedClases.join(', ') 
                          : 'Seleccionar clases...'}
                      </span>
                      <svg className="w-5 h-5 text-gray-400 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {showClasesDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                        <div className="grid grid-cols-5 gap-1 p-3">
                          {Array.from({ length: 45 }, (_, i) => i + 1).map((clase) => (
                            <div
                              key={clase}
                              onClick={() => handleClaseSelect(clase)}
                              className={`p-2 text-center cursor-pointer rounded-md font-medium transition-all duration-150 ${
                                selectedClases.includes(clase)
                                  ? 'bg-indigo-100 text-indigo-600 font-semibold border border-indigo-200'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                              }`}
                            >
                              {clase}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Marca</label>
                    <select
                      value={formData.tipoMarca}
                      onChange={(e) => setFormData({ ...formData, tipoMarca: e.target.value as TipoMarca })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-white shadow-sm hover:border-gray-400 appearance-none cursor-pointer pr-10"
                      required
                    >
                      {TIPOS_MARCA.map((tipo) => (
                        <option key={tipo} value={tipo} className="text-gray-900 py-2">
                          {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {errors.tipoMarca && <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.tipoMarca}
                    </p>}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 text-lg border-b border-gray-200 pb-2">Anotaciones</h4>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAnotacion(undefined);
                          setShowAnotacionModal(true);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                      >
                        <FaPlus className="w-4 h-4 mr-1" />
                        Agregar
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formData.anotacion.map((anotacion) => (
                        <div key={anotacion.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200">
                          <div className="flex-1 mr-4">
                            <p className="text-sm text-gray-700 font-medium">{anotacion.text}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(anotacion.date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAnotacion(anotacion);
                                setShowAnotacionModal(true);
                              }}
                              className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-all duration-200"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAnotacion(anotacion.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all duration-200"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {formData.anotacion.length === 0 && (
                        <div className="text-center py-6 text-gray-500">
                          <p className="text-sm">No hay anotaciones agregadas</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 text-lg border-b border-gray-200 pb-2">Oposiciones</h4>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOposicion(undefined);
                          setShowOposicionModal(true);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                      >
                        <FaPlus className="w-4 h-4 mr-1" />
                        Agregar
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formData.oposicion.map((oposicion) => (
                        <div key={oposicion.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200">
                          <div className="flex-1 mr-4">
                            <p className="text-sm text-gray-700 font-medium">{oposicion.text}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(oposicion.date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOposicion(oposicion);
                                setShowOposicionModal(true);
                              }}
                              className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-all duration-200"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOposicion(oposicion.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all duration-200"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {formData.oposicion.length === 0 && (
                        <div className="text-center py-6 text-gray-500">
                          <p className="text-sm">No hay oposiciones agregadas</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
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
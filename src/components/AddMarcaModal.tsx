import React, { useState, useEffect } from 'react';
import { Marca, MarcaSubmissionData } from '@/types/marca';

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
        acta: initialData.acta,
        resolucion: initialData.resolucion,
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

    // Validate acta and resolucion (must be numbers with prefix N)
    if (!formData.acta) {
      newErrors.acta = 'El acta es requerida';
    } else if (!/^N\d+$/.test(formData.acta)) {
      newErrors.acta = 'El acta debe comenzar con N seguido de números';
    }

    if (!formData.resolucion) {
      newErrors.resolucion = 'La resolución es requerida';
    } else if (!/^N\d+$/.test(formData.resolucion)) {
      newErrors.resolucion = 'La resolución debe comenzar con N seguido de números';
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
      oposicion: [...(prev.oposicion || []), '']
    }));
  };

  const updateOposicion = (index: number, value: string) => {
    const newOposiciones = [...(formData.oposicion || [])];
    newOposiciones[index] = value;
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            {initialData ? 'Editar Marca' : 'Nueva Marca'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Marca */}
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="marca">
                Marca <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="marca"
                maxLength={20}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
              />
              {errors.marca && <p className="mt-1 text-sm text-red-600">{errors.marca}</p>}
            </div>

            {/* Acta y Resolución */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="acta">
                  Acta <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="acta"
                  placeholder="N123"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.acta}
                  onChange={(e) => setFormData({ ...formData, acta: e.target.value })}
                />
                {errors.acta && <p className="mt-1 text-sm text-red-600">{errors.acta}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="resolucion">
                  Resolución <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="resolucion"
                  placeholder="N123"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.resolucion}
                  onChange={(e) => setFormData({ ...formData, resolucion: e.target.value })}
                />
                {errors.resolucion && <p className="mt-1 text-sm text-red-600">{errors.resolucion}</p>}
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="renovar">
                  Renovar <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="renovar"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.renovar}
                  onChange={(e) => setFormData({ ...formData, renovar: e.target.value })}
                />
                {errors.renovar && <p className="mt-1 text-sm text-red-600">{errors.renovar}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="vencimiento">
                  Vencimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="vencimiento"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.vencimiento}
                  onChange={(e) => setFormData({ ...formData, vencimiento: e.target.value })}
                />
                {errors.vencimiento && <p className="mt-1 text-sm text-red-600">{errors.vencimiento}</p>}
              </div>
            </div>

            {/* Titular */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Titular</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="titular-name">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="titular-name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.titular.fullName}
                  onChange={(e) => setFormData({
                    ...formData,
                    titular: { ...formData.titular, fullName: e.target.value }
                  })}
                />
                {errors['titular.fullName'] && <p className="mt-1 text-sm text-red-600">{errors['titular.fullName']}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="titular-email">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="titular-email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.titular.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      titular: { ...formData.titular, email: e.target.value }
                    })}
                  />
                  {errors['titular.email'] && <p className="mt-1 text-sm text-red-600">{errors['titular.email']}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="titular-phone">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="titular-phone"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.titular.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      titular: { ...formData.titular, phone: e.target.value }
                    })}
                  />
                  {errors['titular.phone'] && <p className="mt-1 text-sm text-red-600">{errors['titular.phone']}</p>}
                </div>
              </div>
            </div>

            {/* Anotaciones */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Anotaciones</label>
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
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Oposiciones</label>
                <button
                  type="button"
                  onClick={addOposicion}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  + Agregar oposición
                </button>
              </div>
              {(formData.oposicion || []).map((oposicion, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <input
                    type="text"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={oposicion}
                    onChange={(e) => updateOposicion(index, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeOposicion(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
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
      </div>
    </div>
  );
} 
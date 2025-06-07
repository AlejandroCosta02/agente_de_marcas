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
    nombre: '',
    numero: '',
    anotaciones: [],
    oposiciones: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre,
        numero: initialData.numero,
        anotaciones: initialData.anotaciones || [],
        oposiciones: initialData.oposiciones || false,
      });
    } else {
      // Reset form when opening for a new marca
      setFormData({
        nombre: '',
        numero: '',
        anotaciones: [],
        oposiciones: false,
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            {initialData ? 'Editar Marca' : 'Nueva Marca'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nombre">
                Nombre
              </label>
              <input
                type="text"
                id="nombre"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numero">
                Número
              </label>
              <input
                type="text"
                id="numero"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="anotaciones">
                Anotaciones
              </label>
              <textarea
                id="anotaciones"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.anotaciones.join('\n')}
                onChange={(e) => setFormData({ ...formData, anotaciones: e.target.value.split('\n').filter(Boolean) })}
                rows={4}
                placeholder="Una anotación por línea"
              />
            </div>
            <div className="mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-indigo-600 cursor-pointer"
                  checked={formData.oposiciones}
                  onChange={(e) => setFormData({ ...formData, oposiciones: e.target.checked })}
                />
                <span className="ml-2 text-gray-700">Tiene oposiciones</span>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer"
              >
                {initialData ? 'Guardar Cambios' : 'Crear Marca'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import AddMarcaModal from '../AddMarcaModal';
import { Marca, MarcaSubmissionData, Oposicion } from '@/types/marca';
import OposicionModal from '@/components/modals/OposicionModal';
import { FaWhatsapp, FaEnvelope, FaCalendarPlus } from 'react-icons/fa';

export default function DashboardClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMarca, setSelectedMarca] = useState<Marca | null>(null);
  const [isTimeRangeOpen, setIsTimeRangeOpen] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<number>(7); // Default to 1 week (7 days)
  const [editingAnotacionMarcaId, setEditingAnotacionMarcaId] = useState<string | null>(null);
  const [newAnotacion, setNewAnotacion] = useState('');
  const [viewingAnotacion, setViewingAnotacion] = useState<{text: string; marcaId: string; index: number} | null>(null);
  const timeRangeRef = useRef<HTMLDivElement>(null);
  const [selectedOposicion, setSelectedOposicion] = useState<{ marcaId: string; index: number; oposicion: Oposicion } | null>(null);

  const timeRangeOptions = [
    { label: 'Una semana', days: 7 },
    { label: '3 Semanas', days: 21 },
    { label: '1 mes', days: 30 },
    { label: '2 meses', days: 60 },
    { label: '3 meses', days: 90 },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeRangeRef.current && !timeRangeRef.current.contains(event.target as Node)) {
        setIsTimeRangeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchMarcas = useCallback(async () => {
    try {
      const response = await fetch('/api/marcas');
      if (!response.ok) throw new Error('Error fetching data');
      const data = await response.json();
      setMarcas(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An error occurred while fetching the data');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarcas();
  }, [fetchMarcas]);

  const handleEdit = (marca: Marca) => {
    setSelectedMarca(marca);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: MarcaSubmissionData) => {
    try {
      const method = selectedMarca ? 'PUT' : 'POST';
      const url = selectedMarca 
        ? `/api/marcas?id=${selectedMarca.id}`
        : '/api/marcas';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || await response.text() || 'Error al guardar la marca';
        throw new Error(errorMessage);
      }

      await response.json();
      toast.success(selectedMarca ? 'Marca actualizada exitosamente' : 'Marca agregada exitosamente');
      setIsModalOpen(false);
      setSelectedMarca(null);
      fetchMarcas(); // Refresh the table
    } catch (error) {
      console.error('Error saving marca:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar la marca');
    }
  };

  // Calculate statistics
  const totalMarcas = marcas.length;
  const marcasConOposiciones = marcas.filter(m => Array.isArray(m.oposicion) && m.oposicion.length > 0).length;
  const proximosVencer = marcas.filter(m => {
    if (!m.updatedAt) return false;
    const vencimiento = new Date(m.updatedAt);
    vencimiento.setFullYear(vencimiento.getFullYear() + 10); // Trademark validity is 10 years
    const hoy = new Date();
    const diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes <= selectedTimeRange;
  }).length;

  const handleTimeRangeSelect = (days: number) => {
    setSelectedTimeRange(days);
    setIsTimeRangeOpen(false);
  };

  const handleAddAnotacion = async (marcaId: string) => {
    if (!newAnotacion.trim()) return;

    try {
      const marca = marcas.find(m => m.id === marcaId);
      if (!marca) return;

      const updatedAnotaciones = [...(marca.anotacion || []), { text: newAnotacion.trim(), completed: false }];
      
      const response = await fetch(`/api/marcas?id=${marcaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...marca,
          anotacion: updatedAnotaciones,
        }),
      });

      if (!response.ok) throw new Error('Error al actualizar anotaciones');

      setNewAnotacion('');
      setEditingAnotacionMarcaId(null);
      await fetchMarcas(); // Refresh the data
      toast.success('Anotación agregada exitosamente');
    } catch (error) {
      console.error('Error adding anotacion:', error);
      toast.error('Error al agregar la anotación');
    }
  };

  const handleDeleteAnotacion = async (marcaId: string, index: number) => {
    try {
      const marca = marcas.find(m => m.id === marcaId);
      if (!marca) return;

      const updatedAnotaciones = marca.anotacion.filter((_, i) => i !== index);
      
      const response = await fetch(`/api/marcas?id=${marcaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...marca,
          anotacion: updatedAnotaciones,
        }),
      });

      if (!response.ok) throw new Error('Error al eliminar anotación');

      await fetchMarcas(); // Refresh the data
      toast.success('Anotación eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting anotacion:', error);
      toast.error('Error al eliminar la anotación');
    }
  };

  const handleToggleOposicion = async (marcaId: string, index: number) => {
    try {
      const marca = marcas.find(m => m.id === marcaId);
      if (!marca) return;

      const updatedOposiciones = [...marca.oposicion];
      updatedOposiciones[index] = {
        ...updatedOposiciones[index],
        completed: !updatedOposiciones[index].completed
      };

      const response = await fetch(`/api/marcas?id=${marcaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...marca,
          oposicion: updatedOposiciones,
        }),
      });

      if (!response.ok) throw new Error('Error al actualizar oposición');

      // Update local state
      setMarcas((prevMarcas) =>
        prevMarcas.map((m) => {
          if (m.id === marcaId) {
            return {
              ...m,
              oposicion: updatedOposiciones
            };
          }
          return m;
        })
      );

      toast.success('Estado de oposición actualizado');
    } catch (error) {
      console.error('Error updating oposicion:', error);
      toast.error('Error al actualizar la oposición');
    }
  };

  const handleAddOposicion = async (marcaId: string, text: string) => {
    try {
      const marca = marcas.find(m => m.id === marcaId);
      if (!marca) return;

      const newOposicion: Oposicion = {
        id: Math.random().toString(36).substr(2, 9),
        text,
        date: new Date().toISOString(),
        completed: false
      };

      const updatedOposiciones = [...marca.oposicion, newOposicion];

      const response = await fetch(`/api/marcas?id=${marcaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...marca,
          oposicion: updatedOposiciones,
        }),
      });

      if (!response.ok) throw new Error('Error al agregar oposición');

      // Update local state
      setMarcas((prevMarcas) =>
        prevMarcas.map((m) => {
          if (m.id === marcaId) {
            return {
              ...m,
              oposicion: updatedOposiciones
            };
          }
          return m;
        })
      );

      toast.success('Oposición agregada exitosamente');
    } catch (error) {
      console.error('Error adding oposicion:', error);
      toast.error('Error al agregar la oposición');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* Total Marcas */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-blue-600 bg-opacity-30 rounded-full p-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white uppercase">Marcas Activas</p>
                  <p className="text-3xl font-bold text-white">{totalMarcas}</p>
                </div>
              </div>
            </div>

            {/* Próximo a Renovar */}
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-yellow-600 bg-opacity-30 rounded-full p-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-right flex items-start space-x-2">
                  <div>
                    <p className="text-sm font-medium text-white uppercase">Próximo a Renovar</p>
                    <p className="text-3xl font-bold text-white">{proximosVencer}</p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setIsTimeRangeOpen(!isTimeRangeOpen)}
                      className="p-1.5 bg-yellow-600 bg-opacity-30 rounded-full hover:bg-opacity-50 transition-all duration-200"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    {isTimeRangeOpen && (
                      <div 
                        ref={timeRangeRef} 
                        className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 
                          transform origin-top-right transition-all duration-200 ease-out
                          animate-in fade-in slide-in-from-top-2 zoom-in-95
                          data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:slide-out-to-top-2 data-[state=closed]:zoom-out-95"
                      >
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          {timeRangeOptions.map((option) => (
                            <button
                              key={option.days}
                              onClick={() => handleTimeRangeSelect(option.days)}
                              className={`block w-full text-left px-4 py-2 text-sm ${
                                selectedTimeRange === option.days
                                  ? 'bg-yellow-50 text-yellow-700'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                              role="menuitem"
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Con Oposiciones */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-red-600 bg-opacity-30 rounded-full p-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white uppercase">Con Oposiciones</p>
                  <p className="text-3xl font-bold text-white">{marcasConOposiciones}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h1 className="text-xl font-semibold text-gray-900">Marcas Registradas</h1>
              <button
                onClick={() => setIsModalOpen(true)}
                className="relative overflow-hidden group bg-gradient-to-br from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg 
                  transform transition-all duration-200 ease-in-out
                  hover:scale-105 hover:shadow-lg hover:from-purple-700 hover:to-indigo-700
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                  cursor-pointer"
              >
                <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                <span className="relative flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 transform transition-transform duration-200 ease-in-out group-hover:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Agregar Marca
                </span>
              </button>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                          Nombre
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Acta
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Resolución
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Clases
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Tipo
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Oposiciones
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Anotaciones
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Contacto
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Fechas
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                          <span className="sr-only">Acciones</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {isLoading ? (
                        <tr>
                          <td colSpan={9} className="text-center py-4">
                            Cargando...
                          </td>
                        </tr>
                      ) : marcas.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-4 text-gray-500">
                            No hay marcas registradas
                          </td>
                        </tr>
                      ) : (
                        marcas.map((marca) => (
                          <tr key={marca.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                              {marca.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {marca.acta}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {marca.resolucion}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {Array.isArray(marca.clases) ? marca.clases.join(', ') : ''}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {marca.tipoMarca ? marca.tipoMarca.charAt(0).toUpperCase() + marca.tipoMarca.slice(1) : ''}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              <div className="space-y-2">
                                {Array.isArray(marca.oposicion) && marca.oposicion.length > 0 ? (
                                  <ul className="space-y-1">
                                    {marca.oposicion.map((op, index) => (
                                      <li key={index} className="group">
                                        <div className="flex items-center justify-between pb-1">
                                          <button
                                            onClick={() => setSelectedOposicion({ marcaId: marca.id, index, oposicion: op })}
                                            className={`truncate flex-1 mr-2 text-left hover:text-indigo-600 ${
                                              op.completed ? 'line-through text-gray-400' : ''
                                            }`}
                                            title="Click para ver detalles"
                                          >
                                            {op.text?.length > 20 ? `${op.text.slice(0, 20)}...` : op.text}
                                          </button>
                                          <button
                                            onClick={() => handleToggleOposicion(marca.id, index)}
                                            className={`transition-all duration-200 px-2 py-1 rounded-md text-sm
                                              ${op.completed 
                                                ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                          >
                                            {op.completed ? 'Realizado' : 'Marcar'}
                                          </button>
                                        </div>
                                        {index < marca.oposicion.length - 1 && (
                                          <div className="border-b border-gray-200 my-1"></div>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
                                
                                <button
                                  onClick={() => {
                                    const text = prompt('Nueva oposición:');
                                    if (text?.trim()) {
                                      handleAddOposicion(marca.id, text.trim());
                                    }
                                  }}
                                  className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center space-x-1"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  <span>{Array.isArray(marca.oposicion) && marca.oposicion.length ? 'Agregar otra' : 'Agregar oposición'}</span>
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              <div className="space-y-2">
                                {Array.isArray(marca.anotacion) && marca.anotacion.length > 0 ? (
                                  <ul className="space-y-1">
                                    {marca.anotacion.map((anot, index) => (
                                      <li key={index} className="group">
                                        <div className="flex items-center justify-between pb-1">
                                          <div 
                                            onClick={() => setViewingAnotacion({ text: anot.text, marcaId: marca.id, index })}
                                            className="truncate cursor-pointer hover:text-gray-900 flex-1 mr-2"
                                            title="Click para ver completo"
                                          >
                                            {anot.text?.length > 20 ? `${anot.text.slice(0, 20)}...` : anot.text}
                                          </div>
                                          <button
                                            onClick={() => handleDeleteAnotacion(marca.id, index)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-600 hover:text-red-800"
                                          >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                          </button>
                                        </div>
                                        {index < marca.anotacion.length - 1 && (
                                          <div className="border-b border-gray-200 my-1"></div>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
                                
                                {editingAnotacionMarcaId === marca.id ? (
                                  <div className="flex items-center space-x-2">
                                    <textarea
                                      value={newAnotacion}
                                      onChange={(e) => setNewAnotacion(e.target.value)}
                                      placeholder="Nueva anotación..."
                                      className="flex-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[60px] max-h-[120px] resize-y"
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          handleAddAnotacion(marca.id);
                                        }
                                      }}
                                    />
                                    <div className="flex flex-col space-y-2">
                                      <button
                                        onClick={() => handleAddAnotacion(marca.id)}
                                        className="p-1 text-green-600 hover:bg-green-50 rounded-full transition-colors duration-200"
                                        title="Guardar anotación"
                                      >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingAnotacionMarcaId(null);
                                          setNewAnotacion('');
                                        }}
                                        className="p-1 text-gray-600 hover:bg-gray-50 rounded-full transition-colors duration-200"
                                        title="Cancelar"
                                      >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setEditingAnotacionMarcaId(marca.id)}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center space-x-1"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span>{Array.isArray(marca.anotacion) && marca.anotacion.length ? 'Agregar otra' : 'Agregar anotación'}</span>
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    const whatsappUrl = `https://wa.me/${marca.titular.phone.replace(/\D/g, '')}`;
                                    window.open(whatsappUrl, '_blank');
                                  }}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors duration-200"
                                  title="WhatsApp"
                                >
                                  <FaWhatsapp className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => {
                                    window.location.href = `mailto:${marca.titular.email}`;
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                                  title="Email"
                                >
                                  <FaEnvelope className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Renovar Marca: ${marca.name}`)}&dates=${marca.renovar.replace(/-/g, '')}/${marca.renovar.replace(/-/g, '')}&details=${encodeURIComponent(`Marca: ${marca.name}\nActa: ${marca.acta}\nTitular: ${marca.titular.fullName}`)}`;
                                    window.open(googleCalendarUrl, '_blank');
                                  }}
                                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-full transition-colors duration-200"
                                  title="Agregar renovación al calendario"
                                >
                                  <FaCalendarPlus className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => {
                                    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Vencimiento Marca: ${marca.name}`)}&dates=${marca.vencimiento.replace(/-/g, '')}/${marca.vencimiento.replace(/-/g, '')}&details=${encodeURIComponent(`Marca: ${marca.name}\nActa: ${marca.acta}\nTitular: ${marca.titular.fullName}`)}`;
                                    window.open(googleCalendarUrl, '_blank');
                                  }}
                                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-full transition-colors duration-200"
                                  title="Agregar vencimiento al calendario"
                                >
                                  <FaCalendarPlus className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                              <button
                                onClick={() => handleEdit(marca)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Editar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddMarcaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMarca(null);
        }}
        onSubmit={handleSubmit}
        initialData={selectedMarca}
      />

      {/* Anotacion Modal */}
      {viewingAnotacion && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Anotación</h3>
              <button
                onClick={() => setViewingAnotacion(null)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="whitespace-pre-wrap break-words text-gray-700">
                {viewingAnotacion.text}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  handleDeleteAnotacion(viewingAnotacion.marcaId, viewingAnotacion.index);
                  setViewingAnotacion(null);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Eliminar
              </button>
              <button
                onClick={() => setViewingAnotacion(null)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedOposicion && (
        <OposicionModal
          isOpen={!!selectedOposicion}
          onClose={() => setSelectedOposicion(null)}
          oposicion={selectedOposicion.oposicion}
          onComplete={() => {
            handleToggleOposicion(selectedOposicion.marcaId, selectedOposicion.index);
            setSelectedOposicion(null);
          }}
        />
      )}
    </div>
  );
} 
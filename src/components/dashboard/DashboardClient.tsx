'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import AddMarcaModal from '../AddMarcaModal';
import { Marca, MarcaSubmissionData, Oposicion } from '@/types/marca';
import OposicionModal from '@/components/modals/OposicionModal';
import { FaWhatsapp, FaEnvelope, FaEdit, FaTrash, FaPlus, FaCalendarPlus, FaSort } from 'react-icons/fa';
import ViewTextModal from '../ViewTextModal';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';


interface ViewTextModalState {
  isOpen: boolean;
  title: string;
  content: string;
}

export default function DashboardClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [selectedMarca, setSelectedMarca] = useState<Marca | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(30);
  const [isTimeRangeOpen, setIsTimeRangeOpen] = useState(false);
  const [oposicionModalOpen, setOposicionModalOpen] = useState(false);
  const timeRangeRef = useRef<HTMLDivElement>(null);
  const [selectedOposicion, setSelectedOposicion] = useState<{ marcaId: string; index: number; oposicion: Oposicion } | null>(null);
  const [viewTextModal, setViewTextModal] = useState<ViewTextModalState>({ isOpen: false, title: '', content: '' });
  const [needsMigration, setNeedsMigration] = useState(false);
  const router = useRouter();
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sortedMarcas, setSortedMarcas] = useState(marcas);

  const totalMarcas = marcas.length;
  const marcasConOposiciones = marcas.filter(marca => 
    Array.isArray(marca.oposicion) && marca.oposicion.length > 0
  ).length;

  const timeRangeOptions = [
    { days: 30, label: '30 días' },
    { days: 60, label: '60 días' },
    { days: 90, label: '90 días' },
    { days: 180, label: '6 meses' },
    { days: 365, label: '1 año' }
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleClickOutside = (event: MouseEvent) => {
        if (timeRangeRef.current && !timeRangeRef.current.contains(event.target as Node)) {
          setIsTimeRangeOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, []);

  const fetchMarcas = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    try {
      const response = await fetch('/api/marcas');
      if (response.status === 401) {
        // Unauthorized, redirect to login
        window.location.href = '/?error=Unauthorized';
        return;
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData?.details?.includes('column "tipo_marca" does not exist')) {
          setNeedsMigration(true);
          return;
        }
        throw new Error(errorData?.message || 'Error fetching data');
      }
      const data = await response.json();
      setMarcas(data);
      setNeedsMigration(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('column "tipo_marca" does not exist')) {
          setNeedsMigration(true);
          return;
        }
        toast.error(error.message);
      } else {
        toast.error('An error occurred while fetching the data');
      }
    }
  }, []);

  useEffect(() => {
    fetchMarcas();
  }, [fetchMarcas]);

  const handleEdit = (marca: Marca) => {
    console.log('Editing marca:', marca);
    setSelectedMarca({
      ...marca,
      titular: {
        fullName: marca.titular?.fullName || '',
        email: marca.titular?.email || '',
        phone: marca.titular?.phone || ''
      }
    });
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

  const handleSort = () => {
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDirection);
    
    const sorted = [...marcas].sort((a, b) => {
      const dateA = new Date(a.renovar).getTime();
      const dateB = new Date(b.renovar).getTime();
      return newDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    setSortedMarcas(sorted);
  };

  useEffect(() => {
    setSortedMarcas(marcas);
  }, [marcas]);

  const handleTimeRangeSelect = (days: number) => {
    setSelectedTimeRange(days);
    setIsTimeRangeOpen(false);
    localStorage.setItem('notificationTimeRange', days.toString());
  };

  useEffect(() => {
    const savedRange = localStorage.getItem('notificationTimeRange');
    if (savedRange) {
      setSelectedTimeRange(parseInt(savedRange));
    }
  }, []);

  const calculateProximosVencer = () => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + selectedTimeRange);
    
    return sortedMarcas.filter(marca => {
      const renovarDate = new Date(marca.renovar);
      return renovarDate >= today && renovarDate <= futureDate;
    }).length;
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

  const handleAddAnotacion = async (marca: Marca) => {
    try {
      const text = prompt('Nueva anotación:');
      if (!text?.trim()) return;

      const newAnotacion = {
        id: Math.random().toString(36).substr(2, 9),
        text: text.trim(),
        date: new Date().toISOString()
      };

      const updatedAnotaciones = [...marca.anotacion, newAnotacion];

      const response = await fetch(`/api/marcas?id=${marca.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...marca,
          anotaciones: updatedAnotaciones.map(note => note.text),
        }),
      });

      if (!response.ok) throw new Error('Error al agregar anotación');

      toast.success('Anotación agregada exitosamente');
      fetchMarcas();
    } catch (error) {
      console.error('Error adding anotacion:', error);
      toast.error('Error al agregar anotación');
    }
  };

  const handleDelete = async (marca: Marca) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta marca?')) return;

    try {
      const response = await fetch(`/api/marcas/${marca.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar marca');

      toast.success('Marca eliminada exitosamente');
      fetchMarcas();
    } catch (error) {
      console.error('Error deleting marca:', error);
      toast.error('Error al eliminar la marca');
    }
  };

  const handleAddOposicion = (marca: Marca) => {
    setSelectedMarca(marca);
    setOposicionModalOpen(true);
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const addToGoogleCalendar = (marca: Marca, type: 'renovar' | 'vencimiento') => {
    const date = type === 'renovar' ? marca.renovar : marca.vencimiento;
    const title = `${type === 'renovar' ? 'Renovar' : 'Vencimiento'} marca: ${marca.marca}`;
    const description = `Marca: ${marca.marca}\nTitular: ${marca.titular.fullName}\nEmail: ${marca.titular.email}\nTeléfono: ${marca.titular.phone}`;
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${date.split('T')[0].replace(/-/g, '')}/${date.split('T')[0].replace(/-/g, '')}&details=${encodeURIComponent(description)}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  const formatClases = (clases: number[]) => {
    return clases
      .sort((a, b) => a - b)
      .reduce((rows: string[], clase, index) => {
        const rowIndex = Math.floor(index / 3);
        if (!rows[rowIndex]) {
          rows[rowIndex] = clase.toString();
        } else {
          rows[rowIndex] += `, ${clase}`;
        }
        return rows;
      }, []);
  };

  const handleDeleteAnotacion = async (marca: Marca, index: number) => {
    try {
      const updatedAnotaciones = marca.anotacion.filter((_, i) => i !== index);

      const response = await fetch(`/api/marcas?id=${marca.id}`, {
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

      toast.success('Anotación eliminada exitosamente');
      fetchMarcas();
    } catch (error) {
      console.error('Error deleting anotacion:', error);
      toast.error('Error al eliminar anotación');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {needsMigration ? (
            <div className="mb-8 p-4 bg-yellow-100 rounded-lg">
              <p className="text-yellow-800 mb-4">
                La base de datos necesita ser actualizada para continuar.
              </p>
              <button
                onClick={() => router.push('/migrate')}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Actualizar Base de Datos
              </button>
            </div>
          ) : (
            <>
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
                        <div className="flex items-center space-x-2">
                          <p className="text-3xl font-bold text-white">{calculateProximosVencer()}</p>
                          <span className="text-sm text-white opacity-75">
                            en {selectedTimeRange} días
                          </span>
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setIsTimeRangeOpen(!isTimeRangeOpen)}
                          className="p-1.5 bg-yellow-600 bg-opacity-30 rounded-full hover:bg-opacity-50 transition-all duration-200"
                          title="Configurar período de notificación"
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
                              transform origin-top-right transition-all duration-200 ease-out"
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
              <div className="mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Lista de Marcas</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    <FaPlus className="h-4 w-4 mr-2" />
                    Agregar Marca
                  </motion.button>
                </div>
                <div className="flow-root">
                  <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                              <div className="min-w-[150px]">Marca</div>
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              <div className="min-w-[100px]">Tipo</div>
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              <div className="min-w-[100px]">Clases</div>
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              <div className="min-w-[150px]">Titular</div>
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              <div className="min-w-[200px]">
                                Fechas
                                <button
                                  onClick={handleSort}
                                  className="ml-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                  title={`Ordenar por fecha de renovación ${sortDirection === 'asc' ? 'descendente' : 'ascendente'}`}
                                >
                                  <FaSort className={`h-4 w-4 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                                </button>
                              </div>
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              <div className="min-w-[250px]">Oposiciones</div>
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              <div className="min-w-[250px] flex items-center justify-between">
                                <span>Anotaciones</span>
                              </div>
                            </th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                              <div className="min-w-[150px]">
                                <span className="sr-only">Acciones</span>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {sortedMarcas.map((marca) => (
                            <tr 
                              key={marca.id}
                              className="hover:bg-gray-50 transition-colors duration-200"
                            >
                              <td className="py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                                <div className="min-w-[150px]">
                                  <button
                                    onClick={() => handleEdit(marca)}
                                    className="hover:text-indigo-600 transition-colors duration-200"
                                  >
                                    {truncateText(marca.marca, 20)}
                                  </button>
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500">
                                <div className="min-w-[100px]">
                                  {marca.tipoMarca}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500">
                                <div className="min-w-[100px] space-y-1">
                                  {formatClases(marca.clases).map((row, index) => (
                                    <div key={index}>{row}</div>
                                  ))}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500">
                                <div className="min-w-[150px]">
                                  {marca.titular.fullName}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500">
                                <div className="min-w-[200px] flex flex-col space-y-4">
                                  <div className="flex flex-col">
                                    <span className="text-gray-700 font-medium mb-1">Renovar:</span>
                                    <div className="flex items-center space-x-2 pl-2">
                                      <span>{formatDate(marca.renovar)}</span>
                                      <button
                                        onClick={() => addToGoogleCalendar(marca, 'renovar')}
                                        className="text-blue-600 hover:text-blue-800 transform hover:scale-110 transition-all duration-200 cursor-pointer p-1 rounded-full hover:bg-blue-100"
                                        title="Agregar a Google Calendar"
                                      >
                                        <FaCalendarPlus className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-gray-700 font-medium mb-1">Vencimiento:</span>
                                    <div className="flex items-center space-x-2 pl-2">
                                      <span>{formatDate(marca.vencimiento)}</span>
                                      <button
                                        onClick={() => addToGoogleCalendar(marca, 'vencimiento')}
                                        className="text-blue-600 hover:text-blue-800 transform hover:scale-110 transition-all duration-200 cursor-pointer p-1 rounded-full hover:bg-blue-100"
                                        title="Agregar a Google Calendar"
                                      >
                                        <FaCalendarPlus className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500">
                                <div className="min-w-[250px]">
                                  {Array.isArray(marca.oposicion) && marca.oposicion.length > 0 ? (
                                    <div className="space-y-1">
                                      {marca.oposicion.map((op, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                          <button
                                            onClick={() => setViewTextModal({
                                              isOpen: true,
                                              title: 'Oposición',
                                              content: op.text
                                            })}
                                            className={`text-left ${op.completed ? 'text-green-600' : 'text-gray-600'} hover:text-gray-900 flex-grow`}
                                          >
                                            {truncateText(op.text)}
                                          </button>
                                          <div className="flex space-x-1">
                                            <button
                                              onClick={() => handleToggleOposicion(marca.id, index)}
                                              className={`${
                                                op.completed
                                                  ? 'text-green-600 hover:text-green-800'
                                                  : 'text-gray-400 hover:text-gray-600'
                                              } transform hover:scale-110 transition-all duration-200 cursor-pointer p-1 rounded-full hover:bg-gray-100`}
                                              title={op.completed ? 'Marcar como pendiente' : 'Marcar como completado'}
                                            >
                                              <svg className="h-4 w-4" fill={op.completed ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                              </svg>
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="flex justify-center">
                                      <button
                                        onClick={() => handleAddOposicion(marca)}
                                        className="text-indigo-600 hover:text-indigo-900 transform hover:scale-110 transition-all duration-200 cursor-pointer p-1 rounded-full hover:bg-indigo-100 inline-flex items-center"
                                        title="Agregar oposición"
                                      >
                                        <FaPlus className="h-4 w-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500">
                                <div className="min-w-[250px]">
                                  <div className="flex items-center justify-between mb-2">
                                    <button
                                      onClick={() => handleAddAnotacion(marca)}
                                      className="text-indigo-600 hover:text-indigo-900 transform hover:scale-110 transition-all duration-200 cursor-pointer p-1 rounded-full hover:bg-indigo-100 inline-flex items-center"
                                      title="Agregar anotación"
                                    >
                                      <FaPlus className="h-4 w-4" />
                                    </button>
                                  </div>
                                  {Array.isArray(marca.anotacion) && marca.anotacion.length > 0 ? (
                                    <div className="space-y-1">
                                      {marca.anotacion.map((note, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                          <button
                                            onClick={() => setViewTextModal({
                                              isOpen: true,
                                              title: 'Anotación',
                                              content: note.text
                                            })}
                                            className="text-left text-gray-600 hover:text-gray-900 flex-grow"
                                          >
                                            {truncateText(note.text)}
                                          </button>
                                          <button
                                            onClick={() => handleDeleteAnotacion(marca, index)}
                                            className="text-red-600 hover:text-red-900 transform hover:scale-110 transition-all duration-200 cursor-pointer p-1 rounded-full hover:bg-red-100"
                                            title="Eliminar anotación"
                                          >
                                            <FaTrash className="h-4 w-4" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-gray-400 text-sm italic">
                                      No hay anotaciones
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <div className="min-w-[150px] flex justify-center space-x-2">
                                  <button
                                    onClick={() => window.open(`https://wa.me/${marca.titular.phone}`, '_blank')}
                                    className="text-green-600 hover:text-green-900 transform hover:scale-110 transition-all duration-200 cursor-pointer p-1 rounded-full hover:bg-green-100"
                                    title="Enviar WhatsApp"
                                  >
                                    <FaWhatsapp className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => window.location.href = `mailto:${marca.titular.email}`}
                                    className="text-blue-600 hover:text-blue-900 transform hover:scale-110 transition-all duration-200 cursor-pointer p-1 rounded-full hover:bg-blue-100"
                                    title="Enviar Email"
                                  >
                                    <FaEnvelope className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleEdit(marca)}
                                    className="text-indigo-600 hover:text-indigo-900 transform hover:scale-110 transition-all duration-200 cursor-pointer p-1 rounded-full hover:bg-indigo-100"
                                    title="Editar Marca"
                                  >
                                    <FaEdit className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(marca)}
                                    className="text-red-600 hover:text-red-900 transform hover:scale-110 transition-all duration-200 cursor-pointer p-1 rounded-full hover:bg-red-100"
                                    title="Eliminar Marca"
                                  >
                                    <FaTrash className="h-5 w-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
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

      <ViewTextModal
        isOpen={viewTextModal.isOpen}
        onClose={() => setViewTextModal({ isOpen: false, title: '', content: '' })}
        title={viewTextModal.title}
        content={viewTextModal.content}
      />

      {selectedOposicion && (
        <OposicionModal
          isOpen={oposicionModalOpen}
          onClose={() => {
            setOposicionModalOpen(false);
            setSelectedOposicion(null);
          }}
          oposicion={selectedOposicion.oposicion}
          onComplete={() => {
            handleToggleOposicion(selectedOposicion.marcaId, selectedOposicion.index);
            setSelectedOposicion(null);
            setOposicionModalOpen(false);
          }}
        />
      )}
    </div>
  );
} 
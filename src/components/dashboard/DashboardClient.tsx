'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import AddMarcaModal from '../AddMarcaModal';
import { Marca, MarcaSubmissionData, Oposicion } from '@/types/marca';
import OposicionModal from '@/components/modals/OposicionModal';
import { FaWhatsapp, FaEnvelope, FaEdit, FaTrash, FaPlus, FaCalendarPlus } from 'react-icons/fa';
import ViewTextModal from '../ViewTextModal';
import { useRouter } from 'next/navigation';

export default function DashboardClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [selectedMarca, setSelectedMarca] = useState<Marca | null>(null);
  const [isTimeRangeOpen, setIsTimeRangeOpen] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<number>(7); // Default to 1 week (7 days)
  const timeRangeRef = useRef<HTMLDivElement>(null);
  const [selectedOposicion, setSelectedOposicion] = useState<{ marcaId: string; index: number; oposicion: Oposicion } | null>(null);
  const [viewTextModal, setViewTextModal] = useState<{ isOpen: boolean; title: string; content: string }>({
    isOpen: false,
    title: '',
    content: ''
  });
  const [needsMigration, setNeedsMigration] = useState(false);
  const router = useRouter();

  const timeRangeOptions = [
    { label: 'Una semana', days: 7 },
    { label: '3 Semanas', days: 21 },
    { label: '1 mes', days: 30 },
    { label: '2 meses', days: 60 },
    { label: '3 meses', days: 90 },
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

  const handleAddOposicion = async (marca: Marca) => {
    try {
      const text = prompt('Nueva oposición:');
      if (!text?.trim()) return;

      const newOposicion = {
        id: Math.random().toString(36).substr(2, 9),
        text: text.trim(),
        date: new Date().toISOString(),
        completed: false
      };

      const updatedOposiciones = [...marca.oposicion, newOposicion];

      const response = await fetch(`/api/marcas?id=${marca.id}`, {
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

      toast.success('Oposición agregada exitosamente');
      fetchMarcas();
    } catch (error) {
      console.error('Error adding oposicion:', error);
      toast.error('Error al agregar oposición');
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const addToGoogleCalendar = (marca: Marca, type: 'renovar' | 'vencimiento') => {
    const date = type === 'renovar' ? marca.renovar : marca.vencimiento;
    const title = `${type === 'renovar' ? 'Renovar' : 'Vencimiento'} marca: ${marca.marca}`;
    const description = `Marca: ${marca.marca}\nTitular: ${marca.titular.fullName}\nEmail: ${marca.titular.email}\nTeléfono: ${marca.titular.phone}`;
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${date.split('T')[0].replace(/-/g, '')}/${date.split('T')[0].replace(/-/g, '')}&details=${encodeURIComponent(description)}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 bg-white">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">Marcas Registradas</h1>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
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
          </div>
          <div className="border-t border-gray-200">
            <div className="mt-8 flow-root bg-white">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                            Marca
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Tipo
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Clases
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Titular
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Fechas
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Oposiciones
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Anotaciones
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {marcas.map((marca) => (
                          <tr key={marca.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              <button
                                onClick={() => setViewTextModal({
                                  isOpen: true,
                                  title: 'Nombre de la Marca',
                                  content: marca.marca
                                })}
                                className="text-left hover:text-indigo-600 transition-colors duration-200"
                              >
                                {truncateText(marca.marca, 20)}
                              </button>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {marca.tipoMarca}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {marca.clases.join(", ")}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {marca.titular.fullName}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-700 font-medium">Renovar:</span>
                                  <span>{formatDate(marca.renovar)}</span>
                                  <button
                                    onClick={() => addToGoogleCalendar(marca, 'renovar')}
                                    className="text-blue-600 hover:text-blue-800 transform hover:scale-110 transition-all duration-200 cursor-pointer p-1 rounded-full hover:bg-blue-100"
                                    title="Agregar a Google Calendar"
                                  >
                                    <FaCalendarPlus className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-700 font-medium">Vencimiento:</span>
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
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
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
                                        <button
                                          onClick={() => {
                                            const updatedOposiciones = marca.oposicion.filter((_, i) => i !== index);
                                            fetch(`/api/marcas?id=${marca.id}`, {
                                              method: 'PUT',
                                              headers: {
                                                'Content-Type': 'application/json',
                                              },
                                              body: JSON.stringify({
                                                ...marca,
                                                oposicion: updatedOposiciones,
                                              }),
                                            }).then(response => {
                                              if (response.ok) {
                                                fetchMarcas();
                                                toast.success('Oposición eliminada exitosamente');
                                              } else {
                                                throw new Error('Error al eliminar oposición');
                                              }
                                            }).catch(error => {
                                              console.error('Error deleting oposicion:', error);
                                              toast.error('Error al eliminar la oposición');
                                            });
                                          }}
                                          className="text-red-600 hover:text-red-800 transform hover:scale-110 transition-all duration-200 cursor-pointer p-1 rounded-full hover:bg-red-100"
                                          title="Eliminar oposición"
                                        >
                                          <FaTrash className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                  <div className="flex justify-center">
                                    <button
                                      onClick={() => handleAddOposicion(marca)}
                                      className="text-indigo-600 hover:text-indigo-900 transform hover:scale-110 transition-all duration-200 cursor-pointer p-1 rounded-full hover:bg-indigo-100 inline-flex items-center"
                                      title="Agregar otra oposición"
                                    >
                                      <FaPlus className="h-4 w-4" />
                                    </button>
                                  </div>
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
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
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
                                        onClick={() => {
                                          const updatedAnotaciones = marca.anotacion.filter((_, i) => i !== index);
                                          fetch(`/api/marcas?id=${marca.id}`, {
                                            method: 'PUT',
                                            headers: {
                                              'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({
                                              ...marca,
                                              anotaciones: updatedAnotaciones.map(note => note.text),
                                            }),
                                          }).then(response => {
                                            if (response.ok) {
                                              fetchMarcas();
                                              toast.success('Anotación eliminada exitosamente');
                                            } else {
                                              throw new Error('Error al eliminar anotación');
                                            }
                                          }).catch(error => {
                                            console.error('Error deleting anotacion:', error);
                                            toast.error('Error al eliminar la anotación');
                                          });
                                        }}
                                        className="text-red-600 hover:text-red-800 transform hover:scale-110 transition-all duration-200 cursor-pointer p-1 rounded-full hover:bg-red-100"
                                        title="Eliminar anotación"
                                      >
                                        <FaTrash className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                  <div className="flex justify-center">
                                    <button
                                      onClick={() => handleAddAnotacion(marca)}
                                      className="text-indigo-600 hover:text-indigo-900 transform hover:scale-110 transition-all duration-200 cursor-pointer p-1 rounded-full hover:bg-indigo-100 inline-flex items-center"
                                      title="Agregar otra anotación"
                                    >
                                      <FaPlus className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-center">
                                  <button
                                    onClick={() => handleAddAnotacion(marca)}
                                    className="text-indigo-600 hover:text-indigo-900 transform hover:scale-110 transition-all duration-200 cursor-pointer p-1 rounded-full hover:bg-indigo-100 inline-flex items-center"
                                    title="Agregar anotación"
                                  >
                                    <FaPlus className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <div className="flex justify-center space-x-2">
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

      <ViewTextModal
        isOpen={viewTextModal.isOpen}
        onClose={() => setViewTextModal({ isOpen: false, title: '', content: '' })}
        title={viewTextModal.title}
        content={viewTextModal.content}
      />

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
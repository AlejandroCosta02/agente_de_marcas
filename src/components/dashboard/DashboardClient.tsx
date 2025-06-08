'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import AddMarcaModal from '../AddMarcaModal';
import { Marca, MarcaSubmissionData } from '@/types/marca';

export default function DashboardClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMarca, setSelectedMarca] = useState<Marca | null>(null);

  useEffect(() => {
    fetchMarcas();
  }, []);

  const fetchMarcas = async () => {
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
  };

  const handleEdit = (marca: Marca) => {
    setSelectedMarca(marca);
    setIsModalOpen(true);
  };

  const handleDelete = async (marca: Marca) => {
    try {
      const response = await fetch(`/api/marcas?id=${marca.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar la marca');
      }

      toast.success('Marca eliminada exitosamente');
      fetchMarcas(); // Refresh the list
    } catch (error) {
      console.error('Error deleting marca:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la marca');
    }
  };

  const handleDeleteClick = (marca: Marca) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta marca? Esta acción no se puede deshacer.')) {
      handleDelete(marca);
    }
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
  const proximosVencimientos = marcas.filter(m => {
    const vencimiento = new Date(m.vencimiento);
    const hoy = new Date();
    const diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes <= 30;
  }).length;

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

            {/* Próximos Vencimientos */}
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-yellow-600 bg-opacity-30 rounded-full p-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white uppercase">Próximos Vencimientos</p>
                  <p className="text-3xl font-bold text-white">{proximosVencimientos}</p>
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
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marca
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acta
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resolución
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fechas
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Titular
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Anotaciones
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Oposiciones
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          Cargando...
                        </td>
                      </tr>
                    ) : marcas.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          No hay marcas registradas
                        </td>
                      </tr>
                    ) : (
                      marcas.map((marca) => (
                        <tr key={marca.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {marca.marca}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {marca.acta}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {marca.resolucion}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>
                              <p>Renovar: {new Date(marca.renovar).toLocaleDateString()}</p>
                              <p>Vence: {new Date(marca.vencimiento).toLocaleDateString()}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="space-y-2">
                              <p className="font-medium">{marca.titular.fullName}</p>
                              <div className="flex items-center space-x-2">
                                <p className="text-xs text-gray-400">{marca.titular.phone}</p>
                                <a
                                  href={`https://wa.me/${marca.titular.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-green-50 text-green-600 rounded-full 
                                    transition-all duration-200 ease-in-out
                                    hover:bg-green-100 hover:shadow-md hover:scale-110
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                                    cursor-pointer"
                                  title="Enviar WhatsApp"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                                    />
                                  </svg>
                                </a>
                              </div>
                              <div className="flex items-center space-x-2">
                                <p className="text-xs text-gray-400">{marca.titular.email}</p>
                                <a
                                  href={`mailto:${marca.titular.email}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-blue-50 text-blue-600 rounded-full 
                                    transition-all duration-200 ease-in-out
                                    hover:bg-blue-100 hover:shadow-md hover:scale-110
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                    cursor-pointer"
                                  title="Enviar Email"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                  </svg>
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {marca.anotaciones && marca.anotaciones.length > 0 ? (
                              <ul className="list-disc list-inside">
                                {marca.anotaciones.map((anotacion, index) => (
                                  <li key={index} className="truncate max-w-xs">{anotacion}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-gray-400">Sin anotaciones</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {marca.oposicion && marca.oposicion.length > 0 ? (
                              <ul className="list-disc list-inside">
                                {marca.oposicion.map((op, index) => (
                                  <li key={index} className="truncate max-w-xs">{op}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-gray-400">Sin oposiciones</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-3">
                              <button 
                                onClick={() => handleEdit(marca)}
                                className="p-1.5 bg-indigo-50 text-indigo-600 rounded-full 
                                  transition-all duration-200 ease-in-out
                                  hover:bg-indigo-100 hover:shadow-md hover:scale-110
                                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                                  cursor-pointer"
                                title="Editar"
                              >
                                <svg 
                                  className="w-5 h-5" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                  strokeWidth="2"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleDeleteClick(marca)}
                                className="p-1.5 bg-red-50 text-red-600 rounded-full 
                                  transition-all duration-200 ease-in-out
                                  hover:bg-red-100 hover:shadow-md hover:scale-110
                                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                                  cursor-pointer"
                                title="Eliminar"
                              >
                                <svg 
                                  className="w-5 h-5" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                  strokeWidth="2"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
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

      <AddMarcaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMarca(null);
        }}
        onSubmit={handleSubmit}
        initialData={selectedMarca}
      />
    </div>
  );
} 
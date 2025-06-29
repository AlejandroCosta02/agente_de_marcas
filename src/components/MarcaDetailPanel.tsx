import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaEdit, FaTrash, FaWhatsapp, FaEnvelope, FaCalendarPlus, FaPlus, FaFile, FaUser } from 'react-icons/fa';
import type { Marca } from '../types/marca';

interface MarcaDetailPanelProps {
  isOpen: boolean;
  marca: Marca | null;
  onClose: () => void;
  onEdit: (marca: Marca) => void;
  onDelete: (marca: Marca) => void;
  onAddOposicion: (marca: Marca) => void;
  onAddAnotacion: (marca: Marca) => void;
  onManageFiles: (marcaId: string) => void;
  onToggleOposicion: (marcaId: string, index: number) => void;
  onDeleteOposicion: (marca: Marca, index: number) => void;
  onDeleteAnotacion: (marca: Marca, index: number) => void;
  onViewText: (title: string, content: string) => void;
  onAddToCalendar: (marca: Marca, type: 'renovar' | 'vencimiento') => void;
}

export default function MarcaDetailPanel({
  isOpen,
  marca,
  onClose,
  onEdit,
  onDelete,
  onAddOposicion,
  onAddAnotacion,
  onManageFiles,
  onToggleOposicion,
  onDeleteOposicion,
  onDeleteAnotacion,
  onViewText,
  onAddToCalendar
}: MarcaDetailPanelProps) {
  if (!isOpen || !marca) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const titular = marca.titular ?? marca.titulares?.[0] ?? { fullName: '', email: '', phone: '' };

  return (
    <div className="fixed inset-0 z-50 flex pointer-events-none">
      {/* Panel only, no backdrop */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="ml-auto h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto pointer-events-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Detalles de Marca</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          {/* Marca Information */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre de Marca</label>
                  <p className="mt-1 text-sm text-gray-900">{marca.marca}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Marca</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {(() => {
                      switch (String(marca.tipoMarca)) {
                        case 'denominativa': return '🔤 Denominativa';
                        case 'mixta': return '🧷 Mixta';
                        case 'figurativa': return '🖼️ Figurativa';
                        case 'tridimensional': return '📦 Tridimensional';
                        case 'olfativa': return '🌸 Olfativa';
                        case 'sonora': return '🔊 Sonora';
                        case 'movimiento': return '🎞️ Movimiento';
                        case 'holografica': return '✨ Holográfica';
                        case 'colectiva': return '👥 Colectiva';
                        case 'certificacion': return '✅ Certificación';
                        default: return String(marca.tipoMarca).charAt(0).toUpperCase() + String(marca.tipoMarca).slice(1);
                      }
                    })()}
                  </p>
                </div>
                <div>
                  {/* <label className="block text-sm font-medium text-gray-700">Clases</label> */}
                  {marca.clases && marca.clases.length > 0 ? (
                    <div className="mt-1">
                      <div className="grid grid-cols-3 gap-2 font-semibold text-gray-900 mb-1">
                        <span>Clase</span>
                        <span>Acta n.º</span>
                        <span>Resolución</span>
                      </div>
                      {marca.clases.sort((a, b) => a - b).map((clase) => (
                        <div key={clase} className="grid grid-cols-3 gap-2 mb-1 items-center">
                          <span className="text-gray-800">{clase}</span>
                          <span className="text-gray-900">{marca.classDetails?.[clase]?.acta || '-'}</span>
                          <span className="text-gray-900">{marca.classDetails?.[clase]?.resolucion || '-'}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">-</p>
                  )}
                </div>
              </div>
            </div>

            {/* Titulares Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Titulares</h3>
              <div className="space-y-4">
                {(marca.titulares && Array.isArray(marca.titulares) && marca.titulares.length > 0) ? (
                  marca.titulares.map((titular, index) => (
                    <div key={titular.id || index} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center mb-3">
                        <FaUser className="w-5 h-5 text-indigo-600 mr-2" />
                        <h4 className="font-medium text-gray-900">Titular {index + 1}</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                          <p className="mt-1 text-sm text-gray-900">{titular.fullName}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <p className="mt-1 text-sm text-gray-900">{titular.email}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <p className="mt-1 text-sm text-gray-900">{titular.phone || 'No especificado'}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {titular.phone && (
                            <button
                              onClick={() => window.open(`https://wa.me/${titular.phone}`, '_blank')}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <FaWhatsapp className="w-4 h-4 mr-2" />
                              WhatsApp
                            </button>
                          )}
                          <button
                            onClick={() => window.location.href = `mailto:${titular.email}`}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <FaEnvelope className="w-4 h-4 mr-2" />
                            Email
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback to old titular structure for backward compatibility
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center mb-3">
                      <FaUser className="w-5 h-5 text-indigo-600 mr-2" />
                      <h4 className="font-medium text-gray-900">Titular</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                        <p className="mt-1 text-sm text-gray-900">{titular.fullName}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <p className="mt-1 text-sm text-gray-900">{titular.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                          <p className="mt-1 text-sm text-gray-900">{titular.phone || 'No especificado'}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {titular.phone && (
                          <button
                            onClick={() => window.open(`https://wa.me/${titular.phone}`, '_blank')}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <FaWhatsapp className="w-4 h-4 mr-2" />
                            WhatsApp
                          </button>
                        )}
                        {titular.email && (
                          <button
                            onClick={() => window.location.href = `mailto:${titular.email}`}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <FaEnvelope className="w-4 h-4 mr-2" />
                            Email
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fechas Importantes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Renovar</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-sm text-gray-900">{formatDate(marca.renovar)}</span>
                    <button
                      onClick={() => onAddToCalendar(marca, 'renovar')}
                      className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                      title="Agregar a Google Calendar"
                      style={{ cursor: 'pointer' }}
                    >
                      <FaCalendarPlus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vencimiento</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-sm text-gray-900">{formatDate(marca.vencimiento)}</span>
                    <button
                      onClick={() => onAddToCalendar(marca, 'vencimiento')}
                      className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                      title="Agregar a Google Calendar"
                      style={{ cursor: 'pointer' }}
                    >
                      <FaCalendarPlus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">DJUMT</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-sm text-gray-900">{formatDate(marca.djumt)}</span>
                    <button
                      onClick={() => {
                        const title = encodeURIComponent(`DJUMT - ${marca.marca}`);
                        const date = new Date(marca.djumt);
                        const start = date.toISOString().replace(/[-:]|\.\d{3}/g, '').slice(0, 15) + 'Z';
                        const end = start;
                        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}`;
                        window.open(url, '_blank');
                      }}
                      className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                      title="Agregar a Google Calendar"
                      style={{ cursor: 'pointer' }}
                    >
                      <FaCalendarPlus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Anotaciones */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Anotaciones</h3>
                <button
                  onClick={() => onAddAnotacion(marca)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  Agregar
                </button>
              </div>
              <div className="space-y-2">
                {Array.isArray(marca.anotacion) && marca.anotacion.length > 0 ? (
                  marca.anotacion.map((note, index) => (
                    <div key={index} className="flex items-center justify-between group bg-white hover:bg-gray-50 rounded-md p-3 transition-all duration-200">
                      <button
                        onClick={() => onViewText('Anotación', note.text)}
                        className="text-left text-gray-600 hover:text-gray-900 flex-grow text-sm truncate mr-2"
                      >
                        {truncateText(note.text)}
                      </button>
                      <button
                        onClick={() => onDeleteAnotacion(marca, index)}
                        className="text-red-500 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"
                        title="Eliminar anotación"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm italic">No hay anotaciones</p>
                )}
              </div>
            </div>

            {/* Oposiciones */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Oposiciones</h3>
                <button
                  onClick={() => onAddOposicion(marca)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  Agregar
                </button>
              </div>
              <div className="space-y-2">
                {Array.isArray(marca.oposicion) && marca.oposicion.length > 0 ? (
                  marca.oposicion.map((op, index) => (
                    <div key={index} className="flex items-center justify-between group bg-white hover:bg-gray-50 rounded-md p-3 transition-all duration-200">
                      <button
                        onClick={() => onViewText('Oposición', op.text)}
                        className={`text-left flex-grow text-sm truncate mr-2 ${
                          op.completed ? 'text-green-600' : 'text-gray-600'
                        } hover:text-gray-900`}
                      >
                        {truncateText(op.text)}
                      </button>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onToggleOposicion(marca.id, index)}
                          className={`${
                            op.completed
                              ? 'text-green-600 hover:text-green-800'
                              : 'text-gray-400 hover:text-gray-600'
                          } transition-colors`}
                          title={op.completed ? 'Marcar como pendiente' : 'Marcar como completado'}
                        >
                          <svg className="h-4 w-4" fill={op.completed ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDeleteOposicion(marca, index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Eliminar oposición"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm italic">No hay oposiciones</p>
                )}
              </div>
            </div>

            {/* Files */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Archivos</h3>
                <button
                  onClick={() => onManageFiles(marca.id)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaFile className="w-4 h-4 mr-2" />
                  Administrar
                </button>
              </div>
              <p className="text-gray-400 text-sm italic">Archivos PDF asociados a esta marca</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cerrar
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(marca)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaEdit className="w-4 h-4 mr-2" />
                Editar
              </button>
              <button
                onClick={() => onDelete(marca)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FaTrash className="w-4 h-4 mr-2" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 
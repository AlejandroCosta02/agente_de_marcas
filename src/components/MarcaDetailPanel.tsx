import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaEdit, FaTrash, FaWhatsapp, FaEnvelope, FaCalendarPlus, FaPlus, FaFile, FaUser, FaCalendarAlt, FaStickyNote, FaGavel, FaFolder, FaRegIdCard, FaInfoCircle, FaEyeSlash } from 'react-icons/fa';
import type { Marca } from '../types/marca';

interface MarcaDetailPanelProps {
  isOpen: boolean;
  marca: Marca | null;
  onClose: () => void;
  onHide: (marcaId: string) => void;
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
  onHide,
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

  // Helper to get initials from marca name
  const getMarcaInitials = (name: string) => {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex pointer-events-none">
      {/* Panel only, no backdrop */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="ml-auto h-full w-full max-w-2xl bg-gradient-to-br from-slate-50 to-white shadow-2xl overflow-y-auto pointer-events-auto"
      >
        <div className="p-8">
          {/* Header with prominent marca name */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg min-w-[48px] min-h-[48px] flex items-center justify-center">
                  <span className="text-white text-2xl font-extrabold tracking-wide select-none">
                    {getMarcaInitials(marca.marca)}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {marca.marca}
                  </h1>
                  <p className="text-sm text-gray-500 font-medium">Marca Comercial</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Marca Information */}
          <div className="space-y-8">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <FaRegIdCard className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Información Básica</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6 gap-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Nombre de Marca</label>
                  <p className="text-lg font-semibold text-gray-900 leading-tight">{marca.marca}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tipo de Marca</label>
                  <p className="text-lg font-medium text-gray-800 capitalize">
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
              </div>
              {/* 3-column row for Clase, Acta, Resolucion under basic info */}
              {marca.clases && marca.clases.length > 0 && (
                <div className="mt-6">
                  <div className="grid grid-cols-3 gap-4 font-semibold text-xs text-gray-500 uppercase tracking-wide mb-2">
                    <div>Clase</div>
                    <div>ACTA N.º</div>
                    <div>RESOLUCIÓN</div>
                  </div>
                  {marca.clases.sort((a, b) => a - b).map((clase) => (
                    <div key={clase} className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 last:border-b-0 text-base text-gray-800">
                      <div className="font-bold text-blue-700">{clase}</div>
                      <div>{marca.classDetails?.[clase]?.acta || '-'}</div>
                      <div>{marca.classDetails?.[clase]?.resolucion || '-'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Titulares Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <FaUser className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Titulares</h3>
              </div>
              <div className="space-y-6">
                {(marca.titulares && Array.isArray(marca.titulares) && marca.titulares.length > 0) ? (
                  marca.titulares.map((titular, index) => (
                    <div key={titular.id || index} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                          <FaUser className="w-4 h-4 text-green-600" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">Titular {index + 1}</h4>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nombre Completo</label>
                          <p className="text-lg font-semibold text-gray-900">{titular.fullName}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-4 gap-y-2">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</label>
                            <p className="text-base text-gray-800">{titular.email}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Teléfono</label>
                            <p className="text-base text-gray-800">{titular.phone || 'No especificado'}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2 w-full">
                          {titular.phone && (
                            <button
                              onClick={() => window.open(`https://wa.me/${titular.phone}`, '_blank')}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-sm"
                            >
                              <FaWhatsapp className="w-4 h-4 mr-2" />
                              WhatsApp
                            </button>
                          )}
                          <button
                            onClick={() => window.location.href = `mailto:${titular.email}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
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
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <FaUser className="w-4 h-4 text-green-600" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">Titular</h4>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nombre Completo</label>
                        <p className="text-lg font-semibold text-gray-900">{titular.fullName}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-4 gap-y-2">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</label>
                          <p className="text-base text-gray-800">{titular.email}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Teléfono</label>
                          <p className="text-base text-gray-800">{titular.phone || 'No especificado'}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2 w-full">
                        {titular.phone && (
                          <button
                            onClick={() => window.open(`https://wa.me/${titular.phone}`, '_blank')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-sm"
                          >
                            <FaWhatsapp className="w-4 h-4 mr-2" />
                            WhatsApp
                          </button>
                        )}
                        {titular.email && (
                          <button
                            onClick={() => window.location.href = `mailto:${titular.email}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
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
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-orange-100 rounded-lg mr-3">
                  <FaCalendarAlt className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Fechas Importantes</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-100">
                  <label className="block text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">Renovar</label>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-gray-900">{formatDate(marca.renovar)}</span>
                    <button
                      onClick={() => onAddToCalendar(marca, 'renovar')}
                      className="text-orange-600 hover:text-orange-800 transition-colors cursor-pointer p-1 hover:bg-orange-100 rounded"
                      title="Agregar a Google Calendar"
                    >
                      <FaCalendarPlus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-100">
                  <label className="block text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Vencimiento</label>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-gray-900">{formatDate(marca.vencimiento)}</span>
                    <button
                      onClick={() => onAddToCalendar(marca, 'vencimiento')}
                      className="text-red-600 hover:text-red-800 transition-colors cursor-pointer p-1 hover:bg-red-100 rounded"
                      title="Agregar a Google Calendar"
                    >
                      <FaCalendarPlus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100 md:col-span-2">
                  <label className="block text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                    DJUMT
                    <span className="relative group cursor-pointer ml-1">
                      <FaInfoCircle className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-600 transition-colors" />
                      <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 bg-white text-xs text-gray-700 rounded-lg shadow-lg px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity duration-200 border border-gray-200 text-center">
                        DDJJ DE USO DE MEDIO TÉRMINO
                      </span>
                    </span>
                  </label>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-gray-900">{formatDate(marca.djumt)}</span>
                    <button
                      onClick={() => {
                        const title = encodeURIComponent(`DJUMT - ${marca.marca}`);
                        const date = new Date(marca.djumt);
                        const start = date.toISOString().replace(/[-:]|\.\d{3}/g, '').slice(0, 15) + 'Z';
                        const end = start;
                        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}`;
                        window.open(url, '_blank');
                      }}
                      className="text-purple-600 hover:text-purple-800 transition-colors cursor-pointer p-1 hover:bg-purple-100 rounded"
                      title="Agregar a Google Calendar"
                    >
                      <FaCalendarPlus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Anotaciones */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                    <FaStickyNote className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Anotaciones</h3>
                </div>
                <button
                  onClick={() => onAddAnotacion(marca)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200 shadow-sm"
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  Agregar
                </button>
              </div>
              <div className="space-y-3">
                {Array.isArray(marca.anotacion) && marca.anotacion.length > 0 ? (
                  marca.anotacion.map((note, index) => (
                    <div key={index} className="flex items-center justify-between group bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 rounded-xl p-4 transition-all duration-200 border border-yellow-200">
                      <button
                        onClick={() => onViewText('Anotación', note.text)}
                        className="text-left text-gray-700 hover:text-gray-900 flex-grow text-base font-medium truncate mr-3"
                      >
                        {truncateText(note.text)}
                      </button>
                      <button
                        onClick={() => onDeleteAnotacion(marca, index)}
                        className="text-red-500 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg"
                        title="Eliminar anotación"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm italic text-center py-4">No hay anotaciones</p>
                )}
              </div>
            </div>

            {/* Oposiciones */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg mr-3">
                    <FaGavel className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Oposiciones</h3>
                </div>
                <button
                  onClick={() => onAddOposicion(marca)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm"
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  Agregar
                </button>
              </div>
              <div className="space-y-3">
                {Array.isArray(marca.oposicion) && marca.oposicion.length > 0 ? (
                  marca.oposicion.map((op, index) => (
                    <div key={index} className="flex items-center justify-between group bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 rounded-xl p-4 transition-all duration-200 border border-red-200">
                      <button
                        onClick={() => onViewText('Oposición', op.text)}
                        className={`text-left flex-grow text-base font-medium truncate mr-3 ${
                          op.completed ? 'text-green-700' : 'text-gray-700'
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
                          } transition-colors p-2 hover:bg-gray-100 rounded-lg`}
                          title={op.completed ? 'Marcar como pendiente' : 'Marcar como completado'}
                        >
                          <svg className="h-4 w-4" fill={op.completed ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDeleteOposicion(marca, index)}
                          className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                          title="Eliminar oposición"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm italic text-center py-4">No hay oposiciones</p>
                )}
              </div>
            </div>

            {/* Files */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                    <FaFolder className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Archivos</h3>
                </div>
                <button
                  onClick={() => onManageFiles(marca.id)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm"
                >
                  <FaFile className="w-4 h-4 mr-2" />
                  Administrar
                </button>
              </div>
              <p className="text-gray-500 text-sm italic text-center py-4">Archivos PDF asociados a esta marca</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-10 pt-8 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-8 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm"
            >
              Cerrar
            </button>
            <div className="flex space-x-3">
              <button
                onClick={() => onHide(marca.id)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 shadow-sm"
              >
                <FaEyeSlash className="w-4 h-4 mr-2" />
                Ocultar
              </button>
              <button
                onClick={() => onEdit(marca)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm"
              >
                <FaEdit className="w-4 h-4 mr-2" />
                Editar
              </button>
              <button
                onClick={() => onDelete(marca)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm"
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
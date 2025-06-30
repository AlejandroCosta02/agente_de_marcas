'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCog } from 'react-icons/fa';

export type DateType = 'fechaDeRenovacion' | 'fechaDeVencimiento' | 'DJUMT';
export type TimeRange = '15' | '30' | '60' | '90';

interface DateFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateType: DateType;
  timeRange: TimeRange;
  onDateTypeChange: (dateType: DateType) => void;
  onTimeRangeChange: (timeRange: TimeRange) => void;
}

const dateTypeOptions = [
  { value: 'fechaDeRenovacion' as DateType, label: 'Fecha de Renovación', title: 'Próximo a Renovar' },
  { value: 'fechaDeVencimiento' as DateType, label: 'Fecha de Vencimiento', title: 'Próximo a Vencer' },
  { value: 'DJUMT' as DateType, label: 'DJUMT', title: 'Próximo a DJUMT' }
];

const timeRangeOptions = [
  { value: '15' as TimeRange, label: '15 días' },
  { value: '30' as TimeRange, label: '1 mes' },
  { value: '60' as TimeRange, label: '2 meses' },
  { value: '90' as TimeRange, label: '3 meses' }
];

export default function DateFilterModal({
  isOpen,
  onClose,
  dateType,
  timeRange,
  onDateTypeChange,
  onTimeRangeChange
}: DateFilterModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaCog className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Configurar Filtros</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Date Type Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Fecha
              </label>
              <div className="space-y-2">
                {dateTypeOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="dateType"
                      value={option.value}
                      checked={dateType === option.value}
                      onChange={(e) => onDateTypeChange(e.target.value as DateType)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{option.label}</div>
                      <div className="text-xs text-gray-500">Título: {option.title}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Time Range Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rango de Tiempo
              </label>
              <div className="grid grid-cols-2 gap-2">
                {timeRangeOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="timeRange"
                      value={option.value}
                      checked={timeRange === option.value}
                      onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Vista Previa</h3>
              <div className="text-sm text-gray-600">
                <p>Mostrar marcas con {dateTypeOptions.find(opt => opt.value === dateType)?.label.toLowerCase()} 
                   en los próximos {timeRangeOptions.find(opt => opt.value === timeRange)?.label}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Aplicar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 
'use client';

import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { FaUpload, FaSearch, FaDownload, FaEnvelope, FaTimes, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface TrademarkMatch {
  detectedTrademark: string;
  detectedClass: string;
  matchedTrademark: string;
  matchedClass: string;
  similarityPercentage: number;
  suggestedAction: string;
}

interface BoletinScannerProps {
  isOpen: boolean;
  onClose: () => void;
  userPlan: string;
  onUpgradeClick: () => void;
}

export default function BoletinScanner({ isOpen, onClose, userPlan, onUpgradeClick }: BoletinScannerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [scanResults, setScanResults] = useState<TrademarkMatch[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPremium = userPlan === 'pro' || userPlan === 'master' || userPlan === 'essential';

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Por favor, sube un archivo PDF válido');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('El archivo es demasiado grande. Máximo 10MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/boletin/scan', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al procesar el boletín');
      }

      const data = await response.json();
      setScanResults(data.matches || []);
      setHasScanned(true);
      toast.success('Boletín escaneado exitosamente');
    } catch (error) {
      console.error('Error scanning boletin:', error);
      toast.error(error instanceof Error ? error.message : 'Error al escanear el boletín');
    } finally {
      setIsUploading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const response = await fetch('/api/boletin/export-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matches: scanResults }),
      });

      if (!response.ok) throw new Error('Error al exportar el informe');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `informe-boletin-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Informe exportado exitosamente');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Error al exportar el informe');
    }
  };

  const handleSendEmail = async () => {
    try {
      const response = await fetch('/api/boletin/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matches: scanResults }),
      });

      if (!response.ok) throw new Error('Error al enviar el email');

      toast.success('Informe enviado por email exitosamente');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Error al enviar el email');
    }
  };

  const getSimilarityColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-600 bg-red-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getSuggestedAction = (percentage: number) => {
    if (percentage >= 80) return '⚠️ Acción inmediata requerida';
    if (percentage >= 60) return '🔍 Monitorear de cerca';
    return '✅ Bajo riesgo';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <FaSearch className="text-indigo-600 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Escanear Boletín</h2>
              <p className="text-sm text-gray-600">Detecta posibles conflictos con tus marcas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!isPremium ? (
            /* Premium Lock Screen */
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <FaLock className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Función Premium
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Escaneá el boletín oficial del INPI y detectá posibles conflictos con tus marcas registradas.
                Esta herramienta está disponible en los planes Essential, Pro y Master.
              </p>
              <div className="space-y-3">
                <button
                  onClick={onUpgradeClick}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Ver Planes Premium
                </button>
                <Link
                  href="/planes"
                  className="block text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Comparar todos los planes →
                </Link>
              </div>
            </div>
          ) : (
            /* Premium Content */
            <div className="space-y-6">
              {/* Upload Section */}
              {!hasScanned && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FaUpload className="text-indigo-600 text-2xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Subí el boletín del INPI
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Seleccioná el archivo PDF del boletín oficial para analizar posibles conflictos con tus marcas
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'Procesando...' : 'Seleccionar PDF'}
                  </button>
                  <p className="text-xs text-gray-500 mt-3">
                    Máximo 10MB • Solo archivos PDF
                  </p>
                </div>
              )}

              {/* Results Section */}
              {hasScanned && (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Resumen del Escaneo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{scanResults.length}</div>
                        <div className="text-gray-600">Coincidencias encontradas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {scanResults.filter(m => m.similarityPercentage >= 80).length}
                        </div>
                        <div className="text-gray-600">Alto riesgo</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {scanResults.filter(m => m.similarityPercentage < 60).length}
                        </div>
                        <div className="text-gray-600">Bajo riesgo</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleExportReport}
                      className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FaDownload />
                      Exportar Informe
                    </button>
                    <button
                      onClick={handleSendEmail}
                      className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaEnvelope />
                      Enviar por Email
                    </button>
                    <button
                      onClick={() => {
                        setHasScanned(false);
                        setScanResults([]);
                      }}
                      className="flex items-center gap-2 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <FaUpload />
                      Escanear Otro
                    </button>
                  </div>

                  {/* Results Table */}
                  {scanResults.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Marca Detectada
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Clase
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Coincide con
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Similitud
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Acción
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {scanResults.map((match, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {match.detectedTrademark}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {match.detectedClass}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {match.matchedTrademark}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSimilarityColor(match.similarityPercentage)}`}>
                                  {match.similarityPercentage}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {getSuggestedAction(match.similarityPercentage)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <FaSearch className="text-green-600 text-3xl" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        ¡Excelente! No se encontraron conflictos
                      </h3>
                      <p className="text-gray-600">
                        El boletín no contiene marcas que representen un riesgo significativo para tus registros.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 
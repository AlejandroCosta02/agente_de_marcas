'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { MarcaFile } from '@/types/marca';
import { FaUpload, FaTrash, FaEdit, FaDownload, FaTimes } from 'react-icons/fa';
import Modal from '@/components/ui/Modal';

interface UploadFileModalProps {
  marcaId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface FileUploadState {
  file: File | null;
  isUploading: boolean;
  progress: number;
}

export default function UploadFileModal({ marcaId, isOpen, onClose }: UploadFileModalProps) {
  const [files, setFiles] = useState<MarcaFile[]>([]);
  const [uploadState, setUploadState] = useState<FileUploadState>({
    file: null,
    isUploading: false,
    progress: 0
  });
  const [editingFile, setEditingFile] = useState<MarcaFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    }
  }, [isOpen, marcaId]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/marcas/${marcaId}/files`);
      if (response.ok) {
        setFiles(await response.json());
      } else {
        console.error('Failed to fetch files');
        toast.error('Error al cargar los archivos.');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Error al cargar los archivos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (only PDFs)
      if (file.type !== 'application/pdf') {
        toast.error('Solo se permiten archivos PDF.');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('El tamaño del archivo no puede superar los 2MB.');
        return;
      }

      setUploadState({
        file,
        isUploading: false,
        progress: 0
      });
    }
  };

  const uploadFile = async (file: File, isUpdate = false, fileId?: string) => {
    try {
      setUploadState(prev => ({ ...prev, isUploading: true, progress: 0 }));

      // Get pre-signed URL
      const urlResponse = await fetch('/api/s3/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          marcaId: marcaId,
        }),
      });

      if (!urlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, s3Key, s3Url } = await urlResponse.json();

      // Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      setUploadState(prev => ({ ...prev, progress: 50 }));

      // Save file metadata to database
      const metadata = {
        filename: s3Key,
        original_name: file.name,
        size: file.size,
        s3_url: s3Url,
        s3_key: s3Key,
      };

      const apiUrl = isUpdate 
        ? `/api/marcas/${marcaId}/files/${fileId}`
        : `/api/marcas/${marcaId}/files`;
      
      const method = isUpdate ? 'PUT' : 'POST';

      const saveResponse = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save file metadata');
      }

      setUploadState(prev => ({ ...prev, progress: 100 }));
      
      toast.success(isUpdate ? 'Archivo actualizado con éxito.' : 'Archivo subido con éxito.');
      
      // Reset state and refresh files
      setUploadState({
        file: null,
        isUploading: false,
        progress: 0
      });
      setEditingFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      await fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error instanceof Error ? error.message : 'Error al subir el archivo.');
    } finally {
      setUploadState(prev => ({ ...prev, isUploading: false }));
    }
  };

  const handleUpload = () => {
    if (uploadState.file) {
      uploadFile(uploadState.file);
    }
  };

  const handleUpdate = () => {
    if (uploadState.file && editingFile) {
      uploadFile(uploadState.file, true, editingFile.id);
    }
  };

  const handleDelete = async (file: MarcaFile) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este archivo?')) {
      return;
    }

    try {
      const response = await fetch(`/api/marcas/${marcaId}/files/${file.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Archivo eliminado con éxito.');
        await fetchFiles();
      } else {
        toast.error('Error al eliminar el archivo.');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Error al eliminar el archivo.');
    }
  };

  const handleDownload = (file: MarcaFile) => {
    if (file.s3_url) {
      window.open(file.s3_url, '_blank');
    } else {
      toast.error('URL del archivo no disponible.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 bg-white rounded-lg shadow-xl w-[90vw] max-w-4xl relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          aria-label="Cerrar"
        >
          <FaTimes size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Administrar Archivos</h2>

        {/* File Upload Section */}
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center space-x-4">
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".pdf"
              ref={fileInputRef}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {uploadState.file && (
              <button
                onClick={editingFile ? handleUpdate : handleUpload}
                disabled={uploadState.isUploading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <FaUpload className="h-4 w-4" />
                <span>{uploadState.isUploading ? 'Subiendo...' : (editingFile ? 'Actualizar' : 'Subir')}</span>
              </button>
            )}
          </div>
          
          {uploadState.isUploading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadState.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Progreso: {uploadState.progress}%</p>
            </div>
          )}

          {uploadState.file && (
            <div className="mt-4 p-3 bg-white border rounded-md">
              <p className="text-sm text-gray-700">
                <strong>Archivo seleccionado:</strong> {uploadState.file.name} ({formatFileSize(uploadState.file.size)})
              </p>
            </div>
          )}
        </div>

        {/* Files List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Archivos Existentes</h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando archivos...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaUpload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay archivos subidos aún.</p>
              <p className="text-sm">Sube tu primer archivo PDF usando el formulario de arriba.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {files.map((file) => (
                <li key={file.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{file.original_name}</p>
                    <p className="text-sm text-gray-500">
                      Tamaño: {formatFileSize(file.size)} | Subido: {formatDate(file.uploaded_at)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownload(file)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50"
                      title="Descargar archivo"
                    >
                      <FaDownload className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingFile(file);
                        setUploadState(prev => ({ ...prev, file: null }));
                        if (fileInputRef.current) {
                          fileInputRef.current.click();
                        }
                      }}
                      className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-50"
                      title="Reemplazar archivo"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
                      title="Eliminar archivo"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}

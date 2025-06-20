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
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El tamaño del archivo no puede superar los 10MB.');
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

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      toast.success('Archivo eliminado con éxito.');
      await fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Error al eliminar el archivo.');
    }
  };

  const handleDownload = (file: MarcaFile) => {
    // For now, we'll use the S3 URL directly
    // In a production app, you might want to generate a pre-signed download URL
    if (file.s3_url) {
      window.open(file.s3_url, '_blank');
    } else {
      toast.error('URL de descarga no disponible.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 bg-white rounded-lg shadow-xl w-[90vw] max-w-4xl relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          aria-label="Close"
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
              ref={fileInputRef}
              className="hidden"
              accept="application/pdf"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
              disabled={uploadState.isUploading}
            >
              Seleccionar PDF
            </button>
            {uploadState.file && (
              <span className="text-gray-600">{uploadState.file.name}</span>
            )}
            {(uploadState.file && !editingFile) && (
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
                disabled={uploadState.isUploading}
              >
                {uploadState.isUploading ? 'Subiendo...' : 'Subir'}
              </button>
            )}
            {(uploadState.file && editingFile) && (
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:bg-gray-400"
                disabled={uploadState.isUploading}
              >
                {uploadState.isUploading ? 'Actualizando...' : `Actualizar para ${editingFile.original_name}`}
              </button>
            )}
          </div>
          {uploadState.isUploading && (
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadState.progress}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Files List Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">Archivos Subidos</h3>
          {isLoading ? (
            <p>Cargando archivos...</p>
          ) : files.length === 0 ? (
            <p className="text-gray-500">No hay archivos subidos todavía.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {files.map((file) => (
                <li key={file.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{file.original_name}</p>
                    <p className="text-sm text-gray-500">
                      Tamaño: {formatFileSize(file.size)} | Subido: {formatDate(file.uploaded_at)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a href={file.s3_url} download target="_blank" rel="noopener noreferrer" className="p-2 text-blue-500 hover:text-blue-700" title="Descargar">
                      <FaDownload size={18} />
                    </a>
                    <button onClick={() => {
                      setEditingFile(file);
                      fileInputRef.current?.click();
                    }} className="p-2 text-yellow-500 hover:text-yellow-700" title="Reemplazar">
                      <FaEdit size={18} />
                    </button>
                    <button onClick={() => handleDelete(file)} className="p-2 text-red-500 hover:text-red-700" title="Eliminar">
                      <FaTrash size={18} />
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
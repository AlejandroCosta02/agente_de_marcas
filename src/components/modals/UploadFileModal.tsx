<<<<<<< HEAD
'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { MarcaFile } from '@/types/marca';
import { FaUpload, FaTrash, FaEdit, FaDownload, FaTimes } from 'react-icons/fa';
import Modal from '@/components/ui/Modal';
=======
import React, { useEffect, useRef, useState } from 'react';
import Modal from '../ui/Modal';
import { toast } from 'sonner';
import { upload } from '@vercel/blob/client';

interface MarcaFile {
  id: number;
  filename: string;
  original_name: string;
  size: number;
  uploaded_at: string;
}
>>>>>>> origin/feature-uploadfile

interface UploadFileModalProps {
  marcaId: string;
  isOpen: boolean;
  onClose: () => void;
}

<<<<<<< HEAD
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
=======
const UploadFileModal: React.FC<UploadFileModalProps> = ({ marcaId, isOpen, onClose }) => {
  const [files, setFiles] = useState<MarcaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch files for this marca
  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/marcas/${marcaId}/files`);
      const data = await res.json();
      setFiles(data.files || []);
    } catch {
      toast.error('Error al cargar archivos');
    } finally {
      setLoading(false);
    }
  };

  // Only fetch files when modal opens or marcaId changes
  useEffect(() => {
    if (isOpen) fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, marcaId]);

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadSuccess(false);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Solo se permiten archivos PDF.');
      return;
    }
    if (selectedFile.size > 2 * 1024 * 1024) {
      toast.error('El archivo no puede superar los 2MB.');
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);
    try {
      // Upload file using Vercel Blob Client SDK
      const result = await upload(selectedFile.name, selectedFile, {
        access: 'public',
        handleUploadUrl: 'https://api.vercel.com/v2/blob/upload',
      });
      const blobUrl = result.url;
      // Save metadata to /api/marcas/[marcaId]/files
      const metaRes = await fetch(`/api/marcas/${marcaId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: blobUrl,
          original_name: selectedFile.name,
          size: selectedFile.size,
        }),
      });
      if (!metaRes.ok) {
        let errorMsg = 'Error al guardar metadatos del archivo';
        try {
          const errorData = await metaRes.json();
          errorMsg = errorData.error || JSON.stringify(errorData);
        } catch {
          errorMsg = metaRes.statusText || errorMsg;
        }
        throw new Error(errorMsg);
      }
      setUploading(false);
      setUploadProgress(null);
      setUploadSuccess(true);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Archivo subido exitosamente');
      fetchFiles();
      setTimeout(() => setUploadSuccess(false), 1200);
    } catch (err) {
      setUploading(false);
      setUploadProgress(null);
      toast.error(err instanceof Error ? err.message : String(err));
    }
  };

  // Handle file delete
  const handleDelete = async (fileId: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este archivo?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/marcas/${marcaId}/files/${fileId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        let errorMsg = 'Error al eliminar archivo';
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || JSON.stringify(errorData);
        } catch {
          errorMsg = res.statusText || errorMsg;
        }
        toast.error(errorMsg);
      } else {
        toast.success('Archivo eliminado');
        fetchFiles();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 min-w-[350px] max-w-[600px]">
        <h2 className="text-lg font-bold mb-4">Archivos de la marca</h2>
        <div className="mb-4 flex flex-col items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            disabled={uploading}
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
          />
          <p className="text-xs text-gray-400 mt-1">Solo PDF, máx 2MB.</p>
          {selectedFile && (
            <div className="mt-2 w-full flex flex-col items-center">
              <span className="text-xs text-gray-700 mb-2">{selectedFile.name}</span>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {uploading ? 'Subiendo...' : 'Subir'}
              </button>
              {uploading && uploadProgress !== null && (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          )}
          {uploadSuccess && (
            <div className="flex items-center gap-2 mt-2 text-green-600 font-semibold animate-fade-in">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              ¡Subido!
            </div>
          )}
        </div>
        {loading ? (
          <div className="text-center py-6">Cargando archivos...</div>
        ) : files.length === 0 ? (
          <div className="text-center text-gray-400 py-6">No hay archivos subidos.</div>
        ) : (
          <ul className="divide-y divide-gray-200 mb-4">
            {files.map((file) => (
              <li key={file.id} className="flex items-center justify-between py-2">
                <div>
                  <span className="font-medium text-gray-800">{file.original_name}</span>
                  <span className="ml-2 text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                  <span className="ml-2 text-xs text-gray-400">{new Date(file.uploaded_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={file.filename}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-900 text-sm underline"
                    title="Ver/Descargar"
                  >
                    Ver
                  </a>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                    title="Eliminar archivo"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={onClose}
          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 w-full"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
};

export default UploadFileModal; 
>>>>>>> origin/feature-uploadfile

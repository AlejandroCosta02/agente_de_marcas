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

interface UploadFileModalProps {
  marcaId: string;
  isOpen: boolean;
  onClose: () => void;
}

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
import React, { useEffect, useRef, useState } from 'react';
import Modal from '../ui/Modal';
import { toast } from 'sonner';

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
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch files for this marca
  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/marcas/${marcaId}/files`);
      const data = await res.json();
      setFiles(data.files || []);
    } catch {
      setError('Error al cargar archivos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchFiles();
    // eslint-disable-next-line
  }, [isOpen, marcaId]);

  // Handle file upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Solo se permiten archivos PDF.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('El archivo no puede superar los 2MB.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/marcas/${marcaId}/files`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Error al subir archivo');
      } else {
        toast.success('Archivo subido exitosamente');
        fetchFiles();
      }
    } catch {
      toast.error('Error al subir archivo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
        toast.error('Error al eliminar archivo');
      } else {
        toast.success('Archivo eliminado');
        fetchFiles();
      }
    } catch {
      toast.error('Error al eliminar archivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 min-w-[350px] max-w-[400px]">
        <h2 className="text-lg font-bold mb-4">Archivos de la marca</h2>
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            disabled={uploading}
            onChange={handleUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
          />
          <p className="text-xs text-gray-400 mt-1">Solo PDF, máx 2MB.</p>
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
                    href={`/uploads/${file.filename}`}
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
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
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
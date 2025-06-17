import { useState, useRef, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, DocumentIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  marcaId: string;
  onUploadComplete: () => void;
}

export default function UploadFileModal({ isOpen, onClose, marcaId, onUploadComplete }: UploadFileModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError('File size exceeds 2MB limit');
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
        setError(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError('File size exceeds 2MB limit');
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
        setError(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setError(null);

      // Upload file directly to Vercel Blob REST API
      const formData = new FormData();
      formData.append('file', selectedFile);

      const blobRes = await fetch('https://blob.vercel-storage.com/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN}`,
        },
        body: formData,
      });

      let blobUrl;
      if (!blobRes.ok) {
        let errorMsg = 'Failed to upload to Vercel Blob';
        try {
          const errorData = await blobRes.json();
          errorMsg = errorData.error || JSON.stringify(errorData);
        } catch {
          errorMsg = blobRes.statusText || errorMsg;
        }
        throw new Error(errorMsg);
      } else {
        const blobData = await blobRes.json();
        blobUrl = blobData.url;
      }

      // Save the file metadata
      const saveResponse = await fetch(`/api/marcas/${marcaId}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: selectedFile.name,
          url: blobUrl,
          size: selectedFile.size,
          type: selectedFile.type,
        }),
      });

      if (!saveResponse.ok) {
        let errorMsg = 'Failed to save file metadata';
        try {
          const errorData = await saveResponse.json();
          errorMsg = errorData.error || JSON.stringify(errorData);
        } catch {
          errorMsg = saveResponse.statusText || errorMsg;
        }
        throw new Error(errorMsg);
      }

      toast.success('File uploaded successfully');
      onUploadComplete();
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-medium">Upload File</Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-500"
            >
              Choose a file
            </button>
            <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
            <p className="text-xs text-gray-400 mt-1">Max file size: 2MB</p>
          </div>

          {selectedFile && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center">
                <DocumentIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm">{selectedFile.name}</span>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-red-500 hover:text-red-600"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 
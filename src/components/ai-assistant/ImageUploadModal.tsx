/**
 * ImageUploadModal Component
 * Modal for uploading and processing UML diagram images
 */

import React, { useState, useCallback } from 'react';
import { X, Upload, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageProcessed: (base64Image: string) => void;
  isProcessing?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onImageProcessed,
  isProcessing = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(null);
      setIsDragging(false);
    }
  }, [isOpen]);

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Formato no soportado. Usa PNG o JPG.';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'La imagen es muy grande. Máximo 5MB.';
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle process button click
  const handleProcess = () => {
    if (previewUrl) {
      onImageProcessed(previewUrl);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Extraer diagrama desde imagen</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isProcessing}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedFile ? (
            /* Upload Zone */
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    Arrastra y suelta tu imagen aquí
                  </p>
                  <p className="text-sm text-gray-500">o</p>
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-white"
                    onClick={(e) => {
                      e.preventDefault();
                      e.currentTarget.previousElementSibling?.dispatchEvent(
                        new MouseEvent('click', { bubbles: true })
                      );
                    }}
                  >
                    Seleccionar archivo
                  </Button>
                </label>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Formatos soportados: PNG, JPG, JPEG</p>
                  <p>Tamaño máximo: 5MB</p>
                </div>
              </div>
            </div>
          ) : (
            /* Preview Zone */
            <div className="space-y-4">
              {previewUrl && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-auto max-h-96 object-contain bg-gray-50"
                  />
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {selectedFile.name}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                disabled={isProcessing}
                className="w-full"
              >
                Cambiar imagen
              </Button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          )}

          {/* Processing Message */}
          {isProcessing && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  Analizando imagen con IA...
                </span>
              </div>
              <Progress value={50} className="h-2" />
              <p className="text-xs text-gray-500 text-center">
                Esto puede tardar unos segundos. Por favor espera.
              </p>
            </div>
          )}

          {/* Info Box */}
          {!isProcessing && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Consejo:</strong> Para mejores resultados, asegúrate de que el
                diagrama sea claro y legible. El sistema extraerá clases, atributos, métodos
                y relaciones automáticamente.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleProcess}
            disabled={!selectedFile || isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Procesando...
              </>
            ) : (
              'Procesar imagen'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;

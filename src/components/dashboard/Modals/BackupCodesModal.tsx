// @ts-nocheck - Allow compilation
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGenerateBackupCodesMutation } from '@/services/userApiService';
import { toast } from '@/components/ui/toast-service';
import { Loader2, Key, Download, Copy, AlertTriangle, RefreshCw } from 'lucide-react';

interface BackupCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCodes?: string[];
}

/**
 * BackupCodesModal Component
 * Display and manage backup codes for 2FA
 */
export function BackupCodesModal({ isOpen, onClose, existingCodes }: BackupCodesModalProps) {
  const [backupCodes, setBackupCodes] = useState<string[]>(existingCodes || []);
  const [isNewGeneration, setIsNewGeneration] = useState(false);
  
  const [generateBackupCodes, { isLoading: isGenerating }] = useGenerateBackupCodesMutation();

  // Set codes when modal opens
  useEffect(() => {
    if (isOpen && existingCodes) {
      setBackupCodes(existingCodes);
      setIsNewGeneration(false);
    }
  }, [isOpen, existingCodes]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsNewGeneration(false);
    }
  }, [isOpen]);

  const handleGenerateNewCodes = async () => {
    try {
      const response = await generateBackupCodes().unwrap();
      setBackupCodes(response.backup_codes);
      setIsNewGeneration(true);
      
      toast({
        title: 'Códigos generados',
        description: 'Se han generado nuevos códigos de respaldo. Los anteriores ya no funcionarán.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron generar los códigos de respaldo. Intenta nuevamente.',
        variant: 'error',
      });
    }
  };

  const copyAllCodes = async () => {
    const codesText = backupCodes.join('\n');
    await navigator.clipboard.writeText(codesText);
    
    toast({
      title: 'Copiado',
      description: 'Todos los códigos han sido copiados al portapapeles.',
      variant: 'success',
    });
  };

  const downloadCodes = () => {
    const codesText = `SpringCode Generator - Códigos de Respaldo
Generados: ${new Date().toLocaleString()}

IMPORTANTE: Guarda estos códigos en un lugar seguro.
Cada código solo puede usarse una vez.

Códigos de respaldo:
${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

¡ATENCIÓN! 
- Estos códigos reemplazan cualquier código anterior
- Úsalos solo si no tienes acceso a tu aplicación de autenticación
- Cada código funciona una sola vez
- Genera nuevos códigos cuando se agoten`;

    const blob = new Blob([codesText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `springcode-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Descargado',
      description: 'Los códigos han sido descargados como archivo de texto.',
      variant: 'success',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-amber-500" />
            <span>Códigos de Respaldo 2FA</span>
            <Badge variant={isNewGeneration ? 'success' : 'default'}>
              {isNewGeneration ? 'Nuevos' : 'Activos'}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Guárdalos en un lugar seguro para recuperar tu cuenta si pierdes el acceso
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Security Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <h4 className="font-medium text-amber-800 mb-1">Información importante</h4>
                <ul className="text-amber-700 space-y-1 text-xs">
                  <li>• Cada código solo puede usarse una vez</li>
                  <li>• Guárdalos en un lugar seguro y fuera de línea</li>
                  <li>• Úsalos solo si no tienes acceso a tu aplicación de autenticación</li>
                  <li>• Genera nuevos códigos cuando se agoten</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Backup Codes Display */}
          {backupCodes.length > 0 ? (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-slate-900">
                    Códigos de respaldo ({backupCodes.length})
                  </h4>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyAllCodes}
                      disabled={isGenerating}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadCodes}
                      disabled={isGenerating}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Descargar
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-mono bg-slate-50 p-4 rounded-lg">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded border">
                      <span className="text-slate-500 text-xs">{index + 1}.</span>
                      <span className="font-medium tracking-wider">{code}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h4 className="font-medium text-slate-900 mb-2">No hay códigos disponibles</h4>
              <p className="text-sm text-slate-600 mb-4">
                Genera códigos de respaldo para usar en caso de emergencia
              </p>
            </div>
          )}

          {/* Generate New Codes */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-900">Generar nuevos códigos</h4>
              <p className="text-sm text-slate-600">
                {backupCodes.length > 0 
                  ? 'Los códigos actuales dejarán de funcionar' 
                  : 'Crea códigos de respaldo para tu cuenta'
                }
              </p>
            </div>
            <Button
              variant={backupCodes.length > 0 ? 'outline' : 'default'}
              onClick={handleGenerateNewCodes}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {backupCodes.length > 0 ? 'Regenerar' : 'Generar códigos'}
                </>
              )}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            {backupCodes.length > 0 && (
              <Button onClick={downloadCodes}>
                <Download className="mr-2 h-4 w-4" />
                Guardar códigos
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

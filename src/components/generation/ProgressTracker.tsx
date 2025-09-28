// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Play, 
  Pause,
  Clock,
  Code,
  FileText,
  Database,
  Server,
  Settings
} from 'lucide-react';
import { useGetRequestQuery, useGetProgressQuery, useStartGenerationMutation, useCancelGenerationMutation } from '@/store/api/generationApi';

interface ProgressTrackerProps {
  requestId: string;
}

export function ProgressTracker({ requestId }: ProgressTrackerProps) {
  const { data: request, isLoading: requestLoading } = useGetRequestQuery(requestId);
  const { data: progress, isLoading: progressLoading } = useGetProgressQuery(requestId, {
    pollingInterval: request?.status === 'IN_PROGRESS' ? 2000 : 0,
    skip: !requestId
  });
  
  const [startGeneration] = useStartGenerationMutation();
  const [cancelGeneration] = useCancelGenerationMutation();
  const [isStarting, setIsStarting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await startGeneration(requestId).unwrap();
    } catch (error) {
      console.error('Error starting generation:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelGeneration(requestId).unwrap();
    } catch (error) {
      console.error('Error cancelling generation:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'IN_PROGRESS':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'FAILED':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const generationSteps = [
    { id: 'validation', name: 'Validación del diagrama', icon: <Settings className="h-4 w-4" /> },
    { id: 'entities', name: 'Generación de entidades', icon: <Database className="h-4 w-4" /> },
    { id: 'repositories', name: 'Creación de repositorios', icon: <Server className="h-4 w-4" /> },
    { id: 'services', name: 'Implementación de servicios', icon: <Code className="h-4 w-4" /> },
    { id: 'controllers', name: 'Controladores REST', icon: <FileText className="h-4 w-4" /> },
    { id: 'configuration', name: 'Archivos de configuración', icon: <Settings className="h-4 w-4" /> }
  ];

  if (requestLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              Solicitud no encontrada
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              No se pudo cargar la información de la solicitud.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(request.status)}
              <div>
                <CardTitle className="text-lg">
                  {request.generationConfig?.projectName || 'Proyecto sin nombre'}
                </CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {request.generationConfig?.artifactId} • {request.generationType}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(request.status)}>
              {request.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {request.status === 'IN_PROGRESS' && progress && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Progreso General
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {progress.progress}%
                </span>
              </div>
              <Progress value={progress.progress} className="h-2" />
              
              {progress.currentStep && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Paso actual: {progress.currentStep}</span>
                  {progress.estimatedTimeRemaining && (
                    <span className="text-slate-400">
                      • ~{formatDuration(progress.estimatedTimeRemaining)} restantes
                    </span>
                  )}
                </div>
              )}

              {progress.currentFile && (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Procesando: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                    {progress.currentFile}
                  </code>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Archivos generados:</span>
                  <div className="font-medium">{progress.generatedFiles} / {progress.totalFiles}</div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Tiempo transcurrido:</span>
                  <div className="font-medium">{formatDuration(progress.elapsedTime)}</div>
                </div>
              </div>
            </div>
          )}

          {request.status === 'COMPLETED' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Generación completada exitosamente</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Tiempo total:</span>
                  <div className="font-medium">
                    {request.endTime && request.startTime && 
                      formatDuration((new Date(request.endTime).getTime() - new Date(request.startTime).getTime()) / 1000)
                    }
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Archivos generados:</span>
                  <div className="font-medium">{request.generatedFiles}</div>
                </div>
              </div>

              {request.generatedProject && (
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Proyecto
                </Button>
              )}
            </div>
          )}

          {request.status === 'FAILED' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Error en la generación</span>
              </div>

              {request.errorMessage && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {request.errorMessage}
                  </p>
                </div>
              )}

              <Button variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar Generación
              </Button>
            </div>
          )}

          {request.status === 'PENDING' && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                  Listo para generar
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  El proyecto está configurado y listo para iniciar la generación de código.
                </p>
                
                <Button onClick={handleStart} disabled={isStarting} size="lg">
                  {isStarting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Generación
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {request.status === 'IN_PROGRESS' && (
              <Button 
                variant="destructive" 
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Cancelar
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {progress && (progress.errors?.length > 0 || progress.warnings?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mensajes del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {progress.errors?.map((error, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error en {error.step}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-300 mt-1">
                    {error.error}
                  </div>
                </div>
              </div>
            ))}

            {progress.warnings?.map((warning, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Advertencia en {warning.step}
                  </div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                    {warning.warning}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pasos de Generación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {generationSteps.map((step, index) => {
              const isCompleted = progress?.completedSteps?.includes(step.name);
              const isCurrent = progress?.currentStep === step.name;
              
              return (
                <div key={step.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isCompleted 
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                    : isCurrent
                    ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                    : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                }`}>
                  <div className={`p-2 rounded-lg ${
                    isCompleted 
                      ? 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-200' 
                      : isCurrent
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : 
                     isCurrent ? <RefreshCw className="h-4 w-4 animate-spin" /> : 
                     step.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${
                      isCompleted || isCurrent 
                        ? 'text-slate-900 dark:text-slate-100' 
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {step.name}
                    </div>
                  </div>

                  {isCompleted && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Completado
                    </Badge>
                  )}
                  {isCurrent && (
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      En progreso
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

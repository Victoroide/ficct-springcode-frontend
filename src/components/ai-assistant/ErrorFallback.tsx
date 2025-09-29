/**
 * AI Assistant Error Fallback Component
 * Provides graceful error handling and offline help content
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  WifiOff,
  RefreshCw,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  Clock,
  CheckCircle
} from 'lucide-react';
import type { AIAssistantErrorDetails } from '@/types/aiAssistant';

interface ErrorFallbackProps {
  error: AIAssistantErrorDetails;
  onRetry: () => void;
  onDismiss: () => void;
  isRetrying?: boolean;
}

interface OfflineHelpItem {
  id: string;
  category: 'getting_started' | 'diagram_design' | 'best_practices' | 'troubleshooting';
  question: string;
  answer: string;
  tags: string[];
}

const OFFLINE_HELP_CONTENT: OfflineHelpItem[] = [
  {
    id: 'start-diagram',
    category: 'getting_started',
    question: '¿Cómo empiezo a crear un diagrama UML?',
    answer: 'Para crear tu primer diagrama UML: 1) Haz clic en el botón "Clase" en la barra de herramientas. 2) Haz clic en el canvas donde quieras colocar la clase. 3) Haz doble clic en la clase para editarla y añadir atributos y métodos.',
    tags: ['primeros pasos', 'clase', 'crear']
  },
  {
    id: 'add-relationships',
    category: 'diagram_design',
    question: '¿Cómo añado relaciones entre clases?',
    answer: 'Para crear relaciones: 1) Selecciona la herramienta de selección. 2) Arrastra desde el borde de una clase hasta otra clase. 3) Haz clic derecho en la flecha para cambiar el tipo de relación (asociación, herencia, composición, etc.).',
    tags: ['relaciones', 'conexiones', 'asociación']
  },
  {
    id: 'edit-class',
    category: 'diagram_design',
    question: '¿Cómo edito una clase y añado atributos?',
    answer: 'Para editar una clase: 1) Haz doble clic en la clase que quieres editar. 2) En el modal que se abre, puedes cambiar el nombre de la clase. 3) Añade atributos especificando: nombre, tipo de datos y visibilidad (public, private, protected). 4) Añade métodos de la misma manera.',
    tags: ['editar', 'atributos', 'métodos', 'propiedades']
  },
  {
    id: 'generate-code',
    category: 'best_practices',
    question: '¿Cómo genero código SpringBoot desde mi diagrama?',
    answer: 'Para generar código: 1) Asegúrate de que tienes al menos una clase con atributos. 2) Haz clic en el botón "Generar Código" que aparece cuando hay contenido en tu diagrama. 3) Selecciona las opciones de generación y descarga el proyecto SpringBoot completo.',
    tags: ['generar código', 'springboot', 'exportar']
  },
  {
    id: 'diagram-validation',
    category: 'best_practices',
    question: '¿Qué hace un buen diagrama UML?',
    answer: 'Un buen diagrama UML debe: 1) Tener nombres descriptivos para clases y atributos. 2) Usar los tipos de datos correctos (String, Integer, Date, etc.). 3) Definir relaciones apropiadas entre clases. 4) Incluir visibilidad de atributos (+public, -private, #protected). 5) Ser limpio y fácil de leer.',
    tags: ['mejores prácticas', 'validación', 'calidad']
  },
  {
    id: 'common-errors',
    category: 'troubleshooting',
    question: '¿Por qué no puedo generar código de mi diagrama?',
    answer: 'Posibles causas: 1) Tu diagrama está vacío - añade al menos una clase. 2) Las clases no tienen atributos - añade propiedades a tus clases. 3) Los nombres contienen caracteres especiales - usa solo letras, números y guiones bajos. 4) Verifica que las relaciones están bien definidas.',
    tags: ['problemas', 'errores', 'generación código']
  }
];

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
  onDismiss,
  isRetrying = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [nextRetryTime, setNextRetryTime] = useState<number | null>(null);

  // Auto-retry countdown
  useEffect(() => {
    if (error.retryAfter && error.retryable && retryCount < 3) {
      const retryTime = Date.now() + (error.retryAfter * 1000);
      setNextRetryTime(retryTime);

      const interval = setInterval(() => {
        const remaining = Math.max(0, retryTime - Date.now());
        
        if (remaining === 0) {
          clearInterval(interval);
          setNextRetryTime(null);
          handleRetry();
        } else {
          setNextRetryTime(retryTime);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [error.retryAfter, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    onRetry();
  };

  const getErrorIcon = () => {
    switch (error.type) {
      case 'network_error':
        return <WifiOff className="w-5 h-5 text-red-600" />;
      case 'rate_limit_exceeded':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'service_unavailable':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  const getErrorColor = () => {
    switch (error.type) {
      case 'rate_limit_exceeded':
        return 'border-yellow-200 bg-yellow-50';
      case 'service_unavailable':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-red-200 bg-red-50';
    }
  };

  const formatRetryTime = () => {
    if (!nextRetryTime) return '';
    const seconds = Math.ceil((nextRetryTime - Date.now()) / 1000);
    return `Reintentando en ${seconds}s...`;
  };

  const categories = [
    { id: 'getting_started', label: 'Primeros pasos', icon: HelpCircle },
    { id: 'diagram_design', label: 'Diseño de diagramas', icon: BookOpen },
    { id: 'best_practices', label: 'Mejores prácticas', icon: CheckCircle },
    { id: 'troubleshooting', label: 'Solución de problemas', icon: AlertTriangle }
  ];

  const filteredHelp = selectedCategory
    ? OFFLINE_HELP_CONTENT.filter(item => item.category === selectedCategory)
    : OFFLINE_HELP_CONTENT.slice(0, 3); // Show top 3 by default

  return (
    <div className="p-4 space-y-4">
      {/* Error Status */}
      <Card className={`border-2 ${getErrorColor()}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            {getErrorIcon()}
            <span>Servicio no disponible</span>
            <Badge variant="outline" className="ml-auto">
              {error.type.replace('_', ' ')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-700 mb-3">
            {error.message}
          </p>

          <div className="flex items-center gap-2">
            {error.retryable && (
              <Button
                size="sm"
                onClick={handleRetry}
                disabled={isRetrying || !!nextRetryTime || retryCount >= 3}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                {nextRetryTime ? formatRetryTime() : 'Reintentar'}
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onDismiss}
            >
              Cerrar
            </Button>
          </div>

          {retryCount >= 3 && (
            <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-600">
              Se ha alcanzado el límite de reintentos. Por favor, verifica tu conexión a internet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Offline Help */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Ayuda sin conexión
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Todos
            </Button>
            {categories.map(category => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-1"
                >
                  <IconComponent className="w-3 h-3" />
                  {category.label}
                </Button>
              );
            })}
          </div>

          <Separator className="mb-4" />

          {/* Help content */}
          <div className="space-y-4">
            {filteredHelp.map((item) => (
              <div key={item.id} className="space-y-2">
                <h4 className="font-medium text-gray-900 text-sm">
                  {item.question}
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {item.answer}
                </p>
                <div className="flex flex-wrap gap-1">
                  {item.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Tip:</strong> Esta ayuda está disponible sin conexión. Una vez que se restablezca la conexión, tendrás acceso a respuestas personalizadas del asistente IA.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorFallback;

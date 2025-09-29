/**
 * Health Status Component
 * Displays AI service health status
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Wifi,
  WifiOff,
  Clock
} from 'lucide-react';
import type { AIHealthStatus } from '@/types/aiAssistant';

interface HealthStatusProps {
  health: AIHealthStatus | null;
  onRefresh?: () => void;
  isLoading?: boolean;
  compact?: boolean;
}

const HealthStatus: React.FC<HealthStatusProps> = ({
  health,
  onRefresh,
  isLoading = false,
  compact = false
}) => {
  if (!health) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
        <WifiOff className="w-3 h-3 text-gray-400" />
        <span className="text-gray-500">Estado desconocido</span>
      </div>
    );
  }

  const getStatusConfig = (status: AIHealthStatus['status']) => {
    switch (status) {
      case 'healthy':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-100',
          label: 'Operativo',
          description: 'Servicio funcionando correctamente'
        };
      case 'degraded':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          label: 'Degradado',
          description: 'Servicio con rendimiento limitado'
        };
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-100',
          label: 'Error',
          description: 'Servicio no disponible'
        };
      default:
        return {
          icon: WifiOff,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          label: 'Desconocido',
          description: 'Estado del servicio desconocido'
        };
    }
  };

  const config = getStatusConfig(health.status);
  const IconComponent = config.icon;

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <IconComponent className={`w-3 h-3 ${config.color}`} />
        <Badge variant="outline" className={`text-xs ${config.color} ${config.bg}`}>
          {config.label}
        </Badge>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-5 w-5 p-0"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Estado del servicio</span>
        </div>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {/* Main Status */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${config.bg}`}>
            <IconComponent className={`w-4 h-4 ${config.color}`} />
          </div>
          <div>
            <p className={`font-medium ${config.color}`}>{config.label}</p>
            <p className="text-xs text-gray-600">{config.description}</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Servicio: {health.service}</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(health.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
          {health.error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              Error: {health.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthStatus;

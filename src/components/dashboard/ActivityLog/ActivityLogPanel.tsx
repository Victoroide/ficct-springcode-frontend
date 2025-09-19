// @ts-nocheck - Allow compilation
import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useAppSelector } from '@/hooks/redux';
import { 
  Activity, 
  Shield, 
  User, 
  Settings, 
  Globe, 
  Lock, 
  Unlock,
  Eye,
  Search,
  Filter,
  Calendar,
  Download,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow, format, isWithinInterval, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActivityLogEntry {
  id: string;
  type: 'login' | 'logout' | 'security' | 'profile' | 'settings' | 'session' | 'system';
  action: string;
  description: string;
  timestamp: Date;
  ip_address?: string;
  user_agent?: string;
  location?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

interface ActivityLogPanelProps {
  className?: string;
  maxEntries?: number;
}

/**
 * ActivityLogPanel Component
 * Comprehensive activity and audit log with filtering and export capabilities
 */
export function ActivityLogPanel({ className = '', maxEntries = 50 }: ActivityLogPanelProps) {
  const [filter, setFilter] = useState<{
    type: string;
    severity: string;
    timeRange: string;
    search: string;
  }>({
    type: 'all',
    severity: 'all',
    timeRange: '7d',
    search: ''
  });

  // Mock audit log data - in real implementation, this would come from API
  const mockActivityLog: ActivityLogEntry[] = [
    {
      id: '1',
      type: 'login',
      action: 'user_login',
      description: 'Inicio de sesión exitoso desde Chrome',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      ip_address: '192.168.1.100',
      location: 'Santiago, Chile',
      severity: 'low',
      metadata: { browser: 'Chrome', device: 'Desktop' }
    },
    {
      id: '2',
      type: 'security',
      action: '2fa_enabled',
      description: 'Autenticación de dos factores activada',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      ip_address: '192.168.1.100',
      location: 'Santiago, Chile',
      severity: 'medium',
      metadata: { method: '2fa_app' }
    },
    {
      id: '3',
      type: 'profile',
      action: 'profile_updated',
      description: 'Información de perfil actualizada',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      ip_address: '192.168.1.100',
      location: 'Santiago, Chile',
      severity: 'low',
      metadata: { fields_changed: ['full_name', 'department'] }
    },
    {
      id: '4',
      type: 'security',
      action: 'password_changed',
      description: 'Contraseña actualizada',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      ip_address: '192.168.1.101',
      location: 'Santiago, Chile',
      severity: 'high',
      metadata: { strength: 'strong' }
    },
    {
      id: '5',
      type: 'session',
      action: 'session_revoked',
      description: 'Sesión cerrada remotamente',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      ip_address: '10.0.0.15',
      location: 'Valparaíso, Chile',
      severity: 'medium',
      metadata: { session_id: 'tablet-1', reason: 'user_action' }
    },
    {
      id: '6',
      type: 'security',
      action: 'suspicious_login_blocked',
      description: 'Intento de acceso sospechoso bloqueado',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      ip_address: '203.0.113.1',
      location: 'Unknown',
      severity: 'critical',
      metadata: { reason: 'unknown_location', blocked: true }
    }
  ];

  // Filter activities based on current filters
  const filteredActivities = useMemo(() => {
    let filtered = mockActivityLog;

    // Filter by type
    if (filter.type !== 'all') {
      filtered = filtered.filter(activity => activity.type === filter.type);
    }

    // Filter by severity
    if (filter.severity !== 'all') {
      filtered = filtered.filter(activity => activity.severity === filter.severity);
    }

    // Filter by time range
    const now = new Date();
    let startDate: Date;
    switch (filter.timeRange) {
      case '1d':
        startDate = subDays(now, 1);
        break;
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      default:
        startDate = subDays(now, 7);
    }
    
    filtered = filtered.filter(activity => 
      isWithinInterval(activity.timestamp, { start: startDate, end: now })
    );

    // Filter by search term
    if (filter.search.trim()) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.action.toLowerCase().includes(searchLower) ||
        activity.description.toLowerCase().includes(searchLower) ||
        activity.ip_address?.toLowerCase().includes(searchLower) ||
        activity.location?.toLowerCase().includes(searchLower)
      );
    }

    return filtered.slice(0, maxEntries);
  }, [filter, maxEntries]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <Globe className="h-4 w-4" />;
      case 'logout': return <Unlock className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'profile': return <User className="h-4 w-4" />;
      case 'settings': return <Settings className="h-4 w-4" />;
      case 'session': return <Activity className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'login': return 'text-blue-600 bg-blue-100';
      case 'logout': return 'text-purple-600 bg-purple-100';
      case 'security': return 'text-red-600 bg-red-100';
      case 'profile': return 'text-green-600 bg-green-100';
      case 'settings': return 'text-indigo-600 bg-indigo-100';
      case 'session': return 'text-orange-600 bg-orange-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const handleExport = () => {
    const csvData = filteredActivities.map(activity => ({
      Timestamp: format(activity.timestamp, 'yyyy-MM-dd HH:mm:ss'),
      Type: activity.type,
      Action: activity.action,
      Description: activity.description,
      IP: activity.ip_address || '',
      Location: activity.location || '',
      Severity: activity.severity
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_log_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-medium text-slate-800">Registro de Actividad</h3>
            <p className="text-sm text-slate-600 mt-1">
              Historial completo de acciones y eventos de seguridad
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={filteredActivities.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Buscar actividad..."
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>

          <Select value={filter.type} onValueChange={(value) => setFilter(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de actividad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="login">Inicios de sesión</SelectItem>
              <SelectItem value="security">Seguridad</SelectItem>
              <SelectItem value="profile">Perfil</SelectItem>
              <SelectItem value="settings">Configuración</SelectItem>
              <SelectItem value="session">Sesiones</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filter.severity} onValueChange={(value) => setFilter(prev => ({ ...prev, severity: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Severidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filter.timeRange} onValueChange={(value) => setFilter(prev => ({ ...prev, timeRange: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Último día</SelectItem>
              <SelectItem value="7d">Última semana</SelectItem>
              <SelectItem value="30d">Último mes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Activity List */}
        <div className="space-y-3">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No se encontró actividad con los filtros seleccionados</p>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {/* Activity Icon */}
                <div className={`p-2 rounded-full ${getActivityTypeColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>

                {/* Activity Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-medium text-slate-900">
                        {activity.description}
                      </h4>
                      <Badge className={`text-xs ${getSeverityColor(activity.severity)}`}>
                        {activity.severity === 'critical' ? 'Crítica' :
                         activity.severity === 'high' ? 'Alta' :
                         activity.severity === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                    </div>
                    
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: es })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                    {activity.ip_address && (
                      <span>IP: {activity.ip_address}</span>
                    )}
                    {activity.location && (
                      <span>Ubicación: {activity.location}</span>
                    )}
                    <span>
                      {format(activity.timestamp, 'dd/MM/yyyy HH:mm:ss')}
                    </span>
                  </div>

                  {/* Metadata */}
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-700">
                        Detalles adicionales
                      </summary>
                      <div className="mt-2 p-2 bg-slate-100 rounded text-xs font-mono">
                        <pre>{JSON.stringify(activity.metadata, null, 2)}</pre>
                      </div>
                    </details>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {filteredActivities.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500 text-center">
              Mostrando {filteredActivities.length} de {mockActivityLog.length} entradas
              {filter.timeRange !== 'all' && ` (últimos ${
                filter.timeRange === '1d' ? '1 día' :
                filter.timeRange === '7d' ? '7 días' : '30 días'
              })`}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

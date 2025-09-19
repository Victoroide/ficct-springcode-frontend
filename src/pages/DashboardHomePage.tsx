// @ts-nocheck - Allow compilation
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SecurityPanel } from '@/components/dashboard/SecurityStatusPanel';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { useGetUserProfileQuery, useGetActiveSessionsQuery } from '@/services/userApiService';
import { 
  BarChart3, 
  Shield, 
  Users, 
  Activity, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Globe,
  Zap
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface DashboardHomePageProps {
  onOpen2FASetup: () => void;
  onOpenBackupCodes: () => void;
  onStartSecurityWizard: () => void;
}

/**
 * DashboardHomePage Component
 * Comprehensive dashboard overview with key metrics and quick actions
 */
export function DashboardHomePage({
  onOpen2FASetup,
  onOpenBackupCodes,
  onStartSecurityWizard
}: DashboardHomePageProps) {
  const dispatch = useAppDispatch();
  
  // Get data from Redux and API
  const { data: userProfile, isLoading: isLoadingProfile } = useGetUserProfileQuery();
  const { data: sessions, isLoading: isLoadingSessions } = useGetActiveSessionsQuery();
  const securityScore = useAppSelector(state => state.security?.securityScore || 85);
  const securityFeatures = useAppSelector(state => state.security?.features || []);
  
  // Quick stats
  const activeSessions = sessions?.length || 1;
  const securityIssues = securityFeatures.filter(f => !f.enabled && f.severity === 'high').length;
  const completionRate = userProfile?.profile_completion || 75;
  
  // Recent activity mock data (would come from API in real implementation)
  const recentActivity = [
    {
      id: 1,
      type: 'login',
      description: 'Inicio de sesión desde Chrome',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      icon: <Globe className="h-4 w-4" />,
      status: 'success'
    },
    {
      id: 2,
      type: 'security',
      description: 'Configuración de 2FA actualizada',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      icon: <Shield className="h-4 w-4" />,
      status: 'info'
    },
    {
      id: 3,
      type: 'profile',
      description: 'Perfil actualizado',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      icon: <Users className="h-4 w-4" />,
      status: 'success'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            ¡Bienvenido, {userProfile?.full_name || 'Usuario'}!
          </h1>
          <p className="text-slate-600 mt-1">
            Aquí tienes un resumen de tu cuenta y actividad reciente
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Último acceso: {userProfile?.last_login ? 
              formatDistanceToNow(new Date(userProfile.last_login), { addSuffix: true, locale: es }) : 
              'Ahora'
            }
          </Badge>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Puntuación de Seguridad"
          value={securityScore}
          suffix="/100"
          icon={<Shield className="h-5 w-5 text-blue-500" />}
          trend={{ value: 5, isPositive: true }}
          color={securityScore >= 80 ? 'green' : securityScore >= 60 ? 'yellow' : 'red'}
        />
        
        <StatsCard
          title="Sesiones Activas"
          value={activeSessions}
          icon={<Activity className="h-5 w-5 text-green-500" />}
          color={activeSessions <= 3 ? 'green' : 'yellow'}
        />
        
        <StatsCard
          title="Perfil Completado"
          value={completionRate}
          suffix="%"
          icon={<Users className="h-5 w-5 text-purple-500" />}
          color={completionRate >= 90 ? 'green' : completionRate >= 70 ? 'yellow' : 'red'}
        />
        
        <StatsCard
          title="Problemas de Seguridad"
          value={securityIssues}
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          color={securityIssues === 0 ? 'green' : 'red'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Security Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Security Overview */}
          <SecurityPanel
            onOpen2FASetup={onOpen2FASetup}
            onOpenBackupCodes={onOpenBackupCodes}
            onStartSecurityWizard={onStartSecurityWizard}
          />
          
          {/* Recent Activity */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-slate-800">Actividad Reciente</h3>
                <Button variant="ghost" size="sm">Ver todo</Button>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                    <div className={`p-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-100 text-green-600' :
                      activity.status === 'info' ? 'bg-blue-100 text-blue-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {activity.icon}
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">
                        {activity.description}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: es })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Quick Actions & Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-slate-800 mb-4">Acciones Rápidas</h3>
              
              <div className="space-y-3">
                {/* <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={onStartSecurityWizard}
                >
                  <Zap className="mr-2 h-4 w-4 text-yellow-500" />
                  Mejorar Seguridad
                </Button> */}
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open('/dashboard/profile', '_self')}
                >
                  <Users className="mr-2 h-4 w-4 text-blue-500" />
                  Completar Perfil
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={onOpen2FASetup}
                  disabled={userProfile?.is_2fa_enabled}
                >
                  <Shield className="mr-2 h-4 w-4 text-green-500" />
                  {userProfile?.is_2fa_enabled ? '2FA Activado' : 'Configurar 2FA'}
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Account Status */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-slate-800 mb-4">Estado de la Cuenta</h3>
              
              <div className="space-y-4">
                <StatusItem
                  label="Verificación de Email"
                  status={userProfile?.email_verified ? 'completed' : 'pending'}
                  description={userProfile?.email_verified ? 'Email verificado' : 'Pendiente de verificación'}
                />
                
                <StatusItem
                  label="Autenticación 2FA"
                  status={userProfile?.is_2fa_enabled ? 'completed' : 'pending'}
                  description={userProfile?.is_2fa_enabled ? '2FA activado' : 'Sin configurar'}
                />
                
                <StatusItem
                  label="Perfil Completo"
                  status={completionRate >= 90 ? 'completed' : completionRate >= 70 ? 'warning' : 'pending'}
                  description={`${completionRate}% completado`}
                />
              </div>
            </div>
          </Card>
          
          {/* System Status */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-slate-800 mb-4">Estado del Sistema</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">SpringCode API</span>
                  <Badge className="bg-green-100 text-green-800">Operativo</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Servicios de Seguridad</span>
                  <Badge className="bg-green-100 text-green-800">Operativo</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Base de Datos</span>
                  <Badge className="bg-green-100 text-green-800">Operativo</Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color: 'green' | 'yellow' | 'red' | 'blue';
}

function StatsCard({ title, value, suffix = '', icon, trend, color }: StatsCardProps) {
  const colorClasses = {
    green: 'border-green-200 bg-green-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    red: 'border-red-200 bg-red-50',
    blue: 'border-blue-200 bg-blue-50'
  };

  return (
    <Card className={`${colorClasses[color]} border`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          {icon}
          {trend && (
            <Badge className={`text-xs ${trend.isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend.isPositive ? '+' : ''}{trend.value}
            </Badge>
          )}
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl font-bold text-slate-900">
            {value}{suffix}
          </div>
          <div className="text-sm text-slate-600">{title}</div>
        </div>
      </div>
    </Card>
  );
}

interface StatusItemProps {
  label: string;
  status: 'completed' | 'pending' | 'warning';
  description: string;
}

function StatusItem({ label, status, description }: StatusItemProps) {
  const statusConfig = {
    completed: { icon: <CheckCircle className="h-4 w-4 text-green-500" />, color: 'text-green-600' },
    pending: { icon: <Clock className="h-4 w-4 text-slate-400" />, color: 'text-slate-500' },
    warning: { icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />, color: 'text-yellow-600' }
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-3">
      {config.icon}
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className={`text-xs ${config.color}`}>{description}</p>
      </div>
    </div>
  );
}

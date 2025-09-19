// @ts-nocheck - Allow compilation
import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Shield, BarChart3 } from 'lucide-react';

interface NotificationSettingsProps {
  settings: {
    email_notifications: boolean;
    push_notifications: boolean;
    security_alerts: boolean;
    weekly_reports: boolean;
  };
  onChange: (settings: Partial<NotificationSettingsProps['settings']>) => void;
}

/**
 * NotificationSettings Component
 * Manage notification preferences
 */
export function NotificationSettings({ settings, onChange }: NotificationSettingsProps) {
  const notificationOptions = [
    {
      id: 'email_notifications',
      icon: <Mail className="h-5 w-5 text-blue-500" />,
      title: 'Notificaciones por email',
      description: 'Recibe actualizaciones importantes por correo electrónico',
      value: settings.email_notifications,
      recommended: true,
    },
    {
      id: 'push_notifications',
      icon: <Bell className="h-5 w-5 text-green-500" />,
      title: 'Notificaciones push',
      description: 'Recibe notificaciones en tiempo real en tu navegador',
      value: settings.push_notifications,
      recommended: false,
    },
    {
      id: 'security_alerts',
      icon: <Shield className="h-5 w-5 text-red-500" />,
      title: 'Alertas de seguridad',
      description: 'Notificaciones críticas sobre la seguridad de tu cuenta',
      value: settings.security_alerts,
      recommended: true,
    },
    {
      id: 'weekly_reports',
      icon: <BarChart3 className="h-5 w-5 text-purple-500" />,
      title: 'Reportes semanales',
      description: 'Resumen semanal de actividad y métricas',
      value: settings.weekly_reports,
      recommended: false,
    },
  ];

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">Configuración de Notificaciones</h3>
          <p className="text-sm text-slate-600">
            Controla qué notificaciones quieres recibir y cómo prefieres recibirlas
          </p>
        </div>
        
        <div className="space-y-4">
          {notificationOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-start justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5">
                  {option.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Label 
                      htmlFor={option.id} 
                      className="text-sm font-medium text-slate-800 cursor-pointer"
                    >
                      {option.title}
                    </Label>
                    {option.recommended && (
                      <Badge variant="secondary" className="text-xs">
                        Recomendado
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">
                    {option.description}
                  </p>
                </div>
              </div>
              <Switch
                id={option.id}
                checked={option.value}
                onCheckedChange={(checked) => 
                  onChange({ [option.id]: checked })
                }
                className="ml-4"
              />
            </div>
          ))}
        </div>
        
        {/* Additional Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">
                Importante sobre las alertas de seguridad
              </p>
              <p className="text-sm text-blue-700">
                Las alertas de seguridad son fundamentales para proteger tu cuenta. Te recomendamos mantenerlas activadas 
                para recibir notificaciones inmediatas sobre actividad sospechosa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

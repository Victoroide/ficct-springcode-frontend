// @ts-nocheck - Allow compilation
import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Database, Users, AlertTriangle } from 'lucide-react';

interface PrivacySettingsProps {
  settings: {
    profile_visibility: string;
    activity_tracking: boolean;
    data_sharing: boolean;
  };
  onChange: (settings: Partial<PrivacySettingsProps['settings']>) => void;
}

/**
 * PrivacySettings Component
 * Manage privacy and data sharing preferences
 */
export function PrivacySettings({ settings, onChange }: PrivacySettingsProps) {
  const visibilityOptions = [
    {
      value: 'public',
      label: 'Público',
      description: 'Tu perfil es visible para todos los usuarios',
      icon: <Eye className="h-4 w-4" />,
    },
    {
      value: 'organization',
      label: 'Solo Organización',
      description: 'Visible solo para miembros de tu organización',
      icon: <Users className="h-4 w-4" />,
    },
    {
      value: 'private',
      label: 'Privado',
      description: 'Tu perfil no es visible para otros usuarios',
      icon: <EyeOff className="h-4 w-4" />,
    },
  ];

  const selectedVisibility = visibilityOptions.find(
    option => option.value === settings.profile_visibility
  );

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">Configuración de Privacidad</h3>
          <p className="text-sm text-slate-600">
            Controla cómo se comparte tu información y quién puede ver tu actividad
          </p>
        </div>
        
        {/* Profile Visibility */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">
            Visibilidad del perfil
          </Label>
          <Select
            value={settings.profile_visibility}
            onValueChange={(value) => onChange({ profile_visibility: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona la visibilidad">
                {selectedVisibility && (
                  <div className="flex items-center gap-2">
                    {selectedVisibility.icon}
                    <span>{selectedVisibility.label}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {visibilityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2 py-1">
                    {option.icon}
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-slate-500">{option.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Activity Tracking */}
        <div className="flex items-start justify-between p-4 border border-slate-200 rounded-lg">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-0.5">
              <Database className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Label 
                  htmlFor="activity_tracking" 
                  className="text-sm font-medium text-slate-800 cursor-pointer"
                >
                  Seguimiento de actividad
                </Label>
                <Badge variant="secondary" className="text-xs">
                  Recomendado
                </Badge>
              </div>
              <p className="text-sm text-slate-600">
                Permite que SpringCode analice tu actividad para mejorar tu experiencia 
                y proporcionar recomendaciones personalizadas
              </p>
            </div>
          </div>
          <Switch
            id="activity_tracking"
            checked={settings.activity_tracking}
            onCheckedChange={(checked) => 
              onChange({ activity_tracking: checked })
            }
            className="ml-4"
          />
        </div>
        
        {/* Data Sharing */}
        <div className="flex items-start justify-between p-4 border border-slate-200 rounded-lg">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-0.5">
              <Users className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Label 
                  htmlFor="data_sharing" 
                  className="text-sm font-medium text-slate-800 cursor-pointer"
                >
                  Compartir datos agregados
                </Label>
              </div>
              <p className="text-sm text-slate-600">
                Permite compartir datos agregados y anonimizados para mejorar 
                el producto. No se comparte información personal identificable
              </p>
            </div>
          </div>
          <Switch
            id="data_sharing"
            checked={settings.data_sharing}
            onCheckedChange={(checked) => 
              onChange({ data_sharing: checked })
            }
            className="ml-4"
          />
        </div>
        
        {/* Privacy Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 mb-1">
                Sobre tu privacidad
              </p>
              <p className="text-sm text-amber-700">
                SpringCode se compromete a proteger tu privacidad. Puedes revisar nuestra 
                <a href="/privacy" className="underline ml-1">Política de Privacidad</a> para 
                obtener más información sobre cómo manejamos tus datos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

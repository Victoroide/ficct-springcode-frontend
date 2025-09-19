// @ts-nocheck - Allow compilation
import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface GeneralSettingsProps {
  settings: {
    language: string;
    timezone: string;
    theme: string;
  };
  onChange: (settings: Partial<GeneralSettingsProps['settings']>) => void;
}

/**
 * GeneralSettings Component
 * General application settings and preferences
 */
export function GeneralSettings({ settings, onChange }: GeneralSettingsProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-slate-800 mb-4">Configuración General</h3>
          <p className="text-sm text-slate-600">
            Personaliza tu experiencia en SpringCode Generator
          </p>
        </div>
        
        {/* Language Selection */}
        <div className="space-y-2">
          <Label htmlFor="language" className="text-sm font-medium text-slate-700">
            Idioma de la aplicación
          </Label>
          <Select
            value={settings.language}
            onValueChange={(value) => onChange({ language: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500">
            El idioma se aplicará después de guardar los cambios
          </p>
        </div>
        
        {/* Timezone Selection */}
        <div className="space-y-2">
          <Label htmlFor="timezone" className="text-sm font-medium text-slate-700">
            Zona horaria
          </Label>
          <Select
            value={settings.timezone}
            onValueChange={(value) => onChange({ timezone: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una zona horaria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/Santiago">Santiago (UTC-3)</SelectItem>
              <SelectItem value="America/Mexico_City">Ciudad de México (UTC-6)</SelectItem>
              <SelectItem value="America/New_York">Nueva York (UTC-5)</SelectItem>
              <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
              <SelectItem value="Europe/Madrid">Madrid (UTC+1)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Theme Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">
            Tema de la aplicación
          </Label>
          <RadioGroup
            value={settings.theme}
            onValueChange={(value) => onChange({ theme: value })}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light" className="flex-1 cursor-pointer">
                <div className="font-medium">Claro</div>
                <div className="text-xs text-slate-500">Tema claro para el día</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark" className="flex-1 cursor-pointer">
                <div className="font-medium">Oscuro</div>
                <div className="text-xs text-slate-500">Tema oscuro para la noche</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system" className="flex-1 cursor-pointer">
                <div className="font-medium">Sistema</div>
                <div className="text-xs text-slate-500">Seguir configuración del sistema</div>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </Card>
  );
}

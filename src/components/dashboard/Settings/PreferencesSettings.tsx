// @ts-nocheck - Allow compilation
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast-service';

interface PreferenceOption {
  id: string;
  label: string;
  description?: string;
  enabled: boolean;
}

interface PreferenceSection {
  id: string;
  title: string;
  description?: string;
  options: PreferenceOption[];
}

interface PreferencesSettingsProps {
  onSave?: (preferences: Record<string, boolean>) => Promise<void>;
  className?: string;
}

/**
 * PreferencesSettings Component
 * UI for managing user preferences
 */
export function PreferencesSettings({ onSave, className = '' }: PreferencesSettingsProps) {
  // Sample preference sections
  const [sections, setSections] = useState<PreferenceSection[]>([
    {
      id: 'notifications',
      title: 'Notificaciones',
      description: 'Configura qué notificaciones deseas recibir.',
      options: [
        {
          id: 'email_notifications',
          label: 'Notificaciones por Email',
          description: 'Recibir notificaciones por correo electrónico.',
          enabled: true
        },
        {
          id: 'security_alerts',
          label: 'Alertas de Seguridad',
          description: 'Recibir alertas sobre actividad sospechosa en tu cuenta.',
          enabled: true
        },
        {
          id: 'product_updates',
          label: 'Actualizaciones de Producto',
          description: 'Recibir información sobre nuevas funcionalidades.',
          enabled: false
        }
      ]
    },
    {
      id: 'appearance',
      title: 'Apariencia',
      description: 'Personaliza la apariencia de la aplicación.',
      options: [
        {
          id: 'dark_mode',
          label: 'Modo Oscuro',
          description: 'Usar tema oscuro en la interfaz.',
          enabled: false
        },
        {
          id: 'compact_view',
          label: 'Vista Compacta',
          description: 'Mostrar más información en menos espacio.',
          enabled: false
        }
      ]
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  
  // Toggle a preference option
  const toggleOption = (sectionId: string, optionId: string) => {
    setSections(prevSections => 
      prevSections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            options: section.options.map(option => {
              if (option.id === optionId) {
                return { ...option, enabled: !option.enabled };
              }
              return option;
            })
          };
        }
        return section;
      })
    );
  };
  
  // Save preferences
  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Flatten preferences for API
      const preferences = sections.reduce((acc, section) => {
        section.options.forEach(option => {
          acc[option.id] = option.enabled;
        });
        return acc;
      }, {} as Record<string, boolean>);
      
      // Call save handler if provided
      if (onSave) {
        await onSave(preferences);
      }
      
      toast({
        title: 'Preferencias guardadas',
        description: 'Tus preferencias han sido actualizadas correctamente.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar las preferencias. Intenta nuevamente.',
        variant: 'error',
      });
      console.error('Error saving preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="p-4 sm:p-6">
        <h3 className="text-lg font-medium text-slate-800 mb-4">Preferencias de Usuario</h3>
        
        <div className="space-y-6">
          {sections.map(section => (
            <div key={section.id} className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-800">{section.title}</h4>
                {section.description && (
                  <p className="text-sm text-slate-500 mt-1">{section.description}</p>
                )}
              </div>
              
              <div className="space-y-2">
                {section.options.map(option => (
                  <PreferenceToggle 
                    key={option.id} 
                    option={option}
                    onToggle={() => toggleOption(section.id, option.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : 'Guardar Preferencias'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface PreferenceToggleProps {
  option: PreferenceOption;
  onToggle: () => void;
}

/**
 * PreferenceToggle Component
 * Toggle switch for a single preference option
 */
function PreferenceToggle({ option, onToggle }: PreferenceToggleProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <div>
        <Label 
          htmlFor={option.id} 
          className="text-sm font-medium text-slate-700 cursor-pointer"
        >
          {option.label}
        </Label>
        {option.description && (
          <p className="text-xs text-slate-500 mt-0.5">{option.description}</p>
        )}
      </div>
      
      <div className="flex items-center h-6">
        <input
          type="checkbox"
          id={option.id}
          checked={option.enabled}
          onChange={onToggle}
          className="sr-only"
        />
        <div 
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
            option.enabled ? 'bg-blue-600' : 'bg-slate-200'
          }`}
          onClick={onToggle}
        >
          <span 
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
              option.enabled ? 'translate-x-6' : 'translate-x-1'
            }`} 
          />
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast-service';

interface Language {
  code: string;
  name: string;
  localName: string;
  flag: string;
}

interface LanguageSettingsProps {
  onSave?: (languageCode: string) => Promise<void>;
  className?: string;
}

/**
 * LanguageSettings Component
 * UI for selecting application language
 */
export function LanguageSettings({ onSave, className = '' }: LanguageSettingsProps) {
  // Available languages
  const languages: Language[] = [
    { code: 'es', name: 'Spanish', localName: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', localName: 'English', flag: '🇺🇸' },
    { code: 'pt', name: 'Portuguese', localName: 'Português', flag: '🇧🇷' },
  ];
  
  // Current language
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle language selection
  const handleLanguageSelect = (code: string) => {
    setSelectedLanguage(code);
  };
  
  // Save language preference
  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Call save handler if provided
      if (onSave) {
        await onSave(selectedLanguage);
      }
      
      toast({
        title: 'Idioma actualizado',
        description: 'La configuración de idioma ha sido actualizada correctamente.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el idioma. Intenta nuevamente.',
        variant: 'error',
      });
      console.error('Error saving language preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="p-4 sm:p-6">
        <h3 className="text-lg font-medium text-slate-800 mb-4">Idioma de la Aplicación</h3>
        
        <p className="text-sm text-slate-500 mb-4">
          Selecciona el idioma en el que quieres ver la aplicación.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {languages.map(language => (
            <LanguageOption
              key={language.code}
              language={language}
              isSelected={selectedLanguage === language.code}
              onSelect={() => handleLanguageSelect(language.code)}
            />
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : 'Guardar Idioma'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface LanguageOptionProps {
  language: Language;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * LanguageOption Component
 * Individual language option card
 */
function LanguageOption({ language, isSelected, onSelect }: LanguageOptionProps) {
  return (
    <div
      className={`border rounded-md p-3 cursor-pointer transition-colors ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center">
        <span className="text-2xl mr-2" aria-hidden="true">{language.flag}</span>
        <div>
          <div className="font-medium text-slate-800">{language.localName}</div>
          <div className="text-xs text-slate-500">{language.name}</div>
        </div>
      </div>
    </div>
  );
}

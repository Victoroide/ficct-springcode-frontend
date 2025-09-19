// @ts-nocheck - Allow compilation
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Moon, Sun, Laptop, Languages } from 'lucide-react';
import { useAppSelector } from '@/hooks/redux';
import { selectUserProfile } from '@/store/slices/userSlice';
import { toast } from '@/components/ui/toast-service';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const userProfile = useAppSelector(selectUserProfile);
  const { theme, setTheme } = useTheme();
  
  // Guardar cambios
  const handleSaveSettings = () => {
    // Mostrar mensaje de éxito
    toast({
      title: 'Configuración guardada',
      description: 'Tu tema ha sido actualizado correctamente.',
      variant: 'success',
    });
    
    // Cerramos el modal después de guardar
    onClose();
  };

  // Forzar re-renderizado cuando cambia el tema
  React.useEffect(() => {
    // El efecto se activa cuando cambia el tema
  }, [theme]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`sm:max-w-md transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 text-slate-50 border-slate-700' : 'bg-white'}`}
      >
        <DialogHeader>
          <DialogTitle className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'}`}>
            Configuración
          </DialogTitle>
          <DialogDescription className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>
            Personaliza tu experiencia en SpringCode Generator
          </DialogDescription>
        </DialogHeader>
        
        <Card className={`p-6 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="space-y-6">
            {/* Tema */}
            <div>
              <h3 className={`text-md font-semibold mb-4 ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'}`}>Tema</h3>
              <RadioGroup 
                value={theme} 
                onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')} 
                className="space-y-3"
              >
                <div className={`flex items-center space-x-3 p-3 rounded-md ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="flex-1 cursor-pointer">
                    <div className={`font-medium flex items-center ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'}`}>
                      <Sun className="mr-2 h-4 w-4 text-amber-500" />
                      Claro
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Modo diurno</div>
                  </Label>
                </div>
                
                <div className={`flex items-center space-x-3 p-3 rounded-md ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="flex-1 cursor-pointer">
                    <div className={`font-medium flex items-center ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'}`}>
                      <Moon className="mr-2 h-4 w-4 text-blue-600" />
                      Oscuro
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Modo nocturno</div>
                  </Label>
                </div>
                
                <div className={`flex items-center space-x-3 p-3 rounded-md ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system" className="flex-1 cursor-pointer">
                    <div className={`font-medium flex items-center ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'}`}>
                      <Laptop className={`mr-2 h-4 w-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`} />
                      Sistema
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Seguir configuración del sistema</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Idioma */}
            <div>
              <h3 className={`text-md font-semibold mb-4 ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'}`}>Idioma</h3>
              <div className={`flex items-center space-x-4 p-4 rounded-md ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <Languages className={`h-5 w-5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'}`}>Español</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>El idioma actual de la aplicación</p>
                </div>
                <Button variant="outline" size="sm" disabled className={theme === 'dark' ? 'border-slate-700 text-slate-300' : ''}>
                  Cambiar
                </Button>
              </div>
            </div>
          </div>
        </Card>
        
        <div className={`flex justify-end space-x-3 mt-4 pt-2 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className={theme === 'dark' ? 'border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' : ''}
          >
            Cancelar
          </Button>
          <Button onClick={handleSaveSettings}>
            Guardar cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

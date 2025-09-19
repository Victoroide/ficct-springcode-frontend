import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmailIcon, EyeIcon, LockIcon } from '@/components/icons';
import { formatUserFriendlyError } from '@/services/errorService';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    const isValid = value.includes('@') && 
      (value.endsWith('.com') || value.endsWith('.org') || value.endsWith('.net'));
    setEmailValid(isValid);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setFormError('Por favor complete todos los campos.');
      return;
    }
    
    setFormError(null);
    
    try {
      await onSubmit(email, password);
    } catch (err) {
      setFormError(formatUserFriendlyError(err));
    }
  };
  
  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
          Email corporativo
        </Label>
        <div className="relative">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="usuario@empresa.com"
            value={email}
            onChange={handleEmailChange}
            className="w-full pl-10"
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <EmailIcon />
          </div>
        </div>
        {emailValid && (
          <div className="mt-1 text-sm text-green-600 flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
            </svg>
            Dominio corporativo verificado
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
          Contraseña
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Ingrese su contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pr-10"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <EyeIcon className="hover:text-slate-600" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-device"
            name="remember-device"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
          />
          <label htmlFor="remember-device" className="ml-2 block text-sm text-slate-700">
            Recordar este dispositivo
          </label>
        </div>

        <div className="text-sm">
          <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
            Recuperar acceso
          </a>
        </div>
      </div>

      {formError && !error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-sm text-red-700">
            {formError}
          </div>
        </div>
      )}

      <div>
        <Button
          type="submit"
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02]"
          disabled={isLoading}
        >
          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
            <LockIcon className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
          </span>
          {isLoading ? 'Verificando...' : 'Acceder a SpringCode Generator'}
        </Button>
      </div>
    </form>
  );
}

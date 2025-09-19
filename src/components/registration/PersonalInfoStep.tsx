import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckIcon } from '@/components/icons'

interface PersonalInfoStepProps {
  data: {
    fullName: string
    email: string
    password: string
    passwordConfirm: string
  }
  onUpdate: (data: any) => void
  onNext: () => void
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ data, onUpdate, onNext }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && (email.includes('.com') || email.includes('.org') || email.includes('.net'))
  }

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial
  }

  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value })
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!data.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido'
    } else if (data.fullName.trim().length < 2) {
      newErrors.fullName = 'El nombre debe tener al menos 2 caracteres'
    }
    
    if (!data.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'Ingrese un email corporativo válido'
    }
    
    if (!data.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (!validatePassword(data.password)) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula, número y carácter especial'
    }
    
    if (!data.passwordConfirm) {
      newErrors.passwordConfirm = 'Confirme su contraseña'
    } else if (data.password !== data.passwordConfirm) {
      newErrors.passwordConfirm = 'Las contraseñas no coinciden'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    onNext()
  }

  const isEmailValid = data.email && validateEmail(data.email)
  const isPasswordValid = data.password && validatePassword(data.password)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Información Personal</h2>
        <p className="text-slate-600">Complete sus datos personales para comenzar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <Label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
            Nombre Completo <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            type="text"
            value={data.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder="Ingrese su nombre completo"
            className={errors.fullName ? 'border-red-300 focus:ring-red-500' : ''}
          />
          {errors.fullName && (
            <div className="mt-1 text-sm text-red-600">{errors.fullName}</div>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
            Email Corporativo <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="usuario@empresa.com"
              className={errors.email ? 'border-red-300 focus:ring-red-500 pr-10' : 'pr-10'}
            />
            {isEmailValid && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <CheckIcon className="h-5 w-5 text-green-500" />
              </div>
            )}
          </div>
          {isEmailValid && (
            <div className="mt-1 text-sm text-green-600 flex items-center">
              <CheckIcon className="h-4 w-4 mr-1" />
              Dominio corporativo verificado
            </div>
          )}
          {errors.email && (
            <div className="mt-1 text-sm text-red-600">{errors.email}</div>
          )}
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
            Contraseña <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={data.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Cree una contraseña segura"
              className={errors.password ? 'border-red-300 focus:ring-red-500 pr-10' : 'pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </button>
          </div>
          {isPasswordValid && (
            <div className="mt-1 text-sm text-green-600 flex items-center">
              <CheckIcon className="h-4 w-4 mr-1" />
              Contraseña segura
            </div>
          )}
          {errors.password && (
            <div className="mt-1 text-sm text-red-600">{errors.password}</div>
          )}
        </div>

        {/* Password Confirmation */}
        <div>
          <Label htmlFor="passwordConfirm" className="block text-sm font-medium text-slate-700 mb-2">
            Confirmar Contraseña <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="passwordConfirm"
              type={showPasswordConfirm ? "text" : "password"}
              value={data.passwordConfirm}
              onChange={(e) => handleChange('passwordConfirm', e.target.value)}
              placeholder="Confirme su contraseña"
              className={errors.passwordConfirm ? 'border-red-300 focus:ring-red-500 pr-10' : 'pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </button>
          </div>
          {data.passwordConfirm && data.password === data.passwordConfirm && (
            <div className="mt-1 text-sm text-green-600 flex items-center">
              <CheckIcon className="h-4 w-4 mr-1" />
              Las contraseñas coinciden
            </div>
          )}
          {errors.passwordConfirm && (
            <div className="mt-1 text-sm text-red-600">{errors.passwordConfirm}</div>
          )}
        </div>

        {/* Next Button */}
        <div className="flex justify-end pt-6 border-t border-slate-200">
          <Button 
            type="submit" 
            className="px-8"
          >
            Continuar
            <svg className="h-4 w-4 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </Button>
        </div>
      </form>
    </div>
  )
}

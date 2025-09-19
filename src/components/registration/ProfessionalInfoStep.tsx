import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckIcon } from '@/components/icons'

interface ProfessionalInfoStepProps {
  data: {
    email: string
    company: string
    department: string
    role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'ANALYST' | ''
    teamSize: string
    experience: string
    useCases: string[]
  }
  onUpdate: (data: any) => void
  onNext: () => void
  onPrev: () => void
}

export const ProfessionalInfoStep: React.FC<ProfessionalInfoStepProps> = ({ 
  data, 
  onUpdate, 
  onNext, 
  onPrev 
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: any) => {
    onUpdate({ ...data, [field]: value })
    
    // Auto-detect company from email
    if (field === 'email') {
      const domain = value.split('@')[1]
      if (domain) {
        const companyName = domain.split('.')[0]
        const formattedCompany = companyName.charAt(0).toUpperCase() + companyName.slice(1) + ' Solutions'
        onUpdate({ ...data, [field]: value, company: formattedCompany })
      }
    }
    
    // Clear errors when user makes changes
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleRoleChange = (newRole: string) => {
    handleChange('role', newRole)
  }

  const handleUseCaseToggle = (useCase: string) => {
    const currentUseCases = data.useCases || []
    const newUseCases = currentUseCases.includes(useCase)
      ? currentUseCases.filter(uc => uc !== useCase)
      : [...currentUseCases, useCase]
    handleChange('useCases', newUseCases)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!data.email.trim()) {
      newErrors.email = 'El email corporativo es requerido'
    }
    
    if (!data.company.trim()) {
      newErrors.company = 'La empresa es requerida'
    }
    
    if (!data.role) {
      newErrors.role = 'Seleccione un rol profesional'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    onNext()
  }

  const isEmailValid = data.email && data.email.includes('@')

  const roles = [
    {
      value: 'ANALYST',
      title: 'Arquitecto de Software',
      description: 'Diseño de sistemas y arquitecturas corporativas',
      permissions: 'Acceso completo, gestión de proyectos',
      icon: (
        <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10"/>
        </svg>
      )
    },
    {
      value: 'DEVELOPER',
      title: 'Desarrollador Backend',
      description: 'Implementación de APIs y servicios SpringBoot',
      permissions: 'Generación de código, testing',
      icon: (
        <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"/>
        </svg>
      )
    },
    {
      value: 'MANAGER',
      title: 'Líder Técnico',
      description: 'Coordinación de equipos y revisión técnica',
      permissions: 'Supervisión, aprobaciones',
      icon: (
        <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
      )
    }
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Información Profesional</h2>
        <p className="text-slate-600">Configura tu rol y empresa para personalizar tu experiencia</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Corporate Email with Live Validation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
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
                readOnly
              />
              {isEmailValid && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>
            {isEmailValid && (
              <div className="mt-2 flex items-center text-sm text-green-600">
                <CheckIcon className="h-4 w-4 mr-1" />
                Dominio corporativo <strong>{data.email.split('@')[1]}</strong> verificado
              </div>
            )}
            {errors.email && (
              <div className="mt-1 text-sm text-red-600">{errors.email}</div>
            )}
          </div>
        </div>

        {/* Company Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
              Empresa <span className="text-red-500">*</span>
            </Label>
            <Input
              id="company"
              type="text"
              value={data.company}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder="Nombre de la empresa"
              className={errors.company ? 'border-red-300 focus:ring-red-500' : ''}
            />
            <p className="mt-1 text-xs text-slate-500">Auto-detectado desde el dominio del email</p>
            {errors.company && (
              <div className="mt-1 text-sm text-red-600">{errors.company}</div>
            )}
          </div>
          
          <div>
            <Label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-2">
              Departamento
            </Label>
            <select
              id="department"
              value={data.department}
              onChange={(e) => handleChange('department', e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar departamento</option>
              <option value="development">Desarrollo de Software</option>
              <option value="architecture">Arquitectura de Sistemas</option>
              <option value="devops">DevOps e Infraestructura</option>
              <option value="qa">Calidad y Testing</option>
              <option value="management">Gestión de Proyectos</option>
            </select>
          </div>
        </div>

        {/* Professional Role Selection */}
        <div>
          <Label className="block text-sm font-medium text-slate-700 mb-3">
            Rol Profesional <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div key={role.value} className="relative">
                <input
                  type="radio"
                  id={`role-${role.value}`}
                  name="role"
                  value={role.value}
                  checked={data.role === role.value}
                  onChange={() => handleRoleChange(role.value)}
                  className="sr-only"
                />
                <label
                  htmlFor={`role-${role.value}`}
                  className={`block p-4 border-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors duration-200 ${
                    data.role === role.value
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <div className={data.role === role.value ? 'text-blue-600' : 'text-slate-600'}>
                      {role.icon}
                    </div>
                    <h3 className={`text-sm font-semibold ${
                      data.role === role.value ? 'text-blue-900' : 'text-slate-900'
                    }`}>
                      {role.title}
                    </h3>
                  </div>
                  <p className={`text-xs ${
                    data.role === role.value ? 'text-blue-700' : 'text-slate-700'
                  }`}>
                    {role.description}
                  </p>
                  <div className={`mt-2 text-xs ${
                    data.role === role.value ? 'text-blue-600' : 'text-slate-600'
                  }`}>
                    <span className="font-medium">Permisos:</span> {role.permissions}
                  </div>
                </label>
              </div>
            ))}
          </div>
          {errors.role && (
            <div className="mt-2 text-sm text-red-600">{errors.role}</div>
          )}
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="team-size" className="block text-sm font-medium text-slate-700 mb-2">
              Tamaño del Equipo
            </Label>
            <select
              id="team-size"
              value={data.teamSize}
              onChange={(e) => handleChange('teamSize', e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar tamaño</option>
              <option value="1-5">1-5 personas</option>
              <option value="6-15">6-15 personas</option>
              <option value="16-50">16-50 personas</option>
              <option value="50+">Más de 50 personas</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="experience" className="block text-sm font-medium text-slate-700 mb-2">
              Experiencia con SpringBoot
            </Label>
            <select
              id="experience"
              value={data.experience}
              onChange={(e) => handleChange('experience', e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar nivel</option>
              <option value="beginner">Principiante (0-1 años)</option>
              <option value="intermediate">Intermedio (2-4 años)</option>
              <option value="advanced">Avanzado (5+ años)</option>
              <option value="expert">Experto (Arquitecto/Consultor)</option>
            </select>
          </div>
        </div>

        {/* Use Cases */}
        <div>
          <Label className="block text-sm font-medium text-slate-700 mb-3">
            Casos de Uso Principal <span className="text-slate-400">(Opcional)</span>
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Generación de APIs REST',
              'Microservicios',
              'Integración con bases de datos',
              'Documentación automática'
            ].map((useCase) => (
              <label key={useCase} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(data.useCases || []).includes(useCase)}
                  onChange={() => handleUseCaseToggle(useCase)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <span className="ml-2 text-sm text-slate-700">{useCase}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            className="px-6"
          >
            <svg className="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Anterior
          </Button>
          
          <Button
            type="submit"
            className="px-6"
          >
            Configurar Seguridad
            <svg className="h-4 w-4 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </Button>
        </div>
      </form>
    </div>
  )
}

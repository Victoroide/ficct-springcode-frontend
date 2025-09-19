import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { LogoIcon } from '@/components/icons'
import { ProgressIndicator } from '@/components/registration/ProgressIndicator'
import { PersonalInfoStep } from '@/components/registration/PersonalInfoStep'
import { ProfessionalInfoStep } from '@/components/registration/ProfessionalInfoStep'
import { SecuritySetupStep } from '@/components/registration/SecuritySetupStep'

interface RegistrationData {
  // Personal Info
  fullName: string
  email: string
  password: string
  passwordConfirm: string
  
  // Professional Info
  company: string
  department: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'ANALYST' | ''
  teamSize: string
  experience: string
  useCases: string[]
}

export const RegistrationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    fullName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    company: '',
    department: 'development',
    role: '',
    teamSize: '6-15',
    experience: 'advanced',
    useCases: ['Generación de APIs REST', 'Microservicios']
  })

  const steps = [
    {
      id: 1,
      name: 'Información Personal',
      description: 'Datos básicos'
    },
    {
      id: 2,
      name: 'Rol y Empresa',
      description: 'Información profesional'
    },
    {
      id: 3,
      name: 'Seguridad',
      description: 'Configuración 2FA'
    }
  ]

  const handleUpdateData = (newData: Partial<RegistrationData>) => {
    setRegistrationData(prev => ({ ...prev, ...newData }))
  }

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3))
  }

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleComplete = () => {
    // Registration complete, redirect to login
    window.location.href = '/login'
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            data={registrationData}
            onUpdate={handleUpdateData}
            onNext={handleNext}
          />
        )
      case 2:
        return (
          <ProfessionalInfoStep
            data={registrationData}
            onUpdate={handleUpdateData}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )
      case 3:
        return (
          <SecuritySetupStep
            data={registrationData}
            onPrev={handlePrev}
            onComplete={handleComplete}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                <LogoIcon className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">SpringCode Generator</h1>
            </div>
            <a 
              href="/login" 
              className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
            >
              ¿Ya tienes cuenta? Iniciar sesión
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={currentStep} steps={steps} />

        {/* Registration Form */}
        <Card className="shadow-sm">
          <CardContent className="p-6 sm:p-8">
            {renderCurrentStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

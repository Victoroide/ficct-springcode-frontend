import React from 'react'
import { CheckIcon } from '@/components/icons'
import { cn } from '@/lib/utils'

interface ProgressIndicatorProps {
  currentStep: number
  steps: Array<{
    id: number
    name: string
    description: string
  }>
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step Circle and Info */}
            <div className="flex items-center">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-200",
                currentStep > step.id 
                  ? "bg-blue-600 border-blue-600" 
                  : currentStep === step.id 
                    ? "bg-blue-600 border-blue-600" 
                    : "bg-slate-300 border-slate-300"
              )}>
                {currentStep > step.id ? (
                  <CheckIcon className="w-5 h-5 text-white" />
                ) : (
                  <span className={cn(
                    "text-sm font-semibold",
                    currentStep >= step.id ? "text-white" : "text-slate-500"
                  )}>
                    {step.id}
                  </span>
                )}
              </div>
              <div className="ml-3 text-sm">
                <div className={cn(
                  "font-medium",
                  currentStep >= step.id ? "text-slate-900" : "text-slate-500"
                )}>
                  {step.name}
                </div>
                <div className="text-slate-400 text-xs">{step.description}</div>
              </div>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-4 transition-colors duration-200",
                currentStep > step.id ? "bg-blue-600" : "bg-slate-300"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

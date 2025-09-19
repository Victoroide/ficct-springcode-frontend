import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface TwoFactorInputProps {
  onComplete: (code: string) => void
  isLoading?: boolean
  error?: string
  className?: string
  autoSubmit?: boolean
}

export const TwoFactorInput: React.FC<TwoFactorInputProps> = ({
  onComplete,
  isLoading = false,
  error,
  className,
  autoSubmit = true
}) => {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionFeedback, setSubmissionFeedback] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1 || isSubmitted) return // Prevent more than 1 character or changes when submitted
    
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check if code is complete
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      if (autoSubmit) {
        handleSubmit(newCode);
      }
    }
  }
  
  const handleSubmit = (submittedCode: string[]) => {
    setIsSubmitted(true);
    
    setSubmissionFeedback(true);
    onComplete(submittedCode.join(''));
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (isSubmitted) return;
    
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    
    if (e.key === 'Enter' && code.every(digit => digit !== '')) {
      handleSubmit(code);
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    if (isSubmitted) return;
    
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const digits = pastedText.replace(/\D/g, '').slice(0, 6).split('')
    
    if (digits.length === 6) {
      setCode(digits)
      handleSubmit(digits);
    }
  }

  useEffect(() => {
    if (!isLoading && !isSubmitted) {
      inputRefs.current[0]?.focus()
    }
  }, [isLoading, isSubmitted])
  
  useEffect(() => {
    if (error) {
      setIsSubmitted(false);
      setSubmissionFeedback(false);
    }
  }, [error])

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <div className="flex space-x-2 justify-center">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={isLoading || isSubmitted}
              className={cn(
                "w-10 h-10 text-center border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-lg transition-all duration-200",
                error && "border-red-300 focus:ring-red-500",
                isLoading && "opacity-50 cursor-not-allowed",
                isSubmitted && !error && "bg-blue-50 border-blue-300 text-blue-700",
                submissionFeedback && !error && "animate-pulse"
              )}
              aria-label={`Digit ${index + 1} of verification code`}
            />
          ))}
        </div>
        
        {/* Visual feedback overlay when submitting */}
        {(isLoading || (isSubmitted && !error)) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 rounded-md z-10">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-xs font-medium text-blue-700 mt-1">Verificando...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium text-blue-700 mt-1">Código enviado</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <div className="text-sm text-red-600 text-center">
          {error}
        </div>
      )}
      
      {code.every(digit => digit !== '') && !isSubmitted && !isLoading && (
        <button 
          onClick={() => handleSubmit(code)}
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Verificar código
        </button>
      )}
    </div>
  )
}

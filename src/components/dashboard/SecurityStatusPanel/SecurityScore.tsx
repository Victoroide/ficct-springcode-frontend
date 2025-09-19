import React, { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';

interface SecurityScoreProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

/**
 * Enhanced SecurityScore Component
 * Displays the security score as a circular progress with accurate SVG calculations
 */
export function SecurityScore({ 
  score, 
  maxScore = 100, 
  size = 'md',
  showText = true 
}: SecurityScoreProps) {
  // Validate and normalize score value
  const normalizedScore = Math.max(0, Math.min(score, maxScore));
  
  // Calculate percentage with more precise math
  const percentage = useMemo(() => {
    return Math.min(Math.max((normalizedScore / maxScore) * 100, 0), 100);
  }, [normalizedScore, maxScore]);
  
  // SVG Constants for accurate rendering
  const CIRCLE_RADIUS = 45;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
  
  // Calculate stroke-dasharray values with precise math
  const strokeDashArray = useMemo(() => {
    const completedArc = (percentage / 100) * CIRCLE_CIRCUMFERENCE;
    return `${completedArc.toFixed(2)} ${CIRCLE_CIRCUMFERENCE.toFixed(2)}`;
  }, [percentage, CIRCLE_CIRCUMFERENCE]);
  
  // Determine color based on score with proper Tailwind classes
  const scoreColor = useMemo(() => {
    if (percentage >= 80) return { bg: 'bg-green-500', stroke: 'stroke-green-500' };
    if (percentage >= 60) return { bg: 'bg-blue-500', stroke: 'stroke-blue-500' };
    if (percentage >= 40) return { bg: 'bg-amber-500', stroke: 'stroke-amber-500' };
    return { bg: 'bg-red-500', stroke: 'stroke-red-500' };
  }, [percentage]);
  
  // Determine text color based on score
  const textColor = useMemo(() => {
    if (percentage >= 80) return 'text-green-700';
    if (percentage >= 60) return 'text-blue-700';
    if (percentage >= 40) return 'text-amber-600';
    return 'text-red-600';
  }, [percentage]);
  
  // Determine size classes with improved readability
  const sizeClasses = useMemo(() => {
    const sizes = {
      sm: {
        container: 'w-16 h-16',
        text: 'text-lg',
        label: 'text-xs'
      },
      md: {
        container: 'w-24 h-24',
        text: 'text-2xl',
        label: 'text-sm'
      },
      lg: {
        container: 'w-32 h-32',
        text: 'text-3xl',
        label: 'text-base'
      }
    };
    return sizes[size];
  }, [size]);

  return (
    <div className="flex flex-col items-center">
      {/* Circular progress indicator with improved SVG rendering */}
      <div className={`relative ${sizeClasses.container} flex items-center justify-center`}>
        <div className="absolute inset-0">
          <svg 
            className="w-full h-full" 
            viewBox="0 0 100 100" 
            xmlns="http://www.w3.org/2000/svg"
            aria-label={`Security score: ${normalizedScore} out of ${maxScore}`}
            role="img"
          >
            {/* Background circle with consistent styling */}
            <circle
              cx="50"
              cy="50"
              r={CIRCLE_RADIUS}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="8"
              className="transition-all duration-300"
            />
            
            {/* Progress arc with precise math */}
            <circle
              cx="50"
              cy="50"
              r={CIRCLE_RADIUS}
              fill="none"
              className={`${scoreColor.stroke} transition-all duration-500 ease-in-out`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={strokeDashArray}
              strokeDashoffset="0"
              transform="rotate(-90 50 50)"
            />
          </svg>
        </div>
        
        {/* Score text with improved typography */}
        {showText && (
          <div className="flex flex-col items-center justify-center">
            <span className={`font-semibold ${sizeClasses.text} ${textColor} security-score-number`}>
              {normalizedScore}%
            </span>
            <span className={`${sizeClasses.label} text-slate-500 security-score-text`}>
              completado
            </span>
          </div>
        )}
      </div>
      
      {/* Linear progress alternative for small screens with consistent styling */}
      <div className="mt-4 w-full sm:hidden">
        <Progress 
          value={percentage} 
          className={`h-2 bg-slate-200 [&>div]:${scoreColor.bg} [&>div]:transition-all [&>div]:duration-500`}
        />
        <div className="flex justify-between mt-1 text-xs text-slate-500">
          <span>0%</span>
          <span className={textColor}>{normalizedScore}%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}

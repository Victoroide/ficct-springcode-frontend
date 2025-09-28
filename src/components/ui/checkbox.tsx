// @ts-nocheck
import React from "react";
import { Check } from "lucide-react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, onCheckedChange, checked, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(e.target.checked);
      }
    };

    return (
      <div className="flex items-center space-x-2">
        <div className="relative">
          <input
            type="checkbox"
            ref={ref}
            checked={checked}
            onChange={handleChange}
            className="peer h-4 w-4 opacity-0 absolute z-10 cursor-pointer"
            {...props}
          />
          <div 
            className={`
              peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 
              peer-focus-visible:ring-slate-950 dark:peer-focus-visible:ring-slate-300 
              h-4 w-4 shrink-0 rounded-sm border border-slate-200 dark:border-slate-800 
              flex items-center justify-center 
              ${checked ? 'bg-blue-600 dark:bg-blue-500' : 'bg-white dark:bg-slate-800'}
              ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              transition-colors duration-200
            `}
          >
            {checked && <Check className="h-3 w-3 text-white" />}
          </div>
        </div>
        {label && (
          <label 
            className={`text-sm ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";


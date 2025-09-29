import React from "react";

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className = '', orientation = 'horizontal', decorative = true, ...props }, ref) => {
    const ariaAttr = decorative ? { 'aria-hidden': true } : { role: 'separator' };
    
    return (
      <div
        ref={ref}
        className={`
          shrink-0 bg-slate-200 dark:bg-slate-800
          ${orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]"}
          ${className}
        `}
        {...ariaAttr}
        {...props}
      />
    );
  }
);

Separator.displayName = "Separator";

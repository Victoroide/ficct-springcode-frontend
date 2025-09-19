import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-600', className)}
      {...props}
    >
      {children}
    </div>
  );
});
Avatar.displayName = 'Avatar';

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {}
export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ children, className, ...props }) => (
  <span className={cn('text-xs font-medium', className)} {...props}>
    {children}
  </span>
);

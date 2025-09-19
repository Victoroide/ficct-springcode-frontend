import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

export const DropdownMenu: React.FC<{ children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void; }> = ({ children, open: openProp, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp !== undefined ? openProp : internalOpen;
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    setInternalOpen(v);
  };
  return <DropdownMenuContext.Provider value={{ open, setOpen }}>{children}</DropdownMenuContext.Provider>;
};

export const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ children, ...props }, ref) => {
  const ctx = React.useContext(DropdownMenuContext)!;
  return (
    <button ref={ref} {...props} onClick={() => ctx.setOpen(!ctx.open)}>
      {children}
    </button>
  );
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

export const DropdownMenuContent: React.FC<{ children: React.ReactNode; className?: string; align?: string; }> = ({ children, className }) => {
  const ctx = React.useContext(DropdownMenuContext)!;
  if (!ctx.open) return null;
  return (
    <div className={cn('absolute z-50 mt-2 w-56 rounded-md border bg-white shadow-lg', className)}>
      {children}
    </div>
  );
};

export const DropdownMenuLabel: React.FC<{ className?: string; children: React.ReactNode }> = ({ children, className }) => (
  <div className={cn('px-3 py-2 text-xs font-semibold text-gray-500', className)}>{children}</div>
);

export const DropdownMenuSeparator: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('my-1 h-px bg-gray-200', className)} />
);

export const DropdownMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    {...props}
    className={cn('px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer', className)}
  >
    {children}
  </div>
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

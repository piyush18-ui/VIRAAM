import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'amber';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-pause/40 disabled:opacity-50 disabled:pointer-events-none select-none';

    const variants = {
      primary: 'bg-foreground text-background hover:opacity-90',
      secondary: 'bg-elevated hover:bg-elevated/80 text-foreground border border-border',
      outline: 'border border-border bg-transparent hover:bg-surface text-foreground',
      danger: 'bg-danger/15 text-danger hover:bg-danger/25 border border-danger/30',
      ghost: 'bg-transparent hover:bg-surface text-muted hover:text-foreground',
      amber: 'bg-amber-pause hover:bg-amber-pause/90 text-black font-semibold shadow-sm',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs tracking-tight',
      md: 'h-9 px-4 text-sm',
      lg: 'h-11 px-6 text-base',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

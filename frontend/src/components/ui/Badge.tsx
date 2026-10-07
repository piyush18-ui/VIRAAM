import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'amber' | 'safe' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'default', size = 'sm', children, ...props }: BadgeProps) {
  const base = 'inline-flex items-center gap-1 rounded-full font-medium tracking-tight select-none border';

  const variants = {
    default: 'bg-elevated text-foreground border-border',
    outline: 'bg-transparent text-muted border-border',
    amber: 'bg-amber-500/10 text-amber-pause border-amber-500/30',
    safe: 'bg-emerald-500/10 text-safe border-emerald-500/30',
    danger: 'bg-red-500/10 text-danger border-red-500/30',
    info: 'bg-blue-500/10 text-info border-blue-500/30',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}

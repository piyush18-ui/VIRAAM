import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ToastItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
}

export interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-safe shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-pause shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-danger shrink-0" />,
    info: <Info className="w-4 h-4 text-info shrink-0" />,
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-card border border-border bg-surface p-4 shadow-xl'
            )}
          >
            {icons[toast.type]}
            <div className="flex-1">
              <h4 className="text-xs font-semibold text-foreground">{toast.title}</h4>
              {toast.message && <p className="text-[11px] text-muted mt-0.5">{toast.message}</p>}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-muted hover:text-foreground p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

import React from 'react';
import { cn } from '../../lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('inline-flex items-center p-1 rounded-lg bg-elevated/80 border border-border', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all select-none',
              isActive
                ? 'bg-surface text-foreground shadow-sm'
                : 'text-muted hover:text-foreground hover:bg-surface/50'
            )}
          >
            {tab.icon && <span className="w-3.5 h-3.5">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={cn('px-1.5 py-0.2 rounded-full text-[10px]', isActive ? 'bg-border text-foreground' : 'text-muted')}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

import React from 'react';
import { cn } from '../lib/utils';

export function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'underline',
  className,
}) {
  return (
    <div
      className={cn(
        variant === 'underline'
          ? 'border-b border-slate-200 flex space-x-6'
          : 'bg-slate-100 p-1 rounded inline-flex space-x-1',
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        if (variant === 'pills') {
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded transition-all',
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              )}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-full text-[10px]',
                    isActive
                      ? 'bg-brand-emerald-100 text-brand-emerald-800 font-bold'
                      : 'bg-slate-200 text-slate-700'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'group relative flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer',
              isActive
                ? 'border-brand-emerald-700 text-brand-emerald-800 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  'w-4 h-4 transition-colors',
                  isActive
                    ? 'text-brand-emerald-700'
                    : 'text-slate-400 group-hover:text-slate-600'
                )}
              />
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium',
                  isActive
                    ? 'bg-brand-emerald-100 text-brand-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;

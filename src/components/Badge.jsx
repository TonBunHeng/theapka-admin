import React from 'react';
import { cn } from '../lib/utils';

const variants = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/60',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200/60',
  brand: 'bg-brand-emerald-50 text-brand-emerald-800 border-brand-emerald-200/60',
  gold: 'bg-brand-gold-50 text-brand-gold-800 border-brand-gold-200/60',
};

const dots = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  neutral: 'bg-slate-400',
  info: 'bg-blue-500',
  brand: 'bg-brand-emerald-600',
  gold: 'bg-brand-gold-500',
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = true,
  className,
  ...props
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border rounded select-none',
        variants[variant] || variants.neutral,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'rounded-full shrink-0',
            dots[variant] || dots.neutral,
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
          )}
        />
      )}
      {children}
    </span>
  );
}

export default Badge;

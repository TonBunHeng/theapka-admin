import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

const variants = {
  primary:
    'bg-brand-emerald-700 text-white hover:bg-brand-emerald-800 active:bg-brand-emerald-900 shadow-sm focus-visible:ring-brand-emerald-500 border border-transparent',
  gold:
    'bg-brand-gold-500 text-white hover:bg-brand-gold-600 active:bg-brand-gold-700 shadow-sm focus-visible:ring-brand-gold-400 border border-transparent',
  secondary:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 shadow-sm focus-visible:ring-slate-400',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm focus-visible:ring-rose-500 border border-transparent',
  'danger-outline':
    'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 hover:border-rose-300 active:bg-rose-100 focus-visible:ring-rose-400',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 focus-visible:ring-slate-400',
  outline:
    'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400',
};

const sizes = {
  sm: 'h-8 px-2.5 text-xs gap-1.5 rounded',
  md: 'h-9 px-3.5 text-sm gap-2 rounded',
  lg: 'h-11 px-5 text-base gap-2.5 rounded',
  icon: 'h-9 w-9 p-0 rounded justify-center',
  'icon-sm': 'h-7 w-7 p-0 rounded justify-center',
};

export const Button = forwardRef(function Button(
  {
    children,
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon,
    iconRight: IconRight,
    type = 'button',
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
      {!loading && IconRight && <IconRight className="w-4 h-4 shrink-0" />}
    </button>
  );
});

export default Button;

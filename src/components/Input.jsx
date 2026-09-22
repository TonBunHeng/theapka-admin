import React, { forwardRef, useState, useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    type = 'text',
    className,
    containerClassName,
    icon: Icon,
    iconRight: IconRight,
    required,
    disabled,
    id,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={cn('w-full flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-slate-700 flex items-center gap-1"
        >
          {label}
          {required && <span className="text-rose-500 text-sm">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={effectiveType}
          disabled={disabled}
          required={required}
          className={cn(
            'w-full rounded border bg-white px-3 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 text-rose-900'
              : 'border-slate-300 focus:border-brand-emerald-600 focus:ring-brand-emerald-100',
            Icon && 'pl-9',
            (IconRight || isPassword) && 'pr-9',
            className
          )}
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        ) : IconRight ? (
          <div className="absolute right-3 text-slate-400 pointer-events-none flex items-center justify-center">
            <IconRight className="w-4 h-4" />
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;

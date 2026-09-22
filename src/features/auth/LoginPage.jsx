import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Mail, Lock, UserCheck, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../auth/authStore';
import Input from '../../components/Input';
import Button from '../../components/Button';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid work email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const authError = useAuthStore((s) => s.error);
  const [formError, setFormError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'super@theapka.test',
      password: 'password123',
      rememberMe: true,
    },
  });

  const onSubmit = async (data) => {
    setFormError('');
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(
        err?.response?.data?.message || err.message || t('auth.invalid_credentials')
      );
    }
  };

  const handleQuickLogin = (email) => {
    setValue('email', email);
    setValue('password', 'password123');
    onSubmit({ email, password: 'password123' });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center space-y-1">
        <div className="w-12 h-12 bg-brand-emerald-50 text-brand-emerald-700 border border-brand-emerald-200/60 rounded flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          {t('auth.sign_in')}
        </h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          {t('auth.sign_in_sub')}
        </p>
      </div>

      {/* Error alert */}
      {(formError || authError) && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs font-medium leading-relaxed">
          {formError || authError}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('auth.email')}
          type="email"
          icon={Mail}
          placeholder="staff@theapka.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label={t('auth.password')}
          type="password"
          icon={Lock}
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
            <input
              type="checkbox"
              className="rounded text-brand-emerald-600 focus:ring-brand-emerald-500 w-3.5 h-3.5"
              {...register('rememberMe')}
            />
            <span>{t('auth.remember_me')}</span>
          </label>

          <Link
            to="/forgot-password"
            className="text-brand-emerald-700 font-medium hover:underline hover:text-brand-emerald-800"
          >
            {t('auth.forgot_password')}
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          className="w-full h-10 font-semibold"
        >
          {isSubmitting ? t('auth.logging_in') : t('auth.submit_login')}
        </Button>
      </form>

      {/* Quick Test Logins (Acceptance Criteria & Testing Support) */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
          <Sparkles className="w-3 h-3 text-brand-gold-500" />
          <span>Quick Test Accounts</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('super@theapka.test')}
            disabled={isSubmitting}
            className="flex flex-col items-center justify-center p-2 rounded border border-brand-gold-300 bg-brand-gold-50/50 hover:bg-brand-gold-100/60 transition-all text-center group cursor-pointer"
          >
            <div className="flex items-center gap-1 text-xs font-bold text-brand-gold-800">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Super Admin</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">
              super@theapka.test
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('admin@theapka.test')}
            disabled={isSubmitting}
            className="flex flex-col items-center justify-center p-2 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-center group cursor-pointer"
          >
            <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Staff Admin</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">
              admin@theapka.test
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

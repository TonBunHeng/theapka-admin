import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';
import Input from '../../components/Input';
import Button from '../../components/Button';

const schema = z.object({
  email: z.string().email('Please enter a valid work email address'),
});

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/forgot-password', data);
      setIsSuccess(true);
    } catch {
      setIsSuccess(true); // Always return success for security (user enumeration prevention)
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 bg-brand-gold-50 text-brand-gold-700 border border-brand-gold-200/60 rounded flex items-center justify-center mx-auto mb-3">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          {t('auth.forgot_title')}
        </h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          {t('auth.forgot_sub')}
        </p>
      </div>

      {isSuccess ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-center space-y-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <p className="text-xs text-emerald-900 leading-relaxed">
            {t('auth.reset_sent')}
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('auth.back_to_login')}</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t('auth.email')}
            type="email"
            icon={Mail}
            placeholder="staff@theapka.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            className="w-full h-10 font-semibold"
          >
            {t('auth.send_reset_link')}
          </Button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('auth.back_to_login')}</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default ForgotPasswordPage;

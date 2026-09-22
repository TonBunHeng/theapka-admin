import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  User,
  Lock,
  Globe,
  Smartphone,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { useAuthStore } from '../../auth/authStore';
import api from '../../lib/api';
import PageHeader from '../../components/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { toast } from '../../components/Toast';

const passwordSchema = z
  .object({
    current_password: z.string().min(6, 'Current password required'),
    new_password: z.string().min(8, 'New password must be at least 8 characters'),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

export function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, role } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordSubmit = async (data) => {
    try {
      await api.put('/admin/password', data);
      toast.success('Password updated successfully.');
      reset();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update password.');
    }
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    toast.success(`Language set to ${lang === 'km' ? 'ភាសាខ្មែរ (Khmer)' : 'English'}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('profile.title')}
        subtitle={t('profile.subtitle')}
        breadcrumbs={[{ label: t('menu.dashboard'), to: '/' }, { label: t('menu.profile') }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card (Left) */}
        <Card className="md:col-span-1 p-6 text-center space-y-4">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Staff'}`}
            alt={user?.name}
            className="w-24 h-24 rounded-full bg-slate-100 object-cover border-2 border-brand-emerald-200 mx-auto shadow-sm"
          />

          <div>
            <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
          </div>

          <Badge
            variant={role === 'super_admin' ? 'gold' : 'brand'}
            size="md"
          >
            {role === 'super_admin' ? t('common.super_admin_badge') : t('common.admin_badge')}
          </Badge>

          <div className="pt-4 border-t border-slate-100 text-left space-y-3">
            <label className="text-xs font-semibold text-slate-700 block">
              {t('profile.language_preference')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`py-2 px-3 rounded text-xs font-semibold border transition-all ${
                  i18n.language === 'en'
                    ? 'border-brand-emerald-600 bg-brand-emerald-50 text-brand-emerald-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                English
              </button>

              <button
                type="button"
                onClick={() => handleLanguageChange('km')}
                className={`py-2 px-3 rounded text-xs font-semibold border font-khmer transition-all ${
                  i18n.language === 'km'
                    ? 'border-brand-emerald-600 bg-brand-emerald-50 text-brand-emerald-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                ភាសាខ្មែរ
              </button>
            </div>
          </div>
        </Card>

        {/* Change Password & Active Sessions (Right) */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-emerald-700" />
                <span>{t('profile.change_password')}</span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
                <Input
                  label={t('profile.current_password')}
                  type="password"
                  error={errors.current_password?.message}
                  {...register('current_password')}
                />

                <Input
                  label={t('profile.new_password')}
                  type="password"
                  error={errors.new_password?.message}
                  {...register('new_password')}
                />

                <Input
                  label={t('profile.confirm_password')}
                  type="password"
                  error={errors.confirm_password?.message}
                  {...register('confirm_password')}
                />

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isSubmitting}
                  >
                    {t('common.save')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-brand-emerald-700" />
                <span>{t('profile.active_sessions')}</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="p-3 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Chrome on macOS (Current Device)</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">IP: 127.0.0.1 • Phnom Penh, Cambodia</p>
                </div>
                <Badge variant="success" size="sm">Active Now</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

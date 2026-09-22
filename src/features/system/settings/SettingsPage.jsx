import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  Settings,
  Globe,
  Sliders,
  ToggleLeft,
  Save,
  CheckCircle,
} from 'lucide-react';
import api from '../../../lib/api';
import PageHeader from '../../../components/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/Card';
import Tabs from '../../../components/Tabs';
import Badge from '../../../components/Badge';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import Button from '../../../components/Button';
import { FormSkeleton } from '../../../components/Skeleton';
import { toast } from '../../../components/Toast';

export function SettingsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['super-admin', 'settings'],
    queryFn: async () => {
      const res = await api.get('/super-admin/settings');
      return res.data.data;
    },
  });

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (settings) {
      reset({
        platform_name: settings.platform_name,
        default_lang: settings.default_lang,
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        max_guests_free: settings.max_guests_free,
        max_guests_premium: settings.max_guests_premium,
        allow_khqr: settings.allow_khqr,
        allow_payway: settings.allow_payway,
      });
    }
  }, [settings, reset]);

  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      return api.put('/super-admin/settings', formData);
    },
    onSuccess: () => {
      toast.success('System settings saved successfully.');
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'settings'] });
    },
    onError: () => {
      toast.error('Failed to update system settings.');
    },
  });

  if (isLoading) return <FormSkeleton />;

  const tabs = [
    { id: 'general', label: t('system.settings.tab_general'), icon: Globe },
    { id: 'limits', label: t('system.settings.tab_limits'), icon: Sliders },
    { id: 'toggles', label: t('system.settings.tab_toggles'), icon: ToggleLeft },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('system.settings.title')}
        subtitle={t('system.settings.subtitle')}
        breadcrumbs={[{ label: t('menu.dashboard'), to: '/' }, { label: t('menu.settings') }]}
        badge={<Badge variant="gold">{t('system.badge')}</Badge>}
      />

      <Card>
        <div className="px-5 pt-3">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-6 max-w-xl">
            {activeTab === 'general' && (
              <div className="space-y-4">
                <Input
                  label={t('system.settings.platform_name')}
                  {...register('platform_name')}
                />

                <Select
                  label={t('system.settings.default_lang')}
                  options={[
                    { value: 'km', label: 'ភាសាខ្មែរ (Khmer - Default)' },
                    { value: 'en', label: 'English' },
                  ]}
                  {...register('default_lang')}
                />

                <Input
                  label="Official Support Email"
                  type="email"
                  {...register('contact_email')}
                />

                <Input
                  label="Official Contact Hotline"
                  {...register('contact_phone')}
                />
              </div>
            )}

            {activeTab === 'limits' && (
              <div className="space-y-4">
                <Input
                  label={t('system.settings.max_guests_free')}
                  type="number"
                  helperText="Maximum allowed invited guests on free standard wedding invitations."
                  {...register('max_guests_free')}
                />

                <Input
                  label={t('system.settings.max_guests_premium')}
                  type="number"
                  helperText="Maximum invited guests for premium gold and diamond tier celebrations."
                  {...register('max_guests_premium')}
                />
              </div>
            )}

            {activeTab === 'toggles' && (
              <div className="space-y-4">
                <div className="p-4 rounded border border-slate-200 bg-slate-50 space-y-3">
                  <label className="flex items-center justify-between text-xs font-semibold text-slate-800 cursor-pointer select-none">
                    <span>{t('system.settings.allow_khqr')}</span>
                    <input
                      type="checkbox"
                      className="rounded text-brand-emerald-600 focus:ring-brand-emerald-500 w-4 h-4"
                      {...register('allow_khqr')}
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs font-semibold text-slate-800 cursor-pointer select-none pt-2 border-t border-slate-200">
                    <span>{t('system.settings.allow_payway')}</span>
                    <input
                      type="checkbox"
                      className="rounded text-brand-emerald-600 focus:ring-brand-emerald-500 w-4 h-4"
                      {...register('allow_payway')}
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button
                type="submit"
                variant="primary"
                icon={Save}
                loading={saveMutation.isPending}
              >
                {t('common.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsPage;

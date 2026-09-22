import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  Wallet,
  CheckCircle,
  Activity,
  Save,
  Lock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import api from '../../../lib/api';
import PageHeader from '../../../components/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/Card';
import Badge from '../../../components/Badge';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import Button from '../../../components/Button';
import { FormSkeleton } from '../../../components/Skeleton';
import { toast } from '../../../components/Toast';

export function PaymentConfigPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [testingProvider, setTestingProvider] = useState(null);

  const { data: config, isLoading } = useQuery({
    queryKey: ['super-admin', 'payment-config'],
    queryFn: async () => {
      const res = await api.get('/super-admin/payment-config');
      return res.data.data;
    },
  });

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (config) {
      reset({
        khqr_enabled: config.khqr?.enabled,
        khqr_merchant_id: config.khqr?.merchant_id,
        khqr_merchant_name: config.khqr?.merchant_name,
        khqr_environment: config.khqr?.environment,
        khqr_api_key: '', // Write-only! Never pre-filled with raw secret
        payway_enabled: config.payway?.enabled,
        payway_merchant_id: config.payway?.merchant_id,
        payway_merchant_name: config.payway?.merchant_name,
        payway_environment: config.payway?.environment,
        payway_api_key: '', // Write-only!
      });
    }
  }, [config, reset]);

  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      const payload = {
        khqr: {
          enabled: formData.khqr_enabled,
          merchant_id: formData.khqr_merchant_id,
          merchant_name: formData.khqr_merchant_name,
          environment: formData.khqr_environment,
          api_key: formData.khqr_api_key || undefined,
        },
        payway: {
          enabled: formData.payway_enabled,
          merchant_id: formData.payway_merchant_id,
          merchant_name: formData.payway_merchant_name,
          environment: formData.payway_environment,
          api_key: formData.payway_api_key || undefined,
        },
      };
      return api.put('/super-admin/payment-config', payload);
    },
    onSuccess: () => {
      toast.success('Payment gateway configuration saved.');
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'payment-config'] });
    },
    onError: () => {
      toast.error('Failed to update payment gateway config.');
    },
  });

  const handleTestConnection = async (provider) => {
    setTestingProvider(provider);
    try {
      const res = await api.post('/super-admin/payment-config/test', { provider });
      toast.success(res.data.message || t('system.payment_config.connection_success'));
    } catch {
      toast.error(`Connection test to ${provider} failed.`);
    } finally {
      setTestingProvider(null);
    }
  };

  if (isLoading) return <FormSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('system.payment_config.title')}
        subtitle={t('system.payment_config.subtitle')}
        breadcrumbs={[{ label: t('menu.dashboard'), to: '/' }, { label: t('menu.payment_config') }]}
        badge={<Badge variant="gold">{t('system.badge')}</Badge>}
      />

      <div className="p-3.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-xs flex items-center gap-2.5">
        <Lock className="w-4 h-4 text-brand-emerald-700 shrink-0" />
        <span>
          <strong>Write-Only Secret Security:</strong> Gateway API keys and private secrets are stored securely in cryptographic vaults and are never transmitted back to client browsers.
        </span>
      </div>

      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Bakong KHQR */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
                  B
                </div>
                <span>{t('system.payment_config.khqr_title')}</span>
              </CardTitle>

              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                <span>Active</span>
                <input
                  type="checkbox"
                  className="rounded text-brand-emerald-600 focus:ring-brand-emerald-500 w-4 h-4"
                  {...register('khqr_enabled')}
                />
              </label>
            </CardHeader>

            <CardContent className="space-y-4">
              <Input
                label={t('system.payment_config.merchant_id')}
                placeholder="THEAPKA_BAKONG_KHQR"
                {...register('khqr_merchant_id')}
              />

              <Input
                label={t('system.payment_config.merchant_name')}
                placeholder="THEAPKA ONLINE CO., LTD."
                {...register('khqr_merchant_name')}
              />

              <Select
                label="Environment Mode"
                options={[
                  { value: 'production', label: 'Live Production' },
                  { value: 'sandbox', label: 'Bakong UAT Sandbox' },
                ]}
                {...register('khqr_environment')}
              />

              <Input
                label={t('system.payment_config.api_key')}
                type="password"
                placeholder={
                  config?.khqr?.has_secret
                    ? '•••••••••••••••• (Leave blank to keep existing secret)'
                    : 'Enter Bakong secret token...'
                }
                helperText={t('system.payment_config.secret_masked')}
                {...register('khqr_api_key')}
              />

              <div className="pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Activity}
                  loading={testingProvider === 'Bakong KHQR'}
                  onClick={() => handleTestConnection('Bakong KHQR')}
                >
                  {t('system.payment_config.test_connection')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: ABA PayWay */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-700 text-white font-bold text-xs flex items-center justify-center">
                  A
                </div>
                <span>{t('system.payment_config.payway_title')}</span>
              </CardTitle>

              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                <span>Active</span>
                <input
                  type="checkbox"
                  className="rounded text-brand-emerald-600 focus:ring-brand-emerald-500 w-4 h-4"
                  {...register('payway_enabled')}
                />
              </label>
            </CardHeader>

            <CardContent className="space-y-4">
              <Input
                label={t('system.payment_config.merchant_id')}
                placeholder="ec438819"
                {...register('payway_merchant_id')}
              />

              <Input
                label={t('system.payment_config.merchant_name')}
                placeholder="TheapKa Wedding Services"
                {...register('payway_merchant_name')}
              />

              <Select
                label="Environment Mode"
                options={[
                  { value: 'production', label: 'Live Production' },
                  { value: 'sandbox', label: 'ABA PayWay Staging' },
                ]}
                {...register('payway_environment')}
              />

              <Input
                label={t('system.payment_config.api_key')}
                type="password"
                placeholder={
                  config?.payway?.has_secret
                    ? '•••••••••••••••• (Leave blank to keep existing secret)'
                    : 'Enter PayWay API Key...'
                }
                helperText={t('system.payment_config.secret_masked')}
                {...register('payway_api_key')}
              />

              <div className="pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Activity}
                  loading={testingProvider === 'ABA PayWay'}
                  onClick={() => handleTestConnection('ABA PayWay')}
                >
                  {t('system.payment_config.test_connection')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end p-4 bg-white rounded border border-slate-200">
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
    </div>
  );
}

export default PaymentConfigPage;

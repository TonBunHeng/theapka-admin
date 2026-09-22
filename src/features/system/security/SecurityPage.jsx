import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  KeyRound,
  Shield,
  Clock,
  Smartphone,
  AlertTriangle,
  Save,
  Trash2,
  Lock,
} from 'lucide-react';
import api from '../../../lib/api';
import { formatDateTime } from '../../../lib/format';
import PageHeader from '../../../components/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/Card';
import Badge from '../../../components/Badge';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { FormSkeleton } from '../../../components/Skeleton';
import { toast } from '../../../components/Toast';

export function SecurityPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: security, isLoading } = useQuery({
    queryKey: ['super-admin', 'security'],
    queryFn: async () => {
      const res = await api.get('/super-admin/security');
      return res.data.data;
    },
  });

  const { register, handleSubmit, reset } = useForm();

  React.useEffect(() => {
    if (security) {
      reset({
        session_timeout_minutes: security.session_timeout_minutes,
        require_2fa: security.require_2fa,
        ip_allowlist: security.ip_allowlist,
        password_min_length: security.password_min_length,
      });
    }
  }, [security, reset]);

  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      return api.put('/super-admin/security', formData);
    },
    onSuccess: () => {
      toast.success('Security policies updated.');
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'security'] });
    },
  });

  const revokeSessionMutation = useMutation({
    mutationFn: async (sessionId) => {
      return api.delete(`/super-admin/security/sessions/${sessionId}`);
    },
    onSuccess: () => {
      toast.success('Session revoked.');
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'security'] });
    },
  });

  if (isLoading) return <FormSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('system.security.title')}
        subtitle={t('system.security.subtitle')}
        breadcrumbs={[{ label: t('menu.dashboard'), to: '/' }, { label: t('menu.security') }]}
        badge={<Badge variant="gold">{t('system.badge')}</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Security Configuration Form (7 cols) */}
        <form
          onSubmit={handleSubmit((d) => saveMutation.mutate(d))}
          className="lg:col-span-7 space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-emerald-700" />
                <span>Authentication & Session Policies</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Input
                label={t('system.security.session_timeout')}
                type="number"
                helperText="Inactivity period before staff members are automatically logged out."
                {...register('session_timeout_minutes')}
              />

              <Input
                label="Minimum Password Length"
                type="number"
                helperText="Applies to all administrative accounts created or reset."
                {...register('password_min_length')}
              />

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded text-brand-emerald-600 focus:ring-brand-emerald-500 w-4 h-4"
                    {...register('require_2fa')}
                  />
                  <span>{t('system.security.require_2fa')}</span>
                </label>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-700">
                  {t('system.security.ip_allowlist')}
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded border border-slate-300 p-2.5 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-emerald-100 focus:border-brand-emerald-600"
                  {...register('ip_allowlist')}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  icon={Save}
                  loading={saveMutation.isPending}
                >
                  {t('common.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Active Sessions & Failed Logins (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-brand-emerald-700" />
                <span>Active Device Sessions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {security?.active_sessions?.map((sess) => (
                <div
                  key={sess.id}
                  className="p-3 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{sess.device}</p>
                    <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                      IP: {sess.ip} • {formatDateTime(sess.last_active)}
                    </p>
                  </div>
                  {sess.current ? (
                    <Badge variant="success" size="sm">Current</Badge>
                  ) : (
                    <button
                      type="button"
                      onClick={() => revokeSessionMutation.mutate(sess.id)}
                      className="p-1 rounded text-rose-500 hover:bg-rose-50"
                      title="Revoke session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Failed Logins Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2 text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>{t('system.security.failed_logins')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {security?.failed_logins?.map((fl) => (
                <div
                  key={fl.id}
                  className="p-2.5 rounded bg-rose-50/50 border border-rose-200 flex items-center justify-between"
                >
                  <div>
                    <p className="font-mono font-semibold text-rose-950">{fl.email}</p>
                    <p className="text-[10px] text-rose-700">{fl.ip} • {fl.reason}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatDateTime(fl.time, 'HH:mm')}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SecurityPage;

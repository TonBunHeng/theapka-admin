import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import {
  Wrench,
  AlertTriangle,
  Save,
  Globe,
  Clock,
  Shield,
  CheckCircle2,
  Eye,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Radio,
  WifiOff,
  Layers,
} from 'lucide-react';
import api from '../../../lib/api';
import PageHeader from '../../../components/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/Card';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { FormSkeleton } from '../../../components/Skeleton';
import { toast } from '../../../components/Toast';

const PRESET_MESSAGES = [
  {
    label: 'Database Update / បច្ចុប្បន្នភាពទិន្នន័យ',
    km: 'ប្រព័ន្ធ TheapKa កំពុងស្ថិតក្រោមការធ្វើបច្ចុប្បន្នភាពមូលដ្ឋានទិន្នន័យតាមកាលវិភាគ។ សេវាកម្មនឹងដំណើរការឡើងវិញក្នុងពេលឆាប់ៗនេះ។',
    en: 'TheapKa Online is currently performing scheduled database optimization. Public services will resume shortly.',
  },
  {
    label: 'Payment Gateway Maintenance / ការថែទាំច្រកទូទាត់',
    km: 'ប្រព័ន្ធទូទាត់ Bakong KHQR និង ABA PayWay កំពុងត្រូវបានធ្វើបច្ចុប្បន្នភាពសុវត្ថិភាព។ សូមអភ័យទោសចំពោះការរំខាន។',
    en: 'Bakong KHQR and payment gateway integrations are undergoing scheduled security upgrades. Service will resume shortly.',
  },
  {
    label: 'Emergency Hotfix / ការដោះស្រាយបន្ទាន់',
    km: 'ប្រព័ន្ធ TheapKa កំពុងដំណើរការការជួសជុលបន្ទាន់ ដើម្បីធានាស្ថិរភាព និងសុវត្ថិភាពសេវាកម្ម។',
    en: 'TheapKa Online is currently applying critical platform improvements to ensure stability and security.',
  },
];

export function MaintenancePage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState(null);

  const { data: maintenance, isLoading } = useQuery({
    queryKey: ['super-admin', 'maintenance'],
    queryFn: async () => {
      const res = await api.get('/super-admin/maintenance');
      return res.data?.data || {};
    },
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { isDirty } } = useForm({
    defaultValues: {
      enabled: false,
      message_km: '',
      message_en: '',
      scheduled_end: '',
      allowed_ips: '',
    },
  });

  const isEnabled = watch('enabled');
  const messageKm = watch('message_km');
  const messageEn = watch('message_en');
  const scheduledEnd = watch('scheduled_end');
  const allowedIps = watch('allowed_ips');

  useEffect(() => {
    if (maintenance) {
      const formattedEnd = maintenance.scheduled_end
        ? dayjs(maintenance.scheduled_end).format('YYYY-MM-DDTHH:mm')
        : '';

      reset({
        enabled: Boolean(maintenance.enabled),
        message_km: maintenance.message_km || '',
        message_en: maintenance.message_en || '',
        scheduled_end: formattedEnd,
        allowed_ips: maintenance.allowed_ips || '',
      });
    }
  }, [maintenance, reset]);

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      return api.put('/super-admin/maintenance', payload);
    },
    onSuccess: () => {
      toast.success(t('system.maintenance.title') + ' settings updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'maintenance'] });
    },
    onError: () => {
      toast.error('Failed to update maintenance settings.');
    },
  });

  const onSubmit = (formData) => {
    // If enabling maintenance mode (and it was previously disabled), require operational reason confirmation
    if (formData.enabled && !maintenance?.enabled) {
      setPendingData(formData);
      setConfirmOpen(true);
      return;
    }

    saveMutation.mutate(formData);
  };

  const handleConfirmedEnable = (reason) => {
    if (!pendingData) return;
    saveMutation.mutate({
      ...pendingData,
      reason,
    });
    setPendingData(null);
    setConfirmOpen(false);
  };

  const applyPreset = (preset) => {
    setValue('message_km', preset.km, { shouldDirty: true });
    setValue('message_en', preset.en, { shouldDirty: true });
    toast.info('Applied notice preset template');
  };

  const setScheduleDuration = (hours) => {
    if (hours === 0) {
      setValue('scheduled_end', '', { shouldDirty: true });
    } else {
      const targetTime = dayjs().add(hours, 'hour').format('YYYY-MM-DDTHH:mm');
      setValue('scheduled_end', targetTime, { shouldDirty: true });
    }
  };

  const addLocalhostIp = () => {
    const current = allowedIps || '';
    const ip = '127.0.0.1';
    if (!current.includes(ip)) {
      const updated = current ? `${current.trim()}\n${ip}` : ip;
      setValue('allowed_ips', updated, { shouldDirty: true });
      toast.info('Added local IP 127.0.0.1 to whitelist');
    }
  };

  if (isLoading) return <FormSkeleton />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t('system.maintenance.title')}
        subtitle={t('system.maintenance.subtitle')}
        breadcrumbs={[
          { label: t('menu.dashboard'), to: '/' },
          { label: t('menu.maintenance') },
        ]}
        badge={<Badge variant="gold">{t('system.badge')}</Badge>}
      />

      {/* Global Status Banner Card */}
      <div
        className={`rounded p-4 sm:p-5 border transition-all ${
          isEnabled
            ? 'bg-rose-50/90 border-rose-200 text-rose-900 shadow-sm'
            : 'bg-emerald-50/90 border-emerald-200 text-emerald-900 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`p-2.5 rounded shrink-0 ${
                isEnabled
                  ? 'bg-rose-600 text-white shadow-md ring-4 ring-rose-100 animate-pulse'
                  : 'bg-brand-emerald-700 text-white shadow-md ring-4 ring-emerald-100'
              }`}
            >
              {isEnabled ? (
                <WifiOff className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">
                  {isEnabled
                    ? 'Maintenance Mode Active — Public Services Restricted'
                    : 'System Operational — All Public Services Online'}
                </h3>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isEnabled
                      ? 'bg-rose-200 text-rose-900'
                      : 'bg-emerald-200 text-emerald-900'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      isEnabled ? 'bg-rose-600 animate-ping' : 'bg-emerald-600'
                    }`}
                  />
                  {isEnabled ? 'Restricted' : 'Live'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {isEnabled
                  ? 'Couples and wedding guests visiting public domains receive the maintenance notice. Staff and Super Admins retain full back-office access.'
                  : 'Wedding invitations, RSVP portals, guestbook entries, and Bakong KHQR cash transfers are operating normally.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={isEnabled ? 'danger' : 'success'} size="md">
              {isEnabled ? 'MODE: MAINTENANCE' : 'MODE: PRODUCTION'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Configuration Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Toggle Control Card */}
            <Card className={isEnabled ? 'border-rose-300 ring-1 ring-rose-200' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className={`w-4 h-4 ${isEnabled ? 'text-rose-600' : 'text-slate-600'}`} />
                    <CardTitle className="text-sm">Platform State Control</CardTitle>
                  </div>
                  <Badge variant={isEnabled ? 'danger' : 'secondary'} size="sm">
                    {isEnabled ? 'Active' : 'Standby'}
                  </Badge>
                </div>
                <CardDescription>
                  Toggle the switch below to place the public application into maintenance mode.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="p-4 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="pr-4">
                    <span className="text-sm font-semibold text-slate-900 block">
                      {t('system.maintenance.enable_toggle')}
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enabling will redirect all public traffic to the styled bilingual maintenance page.
                    </p>
                  </div>

                  {/* Accessible Styled Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      {...register('enabled')}
                    />
                    <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-emerald-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600 shadow-inner"></div>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* 2. Public Notice Content Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-brand-emerald-700" />
                    <CardTitle className="text-sm">Bilingual Public Notice</CardTitle>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Bilingual Copy</span>
                </div>
                <CardDescription>
                  Specify the messages displayed to couples and guests when maintenance mode is active.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Presets */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-gold-500" />
                    <span>Quick Preset Templates</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_MESSAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="px-2.5 py-1 text-xs rounded bg-slate-100 text-slate-700 hover:bg-brand-emerald-50 hover:text-brand-emerald-800 border border-slate-200 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Khmer Notice */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-brand-emerald-600" />
                      <span>{t('system.maintenance.msg_km')}</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {messageKm?.length || 0} chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="ឧទាហរណ៍៖ ប្រព័ន្ធកំពុងស្ថិតក្រោមការថែទាំបច្ចេកទេស..."
                    className="w-full rounded border border-slate-300 p-3 text-xs font-khmer leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-emerald-100 focus:border-brand-emerald-600 placeholder:text-slate-400"
                    {...register('message_km')}
                  />
                </div>

                {/* English Notice */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-brand-gold-500" />
                      <span>{t('system.maintenance.msg_en')}</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {messageEn?.length || 0} chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="e.g. TheapKa Online is currently undergoing scheduled platform updates..."
                    className="w-full rounded border border-slate-300 p-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-emerald-100 focus:border-brand-emerald-600 placeholder:text-slate-400"
                    {...register('message_en')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 3. Scheduling & IP Whitelist Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <CardTitle className="text-sm">Schedule & Access Whitelist</CardTitle>
                </div>
                <CardDescription>
                  Configure estimated completion countdown and allowed IP addresses for platform testing.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Scheduled Completion Time */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t('system.maintenance.scheduled_end')}</span>
                    </div>
                    {scheduledEnd && (
                      <span className="text-[10px] text-brand-emerald-700 font-medium">
                        Target: {dayjs(scheduledEnd).format('MMM D, YYYY h:mm A')}
                      </span>
                    )}
                  </label>

                  <input
                    type="datetime-local"
                    className="w-full rounded border border-slate-300 px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-emerald-100 focus:border-brand-emerald-600"
                    {...register('scheduled_end')}
                  />

                  {/* Quick duration buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-400">Quick set:</span>
                    <button
                      type="button"
                      onClick={() => setScheduleDuration(1)}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] hover:bg-slate-200"
                    >
                      +1 Hour
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleDuration(2)}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] hover:bg-slate-200"
                    >
                      +2 Hours
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleDuration(4)}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] hover:bg-slate-200"
                    >
                      +4 Hours
                    </button>
                    {scheduledEnd && (
                      <button
                        type="button"
                        onClick={() => setScheduleDuration(0)}
                        className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 text-[11px] hover:bg-rose-100 ml-auto"
                      >
                        Clear Date
                      </button>
                    )}
                  </div>
                </div>

                {/* Whitelisted IP Addresses */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t('system.maintenance.allowed_ips')}</span>
                    </label>
                    <button
                      type="button"
                      onClick={addLocalhostIp}
                      className="text-[11px] text-brand-emerald-700 hover:text-brand-emerald-800 font-medium hover:underline"
                    >
                      + Add 127.0.0.1
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="127.0.0.1&#10;103.216.50.10"
                    className="w-full rounded border border-slate-300 p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-emerald-100 focus:border-brand-emerald-600 placeholder:text-slate-400"
                    {...register('allowed_ips')}
                  />
                  <p className="text-[11px] text-slate-400">
                    Separate IPs by newlines or commas. Traffic originating from these addresses can view public pages even during maintenance.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Save Action Bar */}
            <div className="p-4 rounded bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (maintenance) {
                    reset({
                      enabled: Boolean(maintenance.enabled),
                      message_km: maintenance.message_km || '',
                      message_en: maintenance.message_en || '',
                      scheduled_end: maintenance.scheduled_end
                        ? dayjs(maintenance.scheduled_end).format('YYYY-MM-DDTHH:mm')
                        : '',
                      allowed_ips: maintenance.allowed_ips || '',
                    });
                    toast.info('Reverted changes to stored configuration.');
                  }
                }}
                disabled={!isDirty || saveMutation.isPending}
                className="px-4 py-2 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revert Changes</span>
              </button>

              <Button
                type="submit"
                variant={isEnabled ? 'danger' : 'primary'}
                icon={Save}
                loading={saveMutation.isPending}
              >
                {t('common.save')}
              </Button>
            </div>
          </div>

          {/* Right Column: Live Guest Preview & System Impact (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Public Screen Preview Card */}
            <Card className="overflow-hidden border-slate-300 shadow-md">
              <CardHeader className="bg-slate-900 text-white pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-brand-gold-400" />
                    <CardTitle className="text-sm text-white">Live Public Notice Preview</CardTitle>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-brand-gold-400 border border-slate-700 font-mono">
                    couples / guests view
                  </span>
                </div>
                <CardDescription className="text-slate-400">
                  Real-time preview of what guests will see when visiting public wedding links.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 bg-slate-950/95 text-white min-h-[380px] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                {/* Background Ambient Glow */}
                <div className="absolute top-0 right-10 w-48 h-48 bg-brand-gold-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-10 w-48 h-48 bg-brand-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Simulated Screen Body */}
                <div className="relative z-10 max-w-sm space-y-4">
                  {/* Brand Icon */}
                  <img
                    src="/TK.jpeg"
                    alt="TheapKa"
                    className="mx-auto w-14 h-14 rounded object-cover border border-brand-gold-400/40 shadow-lg ring-4 ring-slate-800/80"
                  />

                  {/* Title */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {t('app.name')}
                    </h4>
                    <p className="text-[11px] text-brand-gold-400 font-medium">
                      ប្រព័ន្ធកំពុងស្ថិតក្រោមការថែទាំ • Scheduled Maintenance
                    </p>
                  </div>

                  {/* Rendered Notices Box */}
                  <div className="p-4 rounded bg-slate-900/90 border border-slate-800 text-left space-y-3 shadow-inner">
                    {/* Khmer text */}
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        ភាសាខ្មែរ
                      </span>
                      <p className="text-xs text-slate-200 font-khmer leading-relaxed">
                        {messageKm || 'សារជូនដំណឹងភាសាខ្មែរនឹងបង្ហាញនៅទីនេះ...'}
                      </p>
                    </div>

                    <div className="border-t border-slate-800 pt-2">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        English
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {messageEn || 'English maintenance announcement will be displayed here...'}
                      </p>
                    </div>

                    {/* Target End Time if set */}
                    {scheduledEnd && (
                      <div className="border-t border-slate-800 pt-2 flex items-center gap-2 text-brand-gold-400 text-[11px]">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Estimated return: {dayjs(scheduledEnd).format('h:mm A, MMM D')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer note */}
                  <p className="text-[10px] text-slate-500">
                    support@theapka.com • +855 (0) 12 345 678
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* System Impact Breakdown Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-600" />
                  <CardTitle className="text-sm">Service Impact Breakdown</CardTitle>
                </div>
                <CardDescription>
                  Summary of how platform subsystems are affected when maintenance is active.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 block">Digital Invitations</span>
                      <span className="text-[10px] text-slate-400">Public guest invitation URLs</span>
                    </div>
                    <Badge variant={isEnabled ? 'danger' : 'success'} size="sm">
                      {isEnabled ? 'Blocked' : 'Online'}
                    </Badge>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 block">RSVP & Guestbook</span>
                      <span className="text-[10px] text-slate-400">Attendance and wishing wall</span>
                    </div>
                    <Badge variant={isEnabled ? 'danger' : 'success'} size="sm">
                      {isEnabled ? 'Blocked' : 'Online'}
                    </Badge>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 block">Bakong KHQR Payments</span>
                      <span className="text-[10px] text-slate-400">Wedding gifting transactions</span>
                    </div>
                    <Badge variant={isEnabled ? 'danger' : 'success'} size="sm">
                      {isEnabled ? 'Suspended' : 'Online'}
                    </Badge>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 block">Staff & Super Admin</span>
                      <span className="text-[10px] text-slate-400">This management dashboard</span>
                    </div>
                    <Badge variant="brand" size="sm">
                      Unrestricted
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Confirmation Dialog with Mandated Reason when Enabling Maintenance */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmedEnable}
        title="Enable System Maintenance Mode?"
        description="Enabling maintenance mode will immediately take down all public couple pages and wedding guest invitations in Cambodia. Only whitelisted staff and administrators can access the platform."
        confirmText="Confirm & Enable Maintenance"
        cancelText="Cancel"
        variant="danger"
        requiresReason={true}
        reasonPlaceholder="e.g. Scheduled database migration and infrastructure maintenance..."
        loading={saveMutation.isPending}
      />
    </div>
  );
}

export default MaintenancePage;

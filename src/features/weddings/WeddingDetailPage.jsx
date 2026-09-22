import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  HeartHandshake,
  Calendar,
  MapPin,
  Clock,
  Lock,
  ShieldAlert,
  CreditCard,
  Contact2,
  Gift,
  Eye,
  Ban,
  RotateCcw,
  Archive,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import api from '../../lib/api';
import { formatDate, formatDateTime, formatMoney } from '../../lib/format';
import { usePermission } from '../../auth/usePermission';
import { PERMISSIONS } from '../../config/permissions';
import PageHeader from '../../components/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Tabs from '../../components/Tabs';
import ConfirmDialog from '../../components/ConfirmDialog';
import { FormSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import { toast } from '../../components/Toast';

export function WeddingDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { can } = usePermission();

  const [activeTab, setActiveTab] = useState('overview');
  const [dialogAction, setDialogAction] = useState(null);

  // Fetch wedding record
  const { data: wedding, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'wedding', id],
    queryFn: async () => {
      const res = await api.get(`/admin/weddings/${id}`);
      return res.data.data;
    },
  });

  // Guarded query for private guest data (Only fetched if user has guests.view)
  const hasGuestPermission = can(PERMISSIONS.GUESTS_VIEW);
  const { data: guestsData, isLoading: isGuestsLoading } = useQuery({
    queryKey: ['admin', 'wedding', id, 'guests'],
    queryFn: async () => {
      const res = await api.get(`/admin/weddings/${id}/guests`);
      return res.data.data;
    },
    enabled: hasGuestPermission && activeTab === 'guests',
  });

  // Guarded query for private gift data (Only fetched if user has gifts.view)
  const hasGiftsPermission = can(PERMISSIONS.GIFTS_VIEW);
  const { data: giftsData, isLoading: isGiftsLoading } = useQuery({
    queryKey: ['admin', 'wedding', id, 'gifts'],
    queryFn: async () => {
      const res = await api.get(`/admin/weddings/${id}/gifts-summary`);
      return res.data.data;
    },
    enabled: hasGiftsPermission && activeTab === 'gifts',
  });

  const mutation = useMutation({
    mutationFn: async ({ action, reason }) => {
      if (action === 'delete') {
        return api.delete(`/admin/weddings/${id}`, { data: { reason } });
      }
      return api.post(`/admin/weddings/${id}/${action}`, { reason });
    },
    onSuccess: () => {
      toast.success('Wedding updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'wedding', id] });
      setDialogAction(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Operation failed.');
    },
  });

  if (isLoading) return <FormSkeleton />;

  if (isError || !wedding) {
    return (
      <div className="p-8 text-center bg-white rounded border border-slate-200">
        <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-slate-900 mb-1">Wedding Not Found</h3>
        <p className="text-xs text-slate-500 mb-4">Could not load the requested wedding celebration.</p>
        <Button variant="secondary" onClick={() => refetch()}>{t('common.retry')}</Button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview & Schedule', icon: HeartHandshake },
    { id: 'invitation', label: t('weddings.invitation_preview'), icon: Eye },
    { id: 'payments', label: t('menu.payments'), icon: CreditCard, badge: wedding.payments?.length || 0 },
    {
      id: 'guests',
      label: 'Guest List',
      icon: Contact2,
      badge: !hasGuestPermission ? 'Locked' : guestsData?.length || wedding.guest_count,
    },
    {
      id: 'gifts',
      label: 'Gifts & Blessings',
      icon: Gift,
      badge: !hasGiftsPermission ? 'Locked' : undefined,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${wedding.groom_name} & ${wedding.bride_name}`}
        subtitle={`Wedding celebration date: ${formatDate(wedding.wedding_date)}`}
        breadcrumbs={[
          { label: t('menu.dashboard'), to: '/' },
          { label: t('menu.weddings'), to: '/weddings' },
          { label: wedding.title },
        ]}
        badge={
          <Badge
            variant={wedding.status === 'published' ? 'success' : wedding.status === 'draft' ? 'neutral' : 'warning'}
            size="md"
          >
            {wedding.status}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            {can(PERMISSIONS.WEDDINGS_SUSPEND) && (
              wedding.status === 'published' ? (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Ban}
                  onClick={() => setDialogAction('suspend')}
                  className="text-amber-600 border-amber-200 hover:bg-amber-50"
                >
                  {t('weddings.suspend_wedding')}
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={RotateCcw}
                  onClick={() => setDialogAction('restore')}
                  className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                >
                  {t('weddings.restore_wedding')}
                </Button>
              )
            )}

            {can(PERMISSIONS.WEDDINGS_EDIT) && (
              <Button
                variant="secondary"
                size="sm"
                icon={Archive}
                onClick={() => setDialogAction('archive')}
              >
                {t('weddings.archive_wedding')}
              </Button>
            )}
          </div>
        }
      />

      {/* Tabs navigation */}
      <Card>
        <div className="px-5 pt-3">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <CardContent className="pt-5">
          {/* TAB 1: OVERVIEW & SCHEDULE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Account Owner</p>
                  <Link
                    to={`/users/${wedding.user_id}`}
                    className="text-sm font-semibold text-brand-emerald-800 hover:underline block"
                  >
                    {wedding.user_name}
                  </Link>
                  <p className="text-xs text-slate-500 font-mono">{wedding.user_email}</p>
                </div>

                <div className="p-4 rounded bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Venue & Location</p>
                  <p className="text-sm font-semibold text-slate-900">{wedding.venue_name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    {wedding.venue_address}
                  </p>
                </div>

                <div className="p-4 rounded bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Service Package & Theme</p>
                  <p className="text-sm font-semibold text-slate-900 capitalize">
                    {wedding.plan.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-brand-gold-700 font-medium">
                    Template: {wedding.template_name}
                  </p>
                </div>
              </div>

              {/* Ceremony Schedule */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-emerald-700" />
                  <span>{t('weddings.schedule')}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {wedding.schedule?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded border border-slate-200 bg-white flex items-start gap-3"
                    >
                      <span className="px-2 py-1 rounded bg-brand-emerald-50 text-brand-emerald-800 font-mono font-bold text-xs shrink-0">
                        {item.time}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900 font-khmer">{item.title_km}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.title_en}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INVITATION PREVIEW (READ-ONLY RENDERED FROM CONFIG) */}
          {activeTab === 'invitation' && (
            <div className="space-y-4">
              <div className="p-4 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Public Invitation Slug:</span>
                  <p className="text-sm font-mono font-semibold text-slate-900">
                    /invite/{wedding.invitation_slug}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    Total Views: <strong className="text-slate-800">{wedding.invitation_views}</strong>
                  </span>
                  {wedding.invitation_flagged && (
                    <Badge variant="danger" size="sm">Flagged</Badge>
                  )}
                </div>
              </div>

              {/* Rendered Invitation Visual Frame */}
              <div
                className="max-w-md mx-auto rounded shadow-xl overflow-hidden border border-slate-200"
                style={{ backgroundColor: wedding.config?.theme_color || '#0F342A' }}
              >
                <div className="p-8 text-center text-white space-y-4">
                  <span className="text-brand-gold-300 font-mono text-xs uppercase tracking-widest">
                    Wedding Invitation
                  </span>
                  <h3 className="text-2xl font-serif tracking-tight text-brand-gold-400">
                    {wedding.groom_name}
                  </h3>
                  <span className="text-brand-gold-200 font-serif italic text-lg">&</span>
                  <h3 className="text-2xl font-serif tracking-tight text-brand-gold-400">
                    {wedding.bride_name}
                  </h3>
                  <div className="w-16 h-0.5 bg-brand-gold-400/50 mx-auto my-3" />
                  <p className="text-xs text-slate-200">{formatDate(wedding.wedding_date)}</p>
                  <p className="text-xs text-slate-300">{wedding.venue_name}</p>
                </div>
                <div className="bg-white p-5 text-center text-xs text-slate-600">
                  <p className="font-semibold text-slate-900 mb-1">
                    Digital Invitation Configuration
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Theme: {wedding.config?.theme_color} • Font: {wedding.config?.font_family}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-3">
              {wedding.payments && wedding.payments.length > 0 ? (
                wedding.payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{p.reference}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {p.provider} • {formatDateTime(p.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {formatMoney(p.amount, p.currency)}
                      </p>
                      <Badge
                        variant={p.status === 'completed' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {p.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="No transactions for this wedding" compact />
              )}
            </div>
          )}

          {/* TAB 4: GUEST LIST (CRITICAL RBAC PROTECTION) */}
          {activeTab === 'guests' && (
            <div>
              {!hasGuestPermission ? (
                /* LOCKED CARD: Explanation of missing permission */
                <div className="p-8 text-center bg-slate-50 rounded border-2 border-dashed border-slate-300 max-w-lg mx-auto my-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {t('weddings.private_data_locked')}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t('weddings.private_data_desc')}
                  </p>
                  <Badge variant="neutral" size="sm">
                    Required Permission: guests.view
                  </Badge>
                </div>
              ) : (
                /* PERMITTED VIEW: Persistent Access Logged Notice */
                <div className="space-y-4">
                  <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded text-xs font-medium flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{t('weddings.access_logged_notice')}</span>
                  </div>

                  {isGuestsLoading ? (
                    <div className="py-8 text-center text-xs text-slate-500">{t('common.loading')}</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {guestsData?.map((g) => (
                        <div
                          key={g.id}
                          className="p-3 rounded border border-slate-200 bg-white space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-900">{g.name}</p>
                            <Badge
                              variant={g.rsvp_status === 'confirmed' ? 'success' : 'neutral'}
                              size="sm"
                            >
                              {g.rsvp_status}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">{g.phone}</p>
                          <p className="text-[10px] text-slate-400">
                            Table #{g.table_no} • {g.pax} Guests
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: GIFTS & BLESSINGS (CRITICAL RBAC PROTECTION) */}
          {activeTab === 'gifts' && (
            <div>
              {!hasGiftsPermission ? (
                /* LOCKED CARD */
                <div className="p-8 text-center bg-slate-50 rounded border-2 border-dashed border-slate-300 max-w-lg mx-auto my-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    Couple Private Gift Data is Locked
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Financial records and digital wedding envelope gifts require the elevated{' '}
                    <strong>gifts.view</strong> permission.
                  </p>
                  <Badge variant="neutral" size="sm">
                    Required Permission: gifts.view
                  </Badge>
                </div>
              ) : (
                /* PERMITTED VIEW */
                <div className="space-y-4">
                  <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded text-xs font-medium flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{t('weddings.access_logged_notice')}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded bg-brand-gold-50/60 border border-brand-gold-200">
                      <p className="text-xs text-brand-gold-800 font-semibold">Total Gifts (KHR)</p>
                      <p className="text-xl font-bold text-brand-gold-950 mt-1">
                        {formatMoney(giftsData?.total_khr, 'KHR')}
                      </p>
                    </div>
                    <div className="p-4 rounded bg-brand-emerald-50/60 border border-brand-emerald-200">
                      <p className="text-xs text-brand-emerald-800 font-semibold">Total Gifts (USD)</p>
                      <p className="text-xl font-bold text-brand-emerald-950 mt-1">
                        {formatMoney(giftsData?.total_usd, 'USD')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={Boolean(dialogAction)}
        onClose={() => setDialogAction(null)}
        onConfirm={(reason) => mutation.mutate({ action: dialogAction, reason })}
        loading={mutation.isPending}
        title={`Confirm ${dialogAction}`}
        variant={dialogAction === 'delete' || dialogAction === 'suspend' ? 'danger' : 'primary'}
      />
    </div>
  );
}

export default WeddingDetailPage;

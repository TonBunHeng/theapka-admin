import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  User,
  HeartHandshake,
  CreditCard,
  LifeBuoy,
  UserX,
  UserCheck,
  KeyRound,
  Trash2,
  Calendar,
  Mail,
  Phone,
  ShieldAlert,
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

export function UserDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { can } = usePermission();

  const [activeTab, setActiveTab] = useState('weddings');
  const [dialogType, setDialogType] = useState(null);

  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${id}`);
      return res.data.data;
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ action, reason }) => {
      if (action === 'delete') {
        return api.delete(`/admin/users/${id}`, { data: { reason } });
      }
      return api.post(`/admin/users/${id}/${action}`, { reason });
    },
    onSuccess: () => {
      toast.success('Action executed successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', id] });
      setDialogType(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Action failed.');
    },
  });

  if (isLoading) return <FormSkeleton />;

  if (isError || !user) {
    return (
      <div className="p-8 text-center bg-white rounded border border-slate-200">
        <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-slate-900 mb-1">User Not Found</h3>
        <p className="text-xs text-slate-500 mb-4">Could not load the requested couple account.</p>
        <Button variant="secondary" onClick={() => refetch()}>{t('common.retry')}</Button>
      </div>
    );
  }

  const tabs = [
    { id: 'weddings', label: t('users.registered_weddings'), icon: HeartHandshake, badge: user.weddings?.length || 0 },
    { id: 'payments', label: t('users.payment_history'), icon: CreditCard, badge: user.payments?.length || 0 },
    { id: 'tickets', label: t('menu.support'), icon: LifeBuoy, badge: user.tickets?.length || 0 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.name}
        subtitle={`Account registered on ${formatDateTime(user.created_at)}`}
        breadcrumbs={[
          { label: t('menu.dashboard'), to: '/' },
          { label: t('menu.users'), to: '/users' },
          { label: user.name },
        ]}
        badge={
          <Badge
            variant={user.status === 'active' ? 'success' : user.status === 'suspended' ? 'danger' : 'warning'}
            size="md"
          >
            {user.status}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            {can(PERMISSIONS.USERS_EDIT) && (
              <Button
                variant="secondary"
                size="sm"
                icon={KeyRound}
                onClick={() => setDialogType('reset-password')}
              >
                {t('users.reset_password')}
              </Button>
            )}

            {can(PERMISSIONS.USERS_SUSPEND) && (
              user.status === 'active' ? (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={UserX}
                  onClick={() => setDialogType('suspend')}
                  className="text-amber-600 border-amber-200 hover:bg-amber-50"
                >
                  {t('users.suspend_user')}
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={UserCheck}
                  onClick={() => setDialogType('reactivate')}
                  className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                >
                  {t('users.reactivate_user')}
                </Button>
              )
            )}

            {can(PERMISSIONS.USERS_DELETE) && (
              <Button
                variant="danger-outline"
                size="sm"
                icon={Trash2}
                onClick={() => setDialogType('delete')}
              >
                {t('users.delete_user')}
              </Button>
            )}
          </div>
        }
      />

      {/* User Info Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1 p-5 flex flex-col items-center text-center">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 rounded-full bg-slate-100 object-cover border-2 border-slate-200 mb-3 shadow-xs"
          />
          <h2 className="text-base font-bold text-slate-900">{user.name}</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</p>
          <div className="mt-3 w-full border-t border-slate-100 pt-3 space-y-2 text-left text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Phone className="w-3.5 h-3.5" />
                Phone:
              </span>
              <span className="font-mono font-medium">{user.phone}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                Joined:
              </span>
              <span>{formatDate(user.created_at)}</span>
            </div>
          </div>
        </Card>

        {/* Tabbed Activity Content */}
        <Card className="md:col-span-3">
          <div className="px-5 pt-3">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          <CardContent className="pt-4">
            {activeTab === 'weddings' && (
              <div className="space-y-3">
                {user.weddings && user.weddings.length > 0 ? (
                  user.weddings.map((wed) => (
                    <div
                      key={wed.id}
                      className="p-4 rounded border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <Link
                          to={`/weddings/${wed.id}`}
                          className="text-sm font-bold text-slate-900 hover:text-brand-emerald-700"
                        >
                          {wed.title}
                        </Link>
                        <p className="text-xs text-slate-500 mt-1">
                          Date: <strong className="text-slate-700">{formatDate(wed.wedding_date)}</strong> • Plan:{' '}
                          <span className="capitalize">{wed.plan.replace('_', ' ')}</span> •{' '}
                          {wed.guest_count} Invited Guests
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={wed.status === 'published' ? 'success' : wed.status === 'draft' ? 'neutral' : 'warning'}
                          size="sm"
                        >
                          {wed.status}
                        </Badge>
                        <Link to={`/weddings/${wed.id}`}>
                          <Button size="sm" variant="secondary">View Wedding</Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState title="No weddings registered" compact />
                )}
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-3">
                {user.payments && user.payments.length > 0 ? (
                  user.payments.map((p) => (
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
                          variant={p.status === 'completed' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'}
                          size="sm"
                        >
                          {p.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState title="No payment transactions" compact />
                )}
              </div>
            )}

            {activeTab === 'tickets' && (
              <div className="space-y-3">
                {user.tickets && user.tickets.length > 0 ? (
                  user.tickets.map((tkt) => (
                    <div
                      key={tkt.id}
                      className="p-4 rounded border border-slate-200 bg-white flex items-center justify-between"
                    >
                      <div>
                        <Link
                          to={`/support/${tkt.id}`}
                          className="text-xs font-semibold text-slate-900 hover:text-brand-emerald-700 block"
                        >
                          {tkt.subject}
                        </Link>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {tkt.ticket_number} • Assigned to: {tkt.assignee_name}
                        </p>
                      </div>
                      <Badge
                        variant={tkt.status === 'closed' ? 'neutral' : 'brand'}
                        size="sm"
                      >
                        {tkt.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <EmptyState title="No support tickets" compact />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={Boolean(dialogType)}
        onClose={() => setDialogType(null)}
        onConfirm={(reason) => actionMutation.mutate({ action: dialogType, reason })}
        loading={actionMutation.isPending}
        title={`Confirm ${dialogType}`}
        variant={dialogType === 'delete' || dialogType === 'suspend' ? 'danger' : 'primary'}
      />
    </div>
  );
}

export default UserDetailPage;

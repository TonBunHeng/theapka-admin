import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  CreditCard,
  CheckCircle2,
  RotateCcw,
  Code,
  Calendar,
  User,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import api from '../../lib/api';
import { formatMoney, formatDateTime } from '../../lib/format';
import { usePermission } from '../../auth/usePermission';
import { PERMISSIONS } from '../../config/permissions';
import PageHeader from '../../components/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import { FormSkeleton } from '../../components/Skeleton';
import { toast } from '../../components/Toast';

export function PaymentDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { can } = usePermission();

  const [showRaw, setShowRaw] = useState(false);
  const [actionType, setActionType] = useState(null);

  const { data: payment, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'payment', id],
    queryFn: async () => {
      const res = await api.get(`/admin/payments/${id}`);
      return res.data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ action, reason }) => {
      return api.post(`/admin/payments/${id}/${action}`, { reason });
    },
    onSuccess: () => {
      toast.success('Payment updated.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment', id] });
      setActionType(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Action failed.');
    },
  });

  if (isLoading) return <FormSkeleton />;

  if (isError || !payment) {
    return (
      <div className="p-8 text-center bg-white rounded border border-slate-200">
        <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-slate-900 mb-1">Payment Not Found</h3>
        <Button variant="secondary" onClick={() => refetch()}>{t('common.retry')}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={payment.reference}
        subtitle={`Transaction on ${formatDateTime(payment.created_at)}`}
        breadcrumbs={[
          { label: t('menu.dashboard'), to: '/' },
          { label: t('menu.payments'), to: '/payments' },
          { label: payment.reference },
        ]}
        badge={
          <Badge
            variant={
              payment.status === 'completed'
                ? 'success'
                : payment.status === 'pending'
                ? 'warning'
                : 'danger'
            }
            size="md"
          >
            {payment.status}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            {can(PERMISSIONS.PAYMENTS_VERIFY) && payment.status === 'pending' && (
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                onClick={() => setActionType('verify')}
              >
                {t('payments.verify_payment')}
              </Button>
            )}

            {can(PERMISSIONS.PAYMENTS_REFUND) && payment.status === 'completed' && (
              <Button
                variant="danger-outline"
                size="sm"
                icon={RotateCcw}
                onClick={() => setActionType('refund')}
              >
                {t('payments.refund_payment')}
              </Button>
            )}
          </div>
        }
      />

      {/* Transaction Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 space-y-4">
          <CardHeader>
            <CardTitle>Payment Settlement Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-500">Gross Settled Amount</span>
                <p className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                  {formatMoney(payment.amount, payment.currency)}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-500">Payment Gateway</span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {payment.provider}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-500">Settlement Currency</span>
                <p className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                  {payment.currency}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Associated Wedding:</span>
                <Link
                  to={`/weddings/${payment.wedding_id}`}
                  className="font-semibold text-brand-emerald-800 hover:underline"
                >
                  {payment.wedding_title}
                </Link>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-500">Couple Customer:</span>
                <Link
                  to={`/users/${payment.user_id}`}
                  className="font-semibold text-brand-emerald-800 hover:underline"
                >
                  {payment.user_name}
                </Link>
              </div>

              {payment.verified_by && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Verified By Staff:</span>
                  <span className="font-medium text-slate-800">{payment.verified_by}</span>
                </div>
              )}

              {payment.refund_reason && (
                <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <strong>Refund Reason:</strong> {payment.refund_reason}
                </div>
              )}
            </div>

            {/* Collapsible Raw Gateway Webhook Payload */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRaw(!showRaw)}
                className="flex items-center justify-between w-full p-2.5 rounded bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-slate-500" />
                  <span>{t('payments.raw_payload')}</span>
                </div>
                {showRaw ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showRaw && (
                <div className="mt-2 p-4 rounded bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto">
                  <pre>{JSON.stringify(payment.raw_payload, null, 2)}</pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Side Timeline Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Audit Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">Transaction Initialized</p>
                <p className="text-slate-500 text-[11px]">{formatDateTime(payment.created_at)}</p>
              </div>
            </div>

            {payment.status === 'completed' && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Settlement Verified</p>
                  <p className="text-slate-500 text-[11px]">Provider webhook verified</p>
                </div>
              </div>
            )}

            {payment.status === 'refunded' && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-rose-900">Transaction Refunded</p>
                  <p className="text-slate-500 text-[11px]">{payment.refund_reason}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={Boolean(actionType)}
        onClose={() => setActionType(null)}
        onConfirm={(reason) => mutation.mutate({ action: actionType, reason })}
        loading={mutation.isPending}
        title={actionType === 'verify' ? t('payments.verify_payment') : t('payments.refund_payment')}
        description={
          actionType === 'verify' ? t('payments.verify_confirm') : t('payments.refund_confirm')
        }
        variant={actionType === 'refund' ? 'danger' : 'primary'}
      />
    </div>
  );
}

export default PaymentDetailPage;

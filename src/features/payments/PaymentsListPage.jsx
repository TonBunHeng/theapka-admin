import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  CheckCircle2,
  RotateCcw,
  Eye,
  AlertCircle,
  FileText,
  DollarSign,
} from 'lucide-react';
import api from '../../lib/api';
import { formatMoney, formatDateTime } from '../../lib/format';
import { usePermission } from '../../auth/usePermission';
import { PERMISSIONS } from '../../config/permissions';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import Badge from '../../components/Badge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { toast } from '../../components/Toast';

export function PaymentsListPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { can } = usePermission();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');

  const [activePayment, setActivePayment] = useState(null);
  const [actionType, setActionType] = useState(null); // 'verify' | 'refund'

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'payments', pageIndex, pageSize, search, statusFilter, providerFilter, currencyFilter],
    queryFn: async () => {
      const res = await api.get('/admin/payments', {
        params: {
          page: pageIndex + 1,
          per_page: pageSize,
          search: search || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          provider: providerFilter !== 'all' ? providerFilter : undefined,
          currency: currencyFilter !== 'all' ? currencyFilter : undefined,
        },
      });
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ id, action, reason }) => {
      return api.post(`/admin/payments/${id}/${action}`, { reason });
    },
    onSuccess: () => {
      toast.success('Payment updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      setActionType(null);
      setActivePayment(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Operation failed.');
    },
  });

  const summary = data?.summary || {};

  const columns = [
    {
      accessorKey: 'reference',
      header: t('payments.col_ref'),
      cell: ({ row }) => (
        <Link
          to={`/payments/${row.original.id}`}
          className="font-mono text-xs font-semibold text-brand-emerald-800 hover:underline"
        >
          {row.original.reference}
        </Link>
      ),
    },
    {
      accessorKey: 'user_name',
      header: t('payments.col_user'),
      cell: ({ row }) => (
        <div>
          <Link
            to={`/users/${row.original.user_id}`}
            className="font-semibold text-slate-900 hover:text-brand-emerald-700"
          >
            {row.original.user_name}
          </Link>
          <p className="text-[11px] text-slate-500 truncate max-w-xs">
            {row.original.wedding_title}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'provider',
      header: t('payments.col_provider'),
      cell: ({ row }) => (
        <span className="text-xs text-slate-700 font-medium">
          {row.original.provider}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: t('payments.col_amount'),
      cell: ({ row }) => {
        const p = row.original;
        return (
          <span className="font-bold text-slate-900 font-mono text-xs">
            {formatMoney(p.amount, p.currency)}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: t('payments.col_status'),
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge
            variant={
              s === 'completed'
                ? 'success'
                : s === 'pending'
                ? 'warning'
                : s === 'refunded'
                ? 'info'
                : 'danger'
            }
            size="sm"
          >
            {s}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: t('payments.col_date'),
      cell: ({ row }) => formatDateTime(row.original.created_at),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <Link
              to={`/payments/${p.id}`}
              className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              title={t('common.view_details')}
            >
              <Eye className="w-4 h-4" />
            </Link>

            {/* Verify manual payments */}
            {can(PERMISSIONS.PAYMENTS_VERIFY) && p.status === 'pending' && (
              <button
                type="button"
                onClick={() => {
                  setActivePayment(p);
                  setActionType('verify');
                }}
                className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                title={t('payments.verify_payment')}
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}

            {/* Refund completed payments */}
            {can(PERMISSIONS.PAYMENTS_REFUND) && p.status === 'completed' && (
              <button
                type="button"
                onClick={() => {
                  setActivePayment(p);
                  setActionType('refund');
                }}
                className="p-1 rounded text-rose-500 hover:bg-rose-50"
                title={t('payments.refund_payment')}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('payments.title')}
        subtitle={t('payments.subtitle')}
        breadcrumbs={[{ label: t('menu.dashboard'), to: '/' }, { label: t('menu.payments') }]}
      />

      {/* Distinct Currency Totals Summary (Rule: Never sum KHR and USD!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded bg-brand-gold-50/70 border border-brand-gold-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-brand-gold-800 uppercase tracking-wide">
              {t('payments.khr_total')}
            </p>
            <p className="text-2xl font-bold text-brand-gold-950 mt-0.5">
              {formatMoney(summary.total_khr, 'KHR')}
            </p>
          </div>
          <span className="text-xs text-brand-gold-700 bg-brand-gold-200/60 px-2 py-1 rounded font-bold font-mono">
            KHR
          </span>
        </div>

        <div className="p-4 rounded bg-brand-emerald-50/70 border border-brand-emerald-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-brand-emerald-800 uppercase tracking-wide">
              {t('payments.usd_total')}
            </p>
            <p className="text-2xl font-bold text-brand-emerald-950 mt-0.5">
              {formatMoney(summary.total_usd, 'USD')}
            </p>
          </div>
          <span className="text-xs text-brand-emerald-700 bg-brand-emerald-200/60 px-2 py-1 rounded font-bold font-mono">
            USD
          </span>
        </div>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by reference or couple name..."
        filters={[
          {
            key: 'status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All Statuses' },
              { value: 'completed', label: 'Completed' },
              { value: 'pending', label: 'Pending' },
              { value: 'refunded', label: 'Refunded' },
              { value: 'failed', label: 'Failed' },
            ],
          },
          {
            key: 'provider',
            value: providerFilter,
            onChange: setProviderFilter,
            options: [
              { value: 'all', label: 'All Gateways' },
              { value: 'Bakong KHQR', label: 'Bakong KHQR' },
              { value: 'ABA PayWay', label: 'ABA PayWay' },
              { value: 'Manual Bank Transfer', label: 'Manual Transfer' },
            ],
          },
          {
            key: 'currency',
            value: currencyFilter,
            onChange: setCurrencyFilter,
            options: [
              { value: 'all', label: 'All Currencies' },
              { value: 'KHR', label: 'KHR Only (៛)' },
              { value: 'USD', label: 'USD Only ($)' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setStatusFilter('all');
          setProviderFilter('all');
          setCurrencyFilter('all');
        }}
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        pageIndex={pageIndex}
        pageSize={pageSize}
        pageCount={data?.meta?.last_page || 1}
        totalItems={data?.meta?.total || 0}
        onPaginationChange={({ pageIndex, pageSize }) => {
          setPageIndex(pageIndex);
          setPageSize(pageSize);
        }}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(actionType)}
        onClose={() => {
          setActionType(null);
          setActivePayment(null);
        }}
        onConfirm={(reason) =>
          mutation.mutate({
            id: activePayment?.id,
            action: actionType,
            reason,
          })
        }
        loading={mutation.isPending}
        title={actionType === 'verify' ? t('payments.verify_payment') : t('payments.refund_payment')}
        description={
          actionType === 'verify'
            ? t('payments.verify_confirm')
            : t('payments.refund_confirm')
        }
        variant={actionType === 'refund' ? 'danger' : 'primary'}
      />
    </div>
  );
}

export default PaymentsListPage;

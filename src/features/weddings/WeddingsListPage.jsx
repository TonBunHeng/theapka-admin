import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Eye,
  Archive,
  Ban,
  RotateCcw,
  Trash2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import api from '../../lib/api';
import { formatDate } from '../../lib/format';
import { usePermission } from '../../auth/usePermission';
import { PERMISSIONS } from '../../config/permissions';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import Badge from '../../components/Badge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { toast } from '../../components/Toast';

export function WeddingsListPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { can } = usePermission();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  const [activeWedding, setActiveWedding] = useState(null);
  const [dialogAction, setDialogAction] = useState(null); // 'suspend' | 'restore' | 'archive' | 'delete'

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'weddings', pageIndex, pageSize, search, statusFilter, planFilter],
    queryFn: async () => {
      const res = await api.get('/admin/weddings', {
        params: {
          page: pageIndex + 1,
          per_page: pageSize,
          search: search || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          plan: planFilter !== 'all' ? planFilter : undefined,
        },
      });
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ id, action, reason }) => {
      if (action === 'delete') {
        return api.delete(`/admin/weddings/${id}`, { data: { reason } });
      }
      return api.post(`/admin/weddings/${id}/${action}`, { reason });
    },
    onSuccess: () => {
      toast.success('Wedding updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'weddings'] });
      setDialogAction(null);
      setActiveWedding(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Operation failed.');
    },
  });

  const columns = [
    {
      accessorKey: 'couple',
      header: t('weddings.col_couple'),
      cell: ({ row }) => {
        const w = row.original;
        return (
          <div>
            <Link
              to={`/weddings/${w.id}`}
              className="font-semibold text-slate-900 hover:text-brand-emerald-700 block transition-colors"
            >
              {w.groom_name} & {w.bride_name}
            </Link>
            <p className="text-[11px] text-slate-500 truncate max-w-xs">{w.venue_name}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'user_name',
      header: t('weddings.col_owner'),
      cell: ({ row }) => (
        <Link
          to={`/users/${row.original.user_id}`}
          className="text-xs text-slate-700 hover:underline hover:text-slate-900"
        >
          {row.original.user_name}
        </Link>
      ),
    },
    {
      accessorKey: 'wedding_date',
      header: t('weddings.col_date'),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(row.original.wedding_date)}</span>
        </div>
      ),
    },
    {
      accessorKey: 'plan',
      header: t('weddings.col_plan'),
      cell: ({ row }) => {
        const p = row.original.plan;
        return (
          <span className="capitalize text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            {p.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      accessorKey: 'guest_count',
      header: t('weddings.col_guests'),
      cell: ({ row }) => (
        <span className="font-semibold text-slate-700">{row.original.guest_count}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('weddings.col_status'),
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge
            variant={
              s === 'published'
                ? 'success'
                : s === 'draft'
                ? 'neutral'
                : s === 'suspended'
                ? 'danger'
                : 'warning'
            }
            size="sm"
          >
            {s}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => {
        const w = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <Link
              to={`/weddings/${w.id}`}
              className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              title={t('common.view_details')}
            >
              <Eye className="w-4 h-4" />
            </Link>

            {can(PERMISSIONS.WEDDINGS_SUSPEND) && (
              w.status === 'published' ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveWedding(w);
                    setDialogAction('suspend');
                  }}
                  className="p-1 rounded text-amber-600 hover:bg-amber-50"
                  title={t('weddings.suspend_wedding')}
                >
                  <Ban className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActiveWedding(w);
                    setDialogAction('restore');
                  }}
                  className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                  title={t('weddings.restore_wedding')}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )
            )}

            {can(PERMISSIONS.WEDDINGS_EDIT) && (
              <button
                type="button"
                onClick={() => {
                  setActiveWedding(w);
                  setDialogAction('archive');
                }}
                className="p-1 rounded text-slate-500 hover:bg-slate-100"
                title={t('weddings.archive_wedding')}
              >
                <Archive className="w-4 h-4" />
              </button>
            )}

            {can(PERMISSIONS.WEDDINGS_DELETE) && (
              <button
                type="button"
                onClick={() => {
                  setActiveWedding(w);
                  setDialogAction('delete');
                }}
                className="p-1 rounded text-rose-500 hover:bg-rose-50"
                title={t('common.delete')}
              >
                <Trash2 className="w-4 h-4" />
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
        title={t('weddings.title')}
        subtitle={t('weddings.subtitle')}
        breadcrumbs={[{ label: t('menu.dashboard'), to: '/' }, { label: t('menu.weddings') }]}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by couple names or owner..."
        filters={[
          {
            key: 'status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All Statuses' },
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Draft' },
              { value: 'archived', label: 'Archived' },
              { value: 'suspended', label: 'Suspended' },
            ],
          },
          {
            key: 'plan',
            value: planFilter,
            onChange: setPlanFilter,
            options: [
              { value: 'all', label: 'All Packages' },
              { value: 'standard_free', label: 'Standard Free' },
              { value: 'premium_gold', label: 'Premium Gold' },
              { value: 'vip_diamond', label: 'VIP Diamond' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setStatusFilter('all');
          setPlanFilter('all');
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

      <ConfirmDialog
        isOpen={Boolean(dialogAction)}
        onClose={() => {
          setDialogAction(null);
          setActiveWedding(null);
        }}
        onConfirm={(reason) =>
          mutation.mutate({
            id: activeWedding?.id,
            action: dialogAction,
            reason,
          })
        }
        loading={mutation.isPending}
        title={`Confirm ${dialogAction}`}
        description={`Provide an administrative reason for ${dialogAction}ing wedding ${activeWedding?.title}:`}
        variant={dialogAction === 'delete' || dialogAction === 'suspend' ? 'danger' : 'primary'}
      />
    </div>
  );
}

export default WeddingsListPage;

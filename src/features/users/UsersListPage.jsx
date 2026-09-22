import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  UserX,
  Trash2,
  KeyRound,
  MoreVertical,
  ExternalLink,
  Eye,
} from 'lucide-react';
import api from '../../lib/api';
import { formatDate } from '../../lib/format';
import { usePermission } from '../../auth/usePermission';
import { PERMISSIONS } from '../../config/permissions';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import { toast } from '../../components/Toast';

export function UsersListPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { can } = usePermission();

  // Table state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Action dialog states
  const [activeUser, setActiveUser] = useState(null);
  const [dialogType, setDialogType] = useState(null); // 'suspend' | 'reactivate' | 'delete' | 'reset-password'

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'users', pageIndex, pageSize, search, statusFilter],
    queryFn: async () => {
      const res = await api.get('/admin/users', {
        params: {
          page: pageIndex + 1,
          per_page: pageSize,
          search: search || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        },
      });
      return res.data;
    },
  });

  // Action Mutations
  const actionMutation = useMutation({
    mutationFn: async ({ id, action, reason }) => {
      if (action === 'delete') {
        return api.delete(`/admin/users/${id}`, { data: { reason } });
      }
      return api.post(`/admin/users/${id}/${action}`, { reason });
    },
    onSuccess: (_, variables) => {
      toast.success(`User action completed successfully.`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setDialogType(null);
      setActiveUser(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Action failed.');
    },
  });

  const handleConfirmAction = (reason) => {
    if (!activeUser || !dialogType) return;
    actionMutation.mutate({
      id: activeUser.id,
      action: dialogType,
      reason,
    });
  };

  const columns = [
    {
      accessorKey: 'name',
      header: t('users.col_name'),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <img
            src={row.original.avatar}
            alt={row.original.name}
            className="w-8 h-8 rounded-full bg-slate-100 object-cover border border-slate-200 shrink-0"
          />
          <div>
            <Link
              to={`/users/${row.original.id}`}
              className="font-semibold text-slate-900 hover:text-brand-emerald-700 transition-colors"
            >
              {row.original.name}
            </Link>
            <p className="text-[11px] text-slate-500 font-mono">
              {row.original.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: t('users.col_phone'),
      cell: ({ row }) => (
        <span className="font-mono text-slate-700">{row.original.phone}</span>
      ),
    },
    {
      accessorKey: 'weddings_count',
      header: t('users.col_weddings'),
      cell: ({ row }) => (
        <span className="font-medium text-slate-700">
          {row.original.weddings_count}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('users.col_status'),
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge
            variant={s === 'active' ? 'success' : s === 'suspended' ? 'danger' : 'warning'}
            size="sm"
          >
            {s}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: t('users.col_joined'),
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <Link
              to={`/users/${user.id}`}
              className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title={t('common.view_details')}
            >
              <Eye className="w-4 h-4" />
            </Link>

            {can(PERMISSIONS.USERS_SUSPEND) && (
              user.status === 'active' ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveUser(user);
                    setDialogType('suspend');
                  }}
                  className="p-1 rounded text-amber-600 hover:bg-amber-50 transition-colors"
                  title={t('users.suspend_user')}
                >
                  <UserX className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActiveUser(user);
                    setDialogType('reactivate');
                  }}
                  className="p-1 rounded text-emerald-600 hover:bg-emerald-50 transition-colors"
                  title={t('users.reactivate_user')}
                >
                  <UserCheck className="w-4 h-4" />
                </button>
              )
            )}

            {can(PERMISSIONS.USERS_DELETE) && (
              <button
                type="button"
                onClick={() => {
                  setActiveUser(user);
                  setDialogType('delete');
                }}
                className="p-1 rounded text-rose-500 hover:bg-rose-50 transition-colors"
                title={t('users.delete_user')}
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
        title={t('users.title')}
        subtitle={t('users.subtitle')}
        breadcrumbs={[{ label: t('menu.dashboard'), to: '/' }, { label: t('menu.users') }]}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search couples by name, email, or phone..."
        filters={[
          {
            key: 'status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'suspended', label: 'Suspended' },
              { value: 'pending', label: 'Pending' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setStatusFilter('all');
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

      {/* Confirm Reason Dialog for Destructive Actions */}
      <ConfirmDialog
        isOpen={Boolean(dialogType)}
        onClose={() => {
          setDialogType(null);
          setActiveUser(null);
        }}
        onConfirm={handleConfirmAction}
        loading={actionMutation.isPending}
        title={
          dialogType === 'suspend'
            ? t('users.suspend_confirm_title')
            : dialogType === 'reactivate'
            ? t('users.reactivate_user')
            : dialogType === 'delete'
            ? t('users.delete_confirm_title')
            : t('users.reset_password')
        }
        description={
          dialogType === 'suspend'
            ? t('users.suspend_confirm_desc')
            : dialogType === 'delete'
            ? t('users.delete_confirm_desc')
            : `Please enter the administrative reason for this action on couple account ${activeUser?.name}:`
        }
        variant={dialogType === 'delete' || dialogType === 'suspend' ? 'danger' : 'primary'}
      />
    </div>
  );
}

export default UsersListPage;

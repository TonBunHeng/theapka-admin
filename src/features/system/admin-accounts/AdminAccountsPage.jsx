import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ShieldCheck,
  Plus,
  UserX,
  UserCheck,
  KeyRound,
  ShieldAlert,
  Crown,
  AlertTriangle,
} from 'lucide-react';
import api from '../../../lib/api';
import { formatDateTime } from '../../../lib/format';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import Badge from '../../../components/Badge';
import Modal from '../../../components/Modal';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import Button from '../../../components/Button';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { toast } from '../../../components/Toast';

const createAdminSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid work email required'),
  role: z.string(),
  password: z.string().min(8, 'Minimum 8 characters'),
});

export function AdminAccountsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [actionType, setActionType] = useState(null); // 'disable' | 'enable' | 'force-reset'

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['super-admin', 'admins'],
    queryFn: async () => {
      const res = await api.get('/super-admin/admins');
      return res.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'admin',
      password: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData) => {
      return api.post('/super-admin/admins', formData);
    },
    onSuccess: () => {
      toast.success('Staff account provisioned successfully.');
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'admins'] });
      setCreateModalOpen(false);
      reset();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create staff account.');
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, reason }) => {
      return api.post(`/super-admin/admins/${id}/${action}`, { reason });
    },
    onSuccess: () => {
      toast.success('Staff account updated.');
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'admins'] });
      setActionType(null);
      setSelectedAdmin(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Operation forbidden.');
    },
  });

  const adminsList = data?.data || [];
  // Count active super admins to check self-lockout rule
  const activeSuperAdminsCount = adminsList.filter(
    (a) => a.role === 'super_admin' && a.status === 'active'
  ).length;

  const columns = [
    {
      accessorKey: 'name',
      header: t('system.admin_accounts.col_name'),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <img
            src={row.original.avatar}
            alt={row.original.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          <div>
            <span className="font-bold text-slate-900 block">{row.original.name}</span>
            <span className="text-[11px] text-slate-500 font-mono">{row.original.email}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: t('system.admin_accounts.col_role'),
      cell: ({ row }) => {
        const isSuper = row.original.role === 'super_admin';
        return (
          <Badge variant={isSuper ? 'gold' : 'brand'} size="sm">
            {isSuper ? (
              <>
                <Crown className="w-3 h-3 mr-0.5 text-brand-gold-600" />
                <span>Super Admin</span>
              </>
            ) : (
              <span>Staff Admin</span>
            )}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: t('system.admin_accounts.col_status'),
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge variant={s === 'active' ? 'success' : 'danger'} size="sm">
            {s}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'last_login_at',
      header: t('system.admin_accounts.col_last_login'),
      cell: ({ row }) =>
        row.original.last_login_at ? formatDateTime(row.original.last_login_at) : 'Never logged in',
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => {
        const admin = row.original;
        const isLastSuperAdmin =
          admin.role === 'super_admin' && activeSuperAdminsCount <= 1 && admin.status === 'active';

        return (
          <div className="flex items-center gap-1.5">
            {admin.status === 'active' ? (
              <button
                type="button"
                disabled={isLastSuperAdmin}
                onClick={() => {
                  setSelectedAdmin(admin);
                  setActionType('disable');
                }}
                className={`p-1 rounded transition-colors ${
                  isLastSuperAdmin
                    ? 'opacity-30 cursor-not-allowed text-slate-400'
                    : 'text-amber-600 hover:bg-amber-50'
                }`}
                title={
                  isLastSuperAdmin
                    ? t('system.admin_accounts.last_super_admin_error')
                    : t('system.admin_accounts.disable_admin')
                }
              >
                <UserX className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSelectedAdmin(admin);
                  setActionType('enable');
                }}
                className="p-1 rounded text-emerald-600 hover:bg-emerald-50 transition-colors"
                title={t('system.admin_accounts.enable_admin')}
              >
                <UserCheck className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setSelectedAdmin(admin);
                setActionType('force-reset');
              }}
              className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title={t('system.admin_accounts.force_reset')}
            >
              <KeyRound className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('system.admin_accounts.title')}
        subtitle={t('system.admin_accounts.subtitle')}
        breadcrumbs={[{ label: t('menu.dashboard'), to: '/' }, { label: t('menu.admin_accounts') }]}
        badge={<Badge variant="gold">{t('system.badge')}</Badge>}
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setCreateModalOpen(true)}
          >
            {t('system.admin_accounts.add_admin')}
          </Button>
        }
      />

      {/* Self-lockout warning note */}
      <div className="p-3 bg-slate-100 border border-slate-200 rounded text-xs text-slate-600 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-brand-gold-600 shrink-0" />
        <span>
          <strong>Protection Rule Active:</strong> The last active Super Admin account is permanently locked from being disabled or demoted.
        </span>
      </div>

      <DataTable
        columns={columns}
        data={adminsList}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
      />

      {/* Provision Admin Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={t('system.admin_accounts.add_admin')}
        description="Provision administrative credentials for new back-office staff"
        size="md"
      >
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <Input
            label={t('system.admin_accounts.col_name')}
            placeholder="e.g. Sreyleak Vannak"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label={t('system.admin_accounts.col_email')}
            type="email"
            placeholder="staff@theapka.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Select
            label={t('system.admin_accounts.col_role')}
            options={[
              { value: 'admin', label: 'Staff Admin' },
              { value: 'super_admin', label: 'Super Admin (Full Access)' },
            ]}
            {...register('role')}
          />

          <Input
            label="Temporary Initial Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCreateModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createMutation.isPending || isSubmitting}
            >
              Provision Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(actionType)}
        onClose={() => {
          setActionType(null);
          setSelectedAdmin(null);
        }}
        onConfirm={(reason) =>
          actionMutation.mutate({
            id: selectedAdmin?.id,
            action: actionType,
            reason,
          })
        }
        loading={actionMutation.isPending}
        title={
          actionType === 'disable'
            ? t('system.admin_accounts.disable_admin')
            : actionType === 'enable'
            ? t('system.admin_accounts.enable_admin')
            : t('system.admin_accounts.force_reset')
        }
        description={`Provide an administrative reason for this action on staff account ${selectedAdmin?.name}:`}
        variant={actionType === 'disable' ? 'danger' : 'primary'}
      />
    </div>
  );
}

export default AdminAccountsPage;

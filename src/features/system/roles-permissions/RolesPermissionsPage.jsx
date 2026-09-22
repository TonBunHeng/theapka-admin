import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Lock,
  Shield,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check,
  ShieldAlert,
  Crown,
} from 'lucide-react';
import api from '../../../lib/api';
import { PERMISSION_GROUPS, PERMISSIONS } from '../../../config/permissions';
import PageHeader from '../../../components/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/Card';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import { FormSkeleton } from '../../../components/Skeleton';
import { toast } from '../../../components/Toast';

export function RolesPermissionsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [adminPerms, setAdminPerms] = useState([]);
  const [initialPerms, setInitialPerms] = useState([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [reason, setReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['super-admin', 'roles'],
    queryFn: async () => {
      const res = await api.get('/super-admin/roles');
      return res.data.data;
    },
  });

  useEffect(() => {
    if (data?.admin_permissions) {
      setAdminPerms(data.admin_permissions);
      setInitialPerms(data.admin_permissions);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async ({ permissions, reason }) => {
      return api.put('/super-admin/roles', { permissions, reason });
    },
    onSuccess: () => {
      toast.success('Role permissions matrix saved successfully.');
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'roles'] });
      setConfirmModalOpen(false);
      setReason('');
      setInitialPerms(adminPerms);
    },
    onError: () => {
      toast.error('Failed to update permissions.');
    },
  });

  if (isLoading) return <FormSkeleton />;

  const handleToggleAdminPerm = (permKey, isSystem) => {
    // Hard Rule: System permissions cannot be granted to Admin
    if (isSystem) {
      toast.warning(t('system.roles.system_locked_notice'));
      return;
    }

    setAdminPerms((prev) =>
      prev.includes(permKey)
        ? prev.filter((p) => p !== permKey)
        : [...prev, permKey]
    );
  };

  // Calculate diff before saving
  const added = adminPerms.filter((p) => !initialPerms.includes(p));
  const removed = initialPerms.filter((p) => !adminPerms.includes(p));
  const hasChanges = added.length > 0 || removed.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('system.roles.title')}
        subtitle={t('system.roles.subtitle')}
        breadcrumbs={[{ label: t('menu.dashboard'), to: '/' }, { label: t('menu.roles_permissions') }]}
        badge={<Badge variant="gold">{t('system.badge')}</Badge>}
        actions={
          <Button
            variant="primary"
            icon={Save}
            disabled={!hasChanges}
            onClick={() => setConfirmModalOpen(true)}
          >
            {t('system.roles.save_matrix')}
          </Button>
        }
      />

      {/* System Lock Policy Notice */}
      <div className="p-3.5 bg-slate-100 border border-slate-200 rounded text-xs text-slate-700 flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 text-brand-emerald-700 shrink-0" />
        <span>
          {t('system.roles.system_locked_notice')} Super Admins inherently bypass all checks.
        </span>
      </div>

      {/* Roles Matrix Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-3 px-4 w-1/2">Resource & Action Key</th>
                <th className="py-3 px-4 text-center w-1/4">
                  <div className="flex items-center justify-center gap-1 text-slate-900">
                    <Shield className="w-4 h-4 text-brand-emerald-700" />
                    <span>{t('system.roles.role_admin')}</span>
                  </div>
                </th>
                <th className="py-3 px-4 text-center w-1/4">
                  <div className="flex items-center justify-center gap-1 text-brand-gold-800">
                    <Crown className="w-4 h-4 text-brand-gold-600" />
                    <span>{t('system.roles.role_super_admin')}</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {PERMISSION_GROUPS.map((group) => (
                <React.Fragment key={group.resource}>
                  {/* Resource Category Header */}
                  <tr className="bg-slate-100/70 border-t border-slate-200">
                    <td colSpan={3} className="py-2 px-4 font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      <div className="flex items-center gap-2">
                        <span>{t(group.labelKey)}</span>
                        {group.isPrivate && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                            Couple Private Data
                          </span>
                        )}
                        {group.isSystem && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-gold-100 text-brand-gold-900 font-bold">
                            Super Admin Exclusives
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Group Permissions Rows */}
                  {group.permissions.map((perm) => {
                    const isCheckedForAdmin = adminPerms.includes(perm);
                    const isLockedSystem = group.isSystem;

                    return (
                      <tr key={perm} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-4 font-mono text-slate-700">
                          {perm}
                        </td>

                        {/* Admin Column Checkbox */}
                        <td className="py-2.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isCheckedForAdmin}
                            disabled={isLockedSystem}
                            onChange={() => handleToggleAdminPerm(perm, isLockedSystem)}
                            className={`rounded w-4 h-4 transition-colors ${
                              isLockedSystem
                                ? 'opacity-30 cursor-not-allowed bg-slate-200'
                                : 'text-brand-emerald-700 focus:ring-brand-emerald-500 cursor-pointer'
                            }`}
                          />
                        </td>

                        {/* Super Admin Column (Always checked / locked on) */}
                        <td className="py-2.5 px-4 text-center">
                          <Check className="w-4 h-4 text-brand-gold-600 mx-auto" />
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirmation Diff Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title={t('system.roles.diff_title')}
        description={t('system.roles.diff_desc')}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              loading={saveMutation.isPending}
              onClick={() => saveMutation.mutate({ permissions: adminPerms, reason })}
            >
              {t('common.confirm')}
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          {added.length > 0 && (
            <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
              <p className="font-bold">Granting to Staff Admin ({added.length}):</p>
              <ul className="list-disc list-inside space-y-0.5 font-mono text-[11px]">
                {added.map((p) => (
                  <li key={p}>+{p}</li>
                ))}
              </ul>
            </div>
          )}

          {removed.length > 0 && (
            <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
              <p className="font-bold">Revoking from Staff Admin ({removed.length}):</p>
              <ul className="list-disc list-inside space-y-0.5 font-mono text-[11px]">
                {removed.map((p) => (
                  <li key={p}>-{p}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-slate-700">
              Audit Reason (Required for role changes):
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Granted refund capability to staff following policy update"
              className="w-full rounded border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-emerald-100 focus:border-brand-emerald-600"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default RolesPermissionsPage;

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  DatabaseBackup,
  Plus,
  Download,
  RotateCcw,
  AlertTriangle,
  FileArchive,
  CheckCircle,
} from 'lucide-react';
import api from '../../../lib/api';
import { formatFileSize, formatDateTime } from '../../../lib/format';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import Badge from '../../../components/Badge';
import Modal from '../../../components/Modal';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { toast } from '../../../components/Toast';

export function BackupPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [restoreTarget, setRestoreTarget] = useState(null);
  const [confirmKeyword, setConfirmKeyword] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['super-admin', 'backups'],
    queryFn: async () => {
      const res = await api.get('/super-admin/backups');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return api.post('/super-admin/backups');
    },
    onSuccess: () => {
      toast.success('Database point-in-time snapshot created successfully.');
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'backups'] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (id) => {
      return api.post(`/super-admin/backups/${id}/restore`);
    },
    onSuccess: () => {
      toast.success('Database restoration complete.');
      setRestoreTarget(null);
      setConfirmKeyword('');
    },
    onError: () => {
      toast.error('Failed to execute database restore.');
    },
  });

  const handleDownload = (backup) => {
    toast.success(`Downloading archive: ${backup.filename}`);
  };

  const columns = [
    {
      accessorKey: 'date',
      header: t('system.backup.col_date'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileArchive className="w-4 h-4 text-brand-emerald-700 shrink-0" />
          <span className="font-mono text-xs font-semibold text-slate-900">
            {formatDateTime(row.original.date)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: t('system.backup.col_type'),
      cell: ({ row }) => (
        <span className="text-xs text-slate-700 font-medium">
          {row.original.type}
        </span>
      ),
    },
    {
      accessorKey: 'size',
      header: t('system.backup.col_size'),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-slate-700">
          {formatFileSize(row.original.size)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('common.status'),
      cell: ({ row }) => (
        <Badge variant="success" size="sm">
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => {
        const b = row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownload(b)}
              className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              title={t('common.download')}
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setRestoreTarget(b);
                setConfirmKeyword('');
              }}
              className="p-1 rounded text-rose-600 hover:bg-rose-50"
              title={t('system.backup.restore_btn')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('system.backup.title')}
        subtitle={t('system.backup.subtitle')}
        breadcrumbs={[{ label: t('menu.dashboard'), to: '/' }, { label: t('menu.backup') }]}
        badge={<Badge variant="gold">{t('system.badge')}</Badge>}
        actions={
          <Button
            variant="primary"
            icon={Plus}
            loading={createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {t('system.backup.create_now')}
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
      />

      {/* High-Risk Restore Modal requiring exact "RESTORE" keyword */}
      <Modal
        isOpen={Boolean(restoreTarget)}
        onClose={() => {
          setRestoreTarget(null);
          setConfirmKeyword('');
        }}
        title={
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <span>{t('system.backup.restore_modal_title')}</span>
          </div>
        }
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setRestoreTarget(null);
                setConfirmKeyword('');
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              disabled={confirmKeyword !== 'RESTORE' || restoreMutation.isPending}
              loading={restoreMutation.isPending}
              onClick={() => restoreMutation.mutate(restoreTarget.id)}
            >
              {t('system.backup.restore_btn')}
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded leading-relaxed">
            {t('system.backup.restore_warning')}
          </div>

          <p className="text-slate-600">
            Target snapshot: <strong>{restoreTarget?.filename}</strong> (
            {formatDateTime(restoreTarget?.date)})
          </p>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-slate-800">
              {t('system.backup.restore_instruction')}
            </label>
            <input
              type="text"
              value={confirmKeyword}
              onChange={(e) => setConfirmKeyword(e.target.value)}
              placeholder="RESTORE"
              className="w-full rounded border border-rose-300 px-3 py-2 font-mono text-sm uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default BackupPage;

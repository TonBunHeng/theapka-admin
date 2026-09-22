import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  ScrollText,
  ShieldAlert,
  Download,
  Eye,
  FileCode,
  ArrowRight,
} from 'lucide-react';
import api from '../../../lib/api';
import { formatDateTime } from '../../../lib/format';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import FilterBar from '../../../components/FilterBar';
import Badge from '../../../components/Badge';
import Drawer from '../../../components/Drawer';
import Button from '../../../components/Button';
import { toast } from '../../../components/Toast';

export function AuditLogsPage() {
  const { t } = useTranslation();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const [selectedLog, setSelectedLog] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['super-admin', 'audit-logs', pageIndex, pageSize, search, actionFilter],
    queryFn: async () => {
      const res = await api.get('/super-admin/audit-logs', {
        params: {
          page: pageIndex + 1,
          per_page: pageSize,
          search: search || undefined,
          action: actionFilter !== 'all' ? actionFilter : undefined,
        },
      });
      return res.data;
    },
  });

  const handleExport = () => {
    toast.success('Audit log export dispatched to download.');
  };

  const columns = [
    {
      accessorKey: 'created_at',
      header: t('system.audit.col_time'),
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-slate-600">
          {formatDateTime(row.original.created_at)}
        </span>
      ),
    },
    {
      accessorKey: 'actor_name',
      header: t('system.audit.col_actor'),
      cell: ({ row }) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.original.actor_name}</span>
          <span className="text-[11px] text-slate-500 font-mono">{row.original.actor_email}</span>
        </div>
      ),
    },
    {
      accessorKey: 'action',
      header: t('system.audit.col_action'),
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
          {row.original.action}
        </span>
      ),
    },
    {
      accessorKey: 'target_type',
      header: t('system.audit.col_target'),
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-slate-800">{row.original.target_type}</span>
          <p className="text-[11px] text-slate-400 font-mono">{row.original.target_id}</p>
        </div>
      ),
    },
    {
      accessorKey: 'ip_address',
      header: t('system.audit.col_ip'),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-slate-600">{row.original.ip_address}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Inspect',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => setSelectedLog(row.original)}
          className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          title={t('system.audit.view_diff')}
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('system.audit.title')}
        subtitle={t('system.audit.subtitle')}
        breadcrumbs={[{ label: t('menu.dashboard'), to: '/' }, { label: t('menu.audit_logs') }]}
        badge={<Badge variant="gold">{t('system.badge')}</Badge>}
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={handleExport}
          >
            {t('common.export')}
          </Button>
        }
      />

      {/* Immutable Notice */}
      <div className="p-3.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-xs flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 text-brand-emerald-700 shrink-0" />
        <span>{t('system.audit.read_only_notice')}</span>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter by actor, action key, or target ID..."
        filters={[
          {
            key: 'action',
            value: actionFilter,
            onChange: setActionFilter,
            options: [
              { value: 'all', label: 'All Operations' },
              { value: 'users', label: 'User Actions' },
              { value: 'weddings', label: 'Wedding Actions' },
              { value: 'payments', label: 'Payment Actions' },
              { value: 'guests', label: 'Guest Access' },
              { value: 'system', label: 'System Operations' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setActionFilter('all');
        }}
      />

      {/* Audit Log Table - Strictly No Edit or Delete UI */}
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

      {/* Side-by-Side State Diff Drawer */}
      <Drawer
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title={t('system.audit.drawer_title')}
        subtitle={
          selectedLog
            ? `${selectedLog.action} executed by ${selectedLog.actor_name} on ${formatDateTime(selectedLog.created_at)}`
            : ''
        }
        width="max-w-2xl"
      >
        {selectedLog && (
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-2 gap-4 p-3 rounded bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-500">Target Entity:</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {selectedLog.target_type} ({selectedLog.target_id})
                </p>
              </div>
              <div>
                <span className="text-slate-500">IP & User Agent:</span>
                <p className="font-mono text-slate-700 mt-0.5">{selectedLog.ip_address}</p>
              </div>
            </div>

            {/* Side-by-Side Old vs New Values */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Old State */}
              <div className="space-y-1.5">
                <p className="font-bold text-rose-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>{t('system.audit.old_state')}</span>
                </p>
                <div className="p-3.5 rounded bg-rose-50/50 border border-rose-200 font-mono text-[11px] overflow-x-auto min-h-[140px]">
                  <pre>{JSON.stringify(selectedLog.old_values || {}, null, 2)}</pre>
                </div>
              </div>

              {/* New State */}
              <div className="space-y-1.5">
                <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{t('system.audit.new_state')}</span>
                </p>
                <div className="p-3.5 rounded bg-emerald-50/50 border border-emerald-200 font-mono text-[11px] overflow-x-auto min-h-[140px]">
                  <pre>{JSON.stringify(selectedLog.new_values || {}, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default AuditLogsPage;

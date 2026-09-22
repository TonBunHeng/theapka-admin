import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LifeBuoy, Eye, Clock, User, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import { formatDateTime } from '../../lib/format';
import { usePermission } from '../../auth/usePermission';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import Badge from '../../components/Badge';

export function SupportListPage() {
  const { t } = useTranslation();
  const { can } = usePermission();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'support', pageIndex, pageSize, search, statusFilter, priorityFilter],
    queryFn: async () => {
      const res = await api.get('/admin/support', {
        params: {
          page: pageIndex + 1,
          per_page: pageSize,
          search: search || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        },
      });
      return res.data;
    },
  });

  const columns = [
    {
      accessorKey: 'ticket_number',
      header: 'Ticket #',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-slate-800">
          {row.original.ticket_number}
        </span>
      ),
    },
    {
      accessorKey: 'subject',
      header: t('support.col_subject'),
      cell: ({ row }) => (
        <div>
          <Link
            to={`/support/${row.original.id}`}
            className="font-semibold text-slate-900 hover:text-brand-emerald-700 block"
          >
            {row.original.subject}
          </Link>
          <p className="text-[11px] text-slate-500 truncate max-w-sm">
            Couple: {row.original.user_name}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'priority',
      header: t('support.col_priority'),
      cell: ({ row }) => {
        const p = row.original.priority;
        return (
          <Badge
            variant={
              p === 'urgent'
                ? 'danger'
                : p === 'high'
                ? 'warning'
                : p === 'medium'
                ? 'brand'
                : 'neutral'
            }
            size="sm"
          >
            {p}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'assignee_name',
      header: t('support.col_assignee'),
      cell: ({ row }) => (
        <span className="text-xs text-slate-700 font-medium">
          {row.original.assignee_name || 'Unassigned'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('support.col_status'),
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge
            variant={
              s === 'open'
                ? 'danger'
                : s === 'in_progress'
                ? 'warning'
                : s === 'resolved'
                ? 'success'
                : 'neutral'
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
      header: 'Created',
      cell: ({ row }) => formatDateTime(row.original.created_at),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => (
        <Link
          to={`/support/${row.original.id}`}
          className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900 inline-block"
        >
          <Eye className="w-4 h-4" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('support.title')}
        subtitle={t('support.subtitle')}
        breadcrumbs={[{ label: t('menu.dashboard'), to: '/' }, { label: t('menu.support') }]}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search tickets by subject or couple name..."
        filters={[
          {
            key: 'status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All Statuses' },
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'waiting_user', label: 'Waiting on User' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' },
            ],
          },
          {
            key: 'priority',
            value: priorityFilter,
            onChange: setPriorityFilter,
            options: [
              { value: 'all', label: 'All Priorities' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setStatusFilter('all');
          setPriorityFilter('all');
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
    </div>
  );
}

export default SupportListPage;

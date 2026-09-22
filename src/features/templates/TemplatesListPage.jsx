import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Palette,
  Plus,
  Edit,
  CheckCircle,
  Archive,
  Crown,
  Sparkles,
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
import { toast } from '../../components/Toast';

export function TemplatesListPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { can } = usePermission();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'templates', pageIndex, pageSize, search],
    queryFn: async () => {
      const res = await api.get('/admin/templates', {
        params: {
          page: pageIndex + 1,
          per_page: pageSize,
          search: search || undefined,
        },
      });
      return res.data;
    },
  });

  const stateMutation = useMutation({
    mutationFn: async ({ id, action }) => {
      return api.post(`/admin/templates/${id}/${action}`);
    },
    onSuccess: () => {
      toast.success('Template status updated.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'templates'] });
    },
    onError: () => {
      toast.error('Failed to update template status.');
    },
  });

  const columns = [
    {
      accessorKey: 'thumbnail',
      header: 'Preview',
      cell: ({ row }) => (
        <img
          src={row.original.thumbnail}
          alt={row.original.name}
          className="w-16 h-10 object-cover rounded border border-slate-200 shadow-2xs"
        />
      ),
    },
    {
      accessorKey: 'name',
      header: t('templates.col_name'),
      cell: ({ row }) => (
        <div>
          <Link
            to={`/templates/${row.original.id}`}
            className="font-semibold text-slate-900 hover:text-brand-emerald-700 transition-colors"
          >
            {row.original.name}
          </Link>
          <p className="text-[11px] text-slate-500 font-mono">
            {row.original.slug}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'is_premium',
      header: t('templates.col_premium'),
      cell: ({ row }) =>
        row.original.is_premium ? (
          <Badge variant="gold" size="sm">
            <Crown className="w-3 h-3 mr-0.5 text-brand-gold-600" />
            <span>{t('templates.premium_tier')}</span>
          </Badge>
        ) : (
          <Badge variant="neutral" size="sm">
            <span>{t('templates.free_tier')}</span>
          </Badge>
        ),
    },
    {
      accessorKey: 'status',
      header: t('templates.col_status'),
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge
            variant={s === 'published' ? 'success' : s === 'draft' ? 'neutral' : 'warning'}
            size="sm"
          >
            {s}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: t('templates.col_created'),
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => {
        const tpl = row.original;
        return (
          <div className="flex items-center gap-1.5">
            {can(PERMISSIONS.TEMPLATES_EDIT) && (
              <Link
                to={`/templates/${tpl.id}`}
                className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                title={t('common.edit')}
              >
                <Edit className="w-4 h-4" />
              </Link>
            )}

            {can(PERMISSIONS.TEMPLATES_PUBLISH) && (
              tpl.status !== 'published' ? (
                <button
                  type="button"
                  onClick={() => stateMutation.mutate({ id: tpl.id, action: 'publish' })}
                  className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                  title={t('templates.publish_template')}
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => stateMutation.mutate({ id: tpl.id, action: 'retire' })}
                  className="p-1 rounded text-slate-400 hover:bg-slate-100"
                  title={t('templates.retire_template')}
                >
                  <Archive className="w-4 h-4" />
                </button>
              )
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('templates.title')}
        subtitle={t('templates.subtitle')}
        breadcrumbs={[{ label: t('menu.dashboard'), to: '/' }, { label: t('menu.templates') }]}
        actions={
          can(PERMISSIONS.TEMPLATES_CREATE) && (
            <Link to="/templates/new">
              <Button variant="primary" icon={Plus}>
                {t('templates.create_template')}
              </Button>
            </Link>
          )
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search templates by title or slug..."
        onReset={() => setSearch('')}
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

export default TemplatesListPage;

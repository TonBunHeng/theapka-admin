import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Edit, Globe, FileText, Check } from 'lucide-react';
import api from '../../lib/api';
import { formatDate } from '../../lib/format';
import { usePermission } from '../../auth/usePermission';
import { PERMISSIONS } from '../../config/permissions';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { toast } from '../../components/Toast';

export function ContentListPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { can } = usePermission();

  const [editingItem, setEditingItem] = useState(null);
  const [kmText, setKmText] = useState('');
  const [enText, setEnText] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'content'],
    queryFn: async () => {
      const res = await api.get('/admin/content');
      return res.data.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ key, km, en }) => {
      return api.put(`/admin/content/${key}`, { km, en });
    },
    onSuccess: () => {
      toast.success('Content updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'content'] });
      setEditingItem(null);
    },
    onError: () => {
      toast.error('Failed to update content entry.');
    },
  });

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setKmText(item.km || '');
    setEnText(item.en || '');
  };

  const columns = [
    {
      accessorKey: 'key',
      header: t('content.col_key'),
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-slate-800">
          {row.original.key}
        </span>
      ),
    },
    {
      accessorKey: 'category',
      header: t('content.col_category'),
      cell: ({ row }) => (
        <Badge variant="neutral" size="sm">
          {row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: 'km',
      header: 'Khmer Content Preview',
      cell: ({ row }) => (
        <p className="text-xs text-slate-600 truncate max-w-sm font-khmer">
          {row.original.km}
        </p>
      ),
    },
    {
      accessorKey: 'updated_at',
      header: t('content.col_updated'),
      cell: ({ row }) => formatDate(row.original.updated_at),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => {
        const item = row.original;
        return (
          can(PERMISSIONS.CONTENT_EDIT) && (
            <button
              type="button"
              onClick={() => handleOpenEdit(item)}
              className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              title={t('common.edit')}
            >
              <Edit className="w-4 h-4" />
            </button>
          )
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('content.title')}
        subtitle={t('content.subtitle')}
        breadcrumbs={[{ label: t('menu.dashboard'), to: '/' }, { label: t('menu.content') }]}
      />

      <DataTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
      />

      {/* Bilingual Content Editor Modal */}
      <Modal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title={t('content.edit_content')}
        description={`Content Key: ${editingItem?.key}`}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingItem(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              loading={saveMutation.isPending}
              onClick={() =>
                saveMutation.mutate({
                  key: editingItem.key,
                  km: kmText,
                  en: enText,
                })
              }
            >
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-brand-emerald-700" />
              <span>{t('content.km_text')}</span>
            </label>
            <textarea
              rows={4}
              value={kmText}
              onChange={(e) => setKmText(e.target.value)}
              className="w-full rounded border border-slate-300 p-3 text-xs leading-relaxed font-khmer focus:outline-none focus:ring-2 focus:ring-brand-emerald-100 focus:border-brand-emerald-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('content.en_text')}</span>
            </label>
            <textarea
              rows={4}
              value={enText}
              onChange={(e) => setEnText(e.target.value)}
              className="w-full rounded border border-slate-300 p-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-emerald-100 focus:border-brand-emerald-600"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ContentListPage;

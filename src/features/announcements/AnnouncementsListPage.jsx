import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Megaphone,
  Plus,
  Trash2,
  Calendar,
  Users,
  Shield,
} from 'lucide-react';
import api from '../../lib/api';
import { formatDateTime } from '../../lib/format';
import { usePermission } from '../../auth/usePermission';
import { PERMISSIONS } from '../../config/permissions';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { toast } from '../../components/Toast';

const announcementSchema = z.object({
  title: z.string().min(3, 'Headline is required'),
  body_km: z.string().min(5, 'Khmer body is required'),
  body_en: z.string().min(5, 'English body is required'),
  audience: z.string(),
});

export function AnnouncementsListPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { can } = usePermission();

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'announcements'],
    queryFn: async () => {
      const res = await api.get('/admin/announcements');
      return res.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '',
      body_km: '',
      body_en: '',
      audience: 'all',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData) => {
      return api.post('/admin/announcements', formData);
    },
    onSuccess: () => {
      toast.success('Announcement broadcasted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      setCreateModalOpen(false);
      reset();
    },
    onError: () => {
      toast.error('Failed to create announcement.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return api.delete(`/admin/announcements/${id}`);
    },
    onSuccess: () => {
      toast.success('Announcement removed.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
    },
  });

  const columns = [
    {
      accessorKey: 'title',
      header: t('announcements.col_title'),
      cell: ({ row }) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.original.title}</span>
          <p className="text-xs text-slate-500 font-khmer mt-0.5 line-clamp-1">
            {row.original.body_km}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'audience',
      header: t('announcements.col_audience'),
      cell: ({ row }) => (
        <Badge
          variant={row.original.audience === 'all' ? 'brand' : 'gold'}
          size="sm"
        >
          {row.original.audience === 'all'
            ? t('announcements.audience_all')
            : t('announcements.audience_staff')}
        </Badge>
      ),
    },
    {
      accessorKey: 'scheduled_at',
      header: t('announcements.col_scheduled'),
      cell: ({ row }) => formatDateTime(row.original.scheduled_at),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) =>
        can(PERMISSIONS.ANNOUNCEMENTS_DELETE) && (
          <button
            type="button"
            onClick={() => deleteMutation.mutate(row.original.id)}
            className="p-1 rounded text-rose-500 hover:bg-rose-50"
            title={t('common.delete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('announcements.title')}
        subtitle={t('announcements.subtitle')}
        breadcrumbs={[{ label: t('menu.dashboard'), to: '/' }, { label: t('menu.announcements') }]}
        actions={
          can(PERMISSIONS.ANNOUNCEMENTS_CREATE) && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setCreateModalOpen(true)}
            >
              {t('announcements.create')}
            </Button>
          )
        }
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
      />

      {/* Create Announcement Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={t('announcements.create')}
        description="Broadcast banner notice to platform couples or internal staff members"
        size="md"
      >
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <Input
            label={t('announcements.col_title')}
            placeholder="e.g. Bakong KHQR 2.0 Integration"
            error={errors.title?.message}
            {...register('title')}
          />

          <Select
            label={t('announcements.col_audience')}
            options={[
              { value: 'all', label: t('announcements.audience_all') },
              { value: 'staff', label: t('announcements.audience_staff') },
            ]}
            {...register('audience')}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Notice Body (Khmer)
            </label>
            <textarea
              rows={3}
              placeholder="សេចក្តីជូនដំណឹងជាភាសាខ្មែរ..."
              className="w-full rounded border border-slate-300 p-2.5 text-xs font-khmer focus:outline-none focus:ring-2 focus:ring-brand-emerald-100 focus:border-brand-emerald-600"
              {...register('body_km')}
            />
            {errors.body_km && (
              <p className="text-xs text-rose-600">{errors.body_km.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Notice Body (English)
            </label>
            <textarea
              rows={3}
              placeholder="Announcement text in English..."
              className="w-full rounded border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-emerald-100 focus:border-brand-emerald-600"
              {...register('body_en')}
            />
            {errors.body_en && (
              <p className="text-xs text-rose-600">{errors.body_en.message}</p>
            )}
          </div>

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
              Broadcast Notice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AnnouncementsListPage;

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Eye,
  Flag,
  Ban,
  MessageSquare,
  AlertTriangle,
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
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import { toast } from '../../components/Toast';

export function InvitationsListPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { can } = usePermission();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [flaggedOnly, setFlaggedOnly] = useState('all');

  const [previewWedding, setPreviewWedding] = useState(null);
  const [activeWedding, setActiveWedding] = useState(null);
  const [dialogAction, setDialogAction] = useState(null); // 'unpublish' | 'flag'

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'invitations', pageIndex, pageSize, search, flaggedOnly],
    queryFn: async () => {
      const res = await api.get('/admin/invitations', {
        params: {
          page: pageIndex + 1,
          per_page: pageSize,
          search: search || undefined,
          flagged: flaggedOnly === 'flagged' ? 'true' : undefined,
        },
      });
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ id, action, reason }) => {
      return api.post(`/admin/invitations/${id}/${action}`, { reason });
    },
    onSuccess: () => {
      toast.success('Invitation status updated.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'invitations'] });
      setDialogAction(null);
      setActiveWedding(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Action failed.');
    },
  });

  const columns = [
    {
      accessorKey: 'wedding',
      header: t('invitations.col_wedding'),
      cell: ({ row }) => (
        <div>
          <Link
            to={`/weddings/${row.original.id}`}
            className="font-semibold text-slate-900 hover:text-brand-emerald-700 transition-colors"
          >
            {row.original.title}
          </Link>
          <p className="text-[11px] text-slate-500 font-mono">
            /invite/{row.original.invitation_slug}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'template_name',
      header: t('invitations.col_template'),
      cell: ({ row }) => (
        <span className="text-xs text-slate-700 font-medium">
          {row.original.template_name}
        </span>
      ),
    },
    {
      accessorKey: 'invitation_views',
      header: t('invitations.col_views'),
      cell: ({ row }) => (
        <span className="font-semibold text-slate-800">
          {row.original.invitation_views?.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: t('invitations.col_published'),
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      accessorKey: 'invitation_flagged',
      header: t('invitations.col_moderation'),
      cell: ({ row }) => {
        const flagged = row.original.invitation_flagged;
        return (
          <Badge variant={flagged ? 'danger' : 'success'} size="sm">
            {flagged ? 'Flagged' : 'Approved'}
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
            <button
              type="button"
              onClick={() => setPreviewWedding(w)}
              className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              title={t('invitations.preview_invitation')}
            >
              <Eye className="w-4 h-4" />
            </button>

            {can(PERMISSIONS.INVITATIONS_MODERATE) && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActiveWedding(w);
                    setDialogAction('flag');
                  }}
                  className="p-1 rounded text-amber-600 hover:bg-amber-50"
                  title={t('invitations.flag')}
                >
                  <Flag className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveWedding(w);
                    setDialogAction('unpublish');
                  }}
                  className="p-1 rounded text-rose-600 hover:bg-rose-50"
                  title={t('invitations.unpublish')}
                >
                  <Ban className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('invitations.title')}
        subtitle={t('invitations.subtitle')}
        breadcrumbs={[{ label: t('menu.dashboard'), to: '/' }, { label: t('menu.invitations') }]}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search invitations by couple names or slug..."
        filters={[
          {
            key: 'flagged',
            value: flaggedOnly,
            onChange: setFlaggedOnly,
            options: [
              { value: 'all', label: 'All Moderation States' },
              { value: 'flagged', label: 'Flagged Content Only' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setFlaggedOnly('all');
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

      {/* Live Preview Modal */}
      <Modal
        isOpen={Boolean(previewWedding)}
        onClose={() => setPreviewWedding(null)}
        title={previewWedding ? `${previewWedding.groom_name} & ${previewWedding.bride_name}` : ''}
        description="Public Wedding Invitation Live Preview"
        size="md"
      >
        {previewWedding && (
          <div
            className="rounded p-8 text-center text-white space-y-4 shadow-inner"
            style={{ backgroundColor: previewWedding.config?.theme_color || '#0F342A' }}
          >
            <span className="text-brand-gold-300 font-mono text-xs uppercase tracking-widest">
              Digital Wedding Invitation
            </span>
            <h3 className="text-2xl font-serif text-brand-gold-400">
              {previewWedding.groom_name} & {previewWedding.bride_name}
            </h3>
            <div className="w-12 h-0.5 bg-brand-gold-400/50 mx-auto" />
            <p className="text-xs text-slate-200">{formatDate(previewWedding.wedding_date)}</p>
            <p className="text-xs text-slate-300">{previewWedding.venue_name}</p>
            <div className="pt-4">
              <span className="text-[11px] px-3 py-1 rounded-full bg-white/10 text-brand-gold-200 border border-white/20">
                Template: {previewWedding.template_name}
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Action Dialog */}
      <ConfirmDialog
        isOpen={Boolean(dialogAction)}
        onClose={() => setDialogAction(null)}
        onConfirm={(reason) =>
          mutation.mutate({
            id: activeWedding?.id,
            action: dialogAction,
            reason,
          })
        }
        loading={mutation.isPending}
        title={dialogAction === 'flag' ? t('invitations.flag') : t('invitations.unpublish')}
        description={
          dialogAction === 'flag'
            ? t('invitations.flag_reason')
            : 'Unpublishing will remove this invitation from public access and set status back to draft.'
        }
        variant={dialogAction === 'flag' ? 'primary' : 'danger'}
      />
    </div>
  );
}

export default InvitationsListPage;

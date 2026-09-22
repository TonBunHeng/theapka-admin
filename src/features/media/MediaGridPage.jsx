import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Image as ImageIcon,
  Music,
  File,
  Trash2,
  HardDrive,
  Eye,
  Filter,
} from 'lucide-react';
import api from '../../lib/api';
import { formatFileSize, formatDate } from '../../lib/format';
import { usePermission } from '../../auth/usePermission';
import { PERMISSIONS } from '../../config/permissions';
import PageHeader from '../../components/PageHeader';
import { Card, CardContent } from '../../components/Card';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import { toast } from '../../components/Toast';

export function MediaGridPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { can } = usePermission();

  const [mimeFilter, setMimeFilter] = useState('');
  const [previewMedia, setPreviewMedia] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'media', mimeFilter],
    queryFn: async () => {
      const res = await api.get('/admin/media', {
        params: { mime: mimeFilter || undefined },
      });
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      return api.delete(`/admin/media/${id}`, { data: { reason } });
    },
    onSuccess: () => {
      toast.success('Media asset removed.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
      setDeleteTarget(null);
    },
  });

  const mediaList = data?.data || [];
  const totalStorage = data?.total_storage_bytes || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('media.title')}
        subtitle={t('media.subtitle')}
        breadcrumbs={[{ label: t('menu.dashboard'), to: '/' }, { label: t('menu.media') }]}
      />

      {/* Storage Quota Card */}
      <div className="p-4 rounded bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-brand-emerald-50 text-brand-emerald-700 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{t('media.storage_used')}</p>
            <p className="text-xl font-bold text-slate-900">{formatFileSize(totalStorage)}</p>
          </div>
        </div>

        {/* Mime Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded">
          <button
            type="button"
            onClick={() => setMimeFilter('')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              mimeFilter === '' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Files
          </button>
          <button
            type="button"
            onClick={() => setMimeFilter('image')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              mimeFilter === 'image' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Photos
          </button>
          <button
            type="button"
            onClick={() => setMimeFilter('audio')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              mimeFilter === 'audio' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Music
          </button>
        </div>
      </div>

      {/* Media Asset Grid */}
      {mediaList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {mediaList.map((item) => {
            const isImage = item.mime.startsWith('image');
            const isAudio = item.mime.startsWith('audio');

            return (
              <Card key={item.id} className="overflow-hidden group hover:border-slate-300">
                <div className="relative aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
                  {isImage ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : isAudio ? (
                    <div className="flex flex-col items-center gap-1 text-slate-400">
                      <Music className="w-8 h-8 text-brand-emerald-700" />
                      <span className="text-[10px] font-mono">Audio MP3</span>
                    </div>
                  ) : (
                    <File className="w-8 h-8 text-slate-400" />
                  )}

                  {/* Overlay Quick Actions */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewMedia(item)}
                      className="p-1.5 rounded bg-white/90 text-slate-800 hover:bg-white transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {can(PERMISSIONS.MEDIA_DELETE) && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="p-1.5 rounded bg-white/90 text-rose-600 hover:bg-white transition-colors"
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <CardContent className="p-3">
                  <p className="text-xs font-semibold text-slate-900 truncate" title={item.name}>
                    {item.name}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{formatFileSize(item.size)}</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No media assets found" compact />
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={Boolean(previewMedia)}
        onClose={() => setPreviewMedia(null)}
        title={previewMedia?.name}
        description={`Associated Wedding: ${previewMedia?.wedding_title}`}
        size="lg"
      >
        {previewMedia && (
          <div className="space-y-4 text-center">
            {previewMedia.mime.startsWith('image') ? (
              <img
                src={previewMedia.url}
                alt={previewMedia.name}
                className="max-h-96 mx-auto rounded object-contain shadow-sm"
              />
            ) : (
              <div className="p-8 bg-slate-50 rounded flex flex-col items-center">
                <Music className="w-12 h-12 text-brand-emerald-700 mb-2" />
                <p className="text-xs text-slate-600 font-mono">{previewMedia.name}</p>
                <audio controls className="mt-4 w-full max-w-sm">
                  <source src={previewMedia.url} type="audio/mpeg" />
                </audio>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(reason) => deleteMutation.mutate({ id: deleteTarget?.id, reason })}
        loading={deleteMutation.isPending}
        title="Delete Media File"
        description={`Are you sure you want to delete ${deleteTarget?.name}?`}
        variant="danger"
      />
    </div>
  );
}

export default MediaGridPage;

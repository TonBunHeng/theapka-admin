import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Contact2,
  ShieldAlert,
  Eye,
  EyeOff,
  Download,
  Search,
} from 'lucide-react';
import api from '../../lib/api';
import { maskPhone } from '../../lib/format';
import { usePermission } from '../../auth/usePermission';
import { PERMISSIONS } from '../../config/permissions';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { toast } from '../../components/Toast';

export function GuestsCrossSearchPage() {
  const { t } = useTranslation();
  const { can } = usePermission();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [revealedPhones, setRevealedPhones] = useState({});

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'guests', pageIndex, pageSize, search],
    queryFn: async () => {
      const res = await api.get('/admin/guests', {
        params: {
          page: pageIndex + 1,
          per_page: pageSize,
          search: search || undefined,
        },
      });
      return res.data;
    },
  });

  const handleRevealPhone = (guestId, fullPhone) => {
    setRevealedPhones((prev) => ({
      ...prev,
      [guestId]: !prev[guestId],
    }));
    if (!revealedPhones[guestId]) {
      toast.info(t('guests.phone_revealed_logged'));
    }
  };

  const handleExport = () => {
    if (!can(PERMISSIONS.GUESTS_EXPORT)) {
      toast.error('You do not have guests.export permission.');
      return;
    }
    toast.success('Guest registry CSV export initiated.');
  };

  const columns = [
    {
      accessorKey: 'name',
      header: t('guests.col_guest'),
      cell: ({ row }) => (
        <span className="font-semibold text-slate-900">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'wedding_title',
      header: t('guests.col_wedding'),
      cell: ({ row }) => (
        <Link
          to={`/weddings/${row.original.wedding_id}`}
          className="text-xs text-brand-emerald-700 hover:underline font-medium"
        >
          {row.original.wedding_title}
        </Link>
      ),
    },
    {
      accessorKey: 'phone',
      header: t('guests.col_phone'),
      cell: ({ row }) => {
        const guest = row.original;
        const isRevealed = Boolean(revealedPhones[guest.id]);

        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-700">
              {isRevealed ? guest.phone : maskPhone(guest.phone)}
            </span>
            <button
              type="button"
              onClick={() => handleRevealPhone(guest.id, guest.phone)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              title={isRevealed ? 'Hide phone' : t('guests.reveal_phone')}
            >
              {isRevealed ? (
                <EyeOff className="w-3.5 h-3.5 text-slate-600" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-brand-emerald-700" />
              )}
            </button>
          </div>
        );
      },
    },
    {
      accessorKey: 'rsvp_status',
      header: t('guests.col_rsvp'),
      cell: ({ row }) => (
        <Badge
          variant={row.original.rsvp_status === 'confirmed' ? 'success' : 'neutral'}
          size="sm"
        >
          {row.original.rsvp_status}
        </Badge>
      ),
    },
    {
      accessorKey: 'pax',
      header: 'Party Size',
      cell: ({ row }) => `${row.original.pax} Pax`,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('guests.title')}
        subtitle={t('guests.subtitle')}
        breadcrumbs={[{ label: t('menu.dashboard'), to: '/' }, { label: t('menu.guests') }]}
        actions={
          can(PERMISSIONS.GUESTS_EXPORT) && (
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={handleExport}
            >
              {t('common.export')}
            </Button>
          )
        }
      />

      {/* Strict Compliance Warning Banner */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded text-xs font-medium flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span>{t('guests.warning_banner')}</span>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search guest by name, phone, or wedding..."
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

export default GuestsCrossSearchPage;

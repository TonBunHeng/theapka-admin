import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Users,
  HeartHandshake,
  MailOpen,
  Contact2,
  CreditCard,
  Clock,
  LifeBuoy,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import api from '../../lib/api';
import { formatMoney, formatDate, formatNumber } from '../../lib/format';
import { usePermission } from '../../auth/usePermission';
import { PERMISSIONS } from '../../config/permissions';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

export function DashboardPage() {
  const { t } = useTranslation();
  const { can } = usePermission();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard');
      return res.data.data;
    },
  });

  const stats = data?.stats || {};
  const growthData = data?.growth_chart || [];
  const revenueData = data?.revenue_chart || [];
  const recentWeddings = data?.recent_weddings || [];
  const recentPayments = data?.recent_payments || [];
  const recentTickets = data?.recent_tickets || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
      />

      {/* 1. Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.total_users')}
          value={formatNumber(stats.total_users)}
          icon={Users}
          variant="emerald"
          loading={isLoading}
          trend={{ value: '+14% this month', isUp: true }}
        />

        <StatCard
          title={t('dashboard.active_weddings')}
          value={formatNumber(stats.active_weddings)}
          icon={HeartHandshake}
          variant="gold"
          loading={isLoading}
          trend={{ value: '+8% this month', isUp: true }}
        />

        <StatCard
          title={t('dashboard.published_invitations')}
          value={formatNumber(stats.published_invitations)}
          icon={MailOpen}
          variant="emerald"
          loading={isLoading}
        />

        <StatCard
          title={t('dashboard.total_guests')}
          value={formatNumber(stats.total_guests)}
          icon={Contact2}
          variant="neutral"
          loading={isLoading}
        />

        {/* Finance Widgets: Guarded by payments.view */}
        {can(PERMISSIONS.PAYMENTS_VIEW) && (
          <>
            <StatCard
              title={t('dashboard.monthly_revenue_khr')}
              value={formatMoney(stats.monthly_revenue_khr, 'KHR')}
              icon={CreditCard}
              variant="gold"
              loading={isLoading}
              subtext="Settled in KHR"
            />

            <StatCard
              title={t('dashboard.monthly_revenue_usd')}
              value={formatMoney(stats.monthly_revenue_usd, 'USD')}
              icon={CreditCard}
              variant="emerald"
              loading={isLoading}
              subtext="Settled in USD"
            />

            <StatCard
              title={t('dashboard.pending_payments')}
              value={formatNumber(stats.pending_payments)}
              icon={Clock}
              variant="neutral"
              loading={isLoading}
              subtext="Requires verification"
            />
          </>
        )}

        {/* Support Widget: Guarded by support.view */}
        {can(PERMISSIONS.SUPPORT_VIEW) && (
          <StatCard
            title={t('dashboard.open_tickets')}
            value={formatNumber(stats.open_tickets)}
            icon={LifeBuoy}
            variant={stats.open_tickets > 0 ? 'emerald' : 'neutral'}
            loading={isLoading}
            subtext="Needs reply"
          />
        )}
      </div>

      {/* 2. Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User and Wedding Growth Curve */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>{t('dashboard.growth_chart_title')}</CardTitle>
            <Badge variant="brand" size="sm">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>Growth</span>
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="userGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1B5E4A" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#1B5E4A" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="weddingGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F342A',
                      borderColor: '#1B5E4A',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    name="Couples"
                    dataKey="users"
                    stroke="#1B5E4A"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#userGrowth)"
                  />
                  <Area
                    type="monotone"
                    name="Weddings"
                    dataKey="weddings"
                    stroke="#D4AF37"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#weddingGrowth)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue Chart (USD & KHR) */}
        {can(PERMISSIONS.PAYMENTS_VIEW) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>{t('dashboard.revenue_chart_title')}</CardTitle>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-brand-emerald-700" />
                  <span>USD ($)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-brand-gold-500" />
                  <span>KHR (៛)</span>
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip
                      formatter={(val, name) => [
                        name === 'USD' ? `$${val}` : `${val?.toLocaleString()} ៛`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        borderRadius: '8px',
                        color: '#FFF',
                        fontSize: '12px',
                      }}
                    />
                    <Bar name="USD" dataKey="usd" fill="#1B5E4A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 3. Recent Activity Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Weddings */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle>{t('dashboard.recent_weddings')}</CardTitle>
            <Link to="/weddings" className="text-xs text-brand-emerald-700 font-semibold hover:underline">
              {t('dashboard.view_all')}
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {recentWeddings.map((w) => (
              <div key={w.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <Link
                    to={`/weddings/${w.id}`}
                    className="text-xs font-semibold text-slate-900 hover:text-brand-emerald-700 truncate block"
                  >
                    {w.groom_name} & {w.bride_name}
                  </Link>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {formatDate(w.wedding_date)} • {w.guest_count} guests
                  </p>
                </div>
                <Badge
                  variant={w.status === 'published' ? 'success' : w.status === 'draft' ? 'neutral' : 'warning'}
                  size="sm"
                >
                  {w.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Latest Payments (Guarded) */}
        {can(PERMISSIONS.PAYMENTS_VIEW) && (
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle>{t('dashboard.recent_payments')}</CardTitle>
              <Link to="/payments" className="text-xs text-brand-emerald-700 font-semibold hover:underline">
                {t('dashboard.view_all')}
              </Link>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100">
              {recentPayments.map((p) => (
                <div key={p.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {p.reference}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {p.user_name} • {p.provider}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-900">
                      {formatMoney(p.amount, p.currency)}
                    </p>
                    <span className="text-[10px] text-emerald-600 font-medium">
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Support Queue (Guarded) */}
        {can(PERMISSIONS.SUPPORT_VIEW) && (
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle>{t('dashboard.recent_tickets')}</CardTitle>
              <Link to="/support" className="text-xs text-brand-emerald-700 font-semibold hover:underline">
                {t('dashboard.view_all')}
              </Link>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100">
              {recentTickets.map((tkt) => (
                <div key={tkt.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <Link
                      to={`/support/${tkt.id}`}
                      className="text-xs font-semibold text-slate-900 hover:text-brand-emerald-700 truncate block"
                    >
                      {tkt.subject}
                    </Link>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {tkt.user_name} • {tkt.ticket_number}
                    </p>
                  </div>
                  <Badge
                    variant={
                      tkt.priority === 'urgent'
                        ? 'danger'
                        : tkt.priority === 'high'
                        ? 'warning'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {tkt.priority}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;

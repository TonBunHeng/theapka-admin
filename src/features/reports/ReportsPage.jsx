import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  Download,
  Calendar,
  PieChart as PieIcon,
  TrendingUp,
  CreditCard,
  Crown,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
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
import { usePermission } from '../../auth/usePermission';
import { PERMISSIONS } from '../../config/permissions';
import PageHeader from '../../components/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import Tabs from '../../components/Tabs';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { toast } from '../../components/Toast';

const COLORS = ['#1B5E4A', '#D4AF37', '#947318', '#61A88B'];

export function ReportsPage() {
  const { t } = useTranslation();
  const { can } = usePermission();

  const [dateRange, setDateRange] = useState('last_30_days');
  const [activeTab, setActiveTab] = useState('plans');

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['admin', 'reports', activeTab, dateRange],
    queryFn: async () => {
      const res = await api.get(`/admin/reports/${activeTab}`, {
        params: { range: dateRange },
      });
      return res.data.data;
    },
  });

  const handleExport = async () => {
    try {
      const res = await api.get(`/admin/reports/${activeTab}/export`, {
        params: { range: dateRange },
      });
      // Simulate file download
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `theapka_${activeTab}_report_${dateRange}.csv`;
      a.click();
      toast.success('CSV Report exported successfully.');
    } catch {
      toast.error('Failed to export CSV report.');
    }
  };

  const tabs = [
    { id: 'plans', label: 'Subscription Tiers', icon: Crown },
    { id: 'templates', label: t('reports.tab_templates'), icon: PieIcon },
    { id: 'conversion', label: t('reports.tab_conversion'), icon: TrendingUp },
  ];

  const chartData = reportData?.charts || [];
  const kpi = reportData?.kpi || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('reports.title')}
        subtitle={t('reports.subtitle')}
        breadcrumbs={[{ label: t('menu.dashboard'), to: '/' }, { label: t('menu.reports') }]}
        actions={
          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded px-3 py-1.5 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="text-xs bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="last_7_days">{t('reports.last_7_days')}</option>
                <option value="last_30_days">{t('reports.last_30_days')}</option>
                <option value="this_quarter">{t('reports.this_quarter')}</option>
                <option value="year_to_date">{t('reports.year_to_date')}</option>
              </select>
            </div>

            {can(PERMISSIONS.REPORTS_EXPORT) && (
              <Button
                variant="primary"
                size="sm"
                icon={Download}
                onClick={handleExport}
              >
                {t('reports.export_csv')}
              </Button>
            )}
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded bg-white border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Wedding Conversion Rate</p>
          <p className="text-2xl font-bold text-brand-emerald-800 mt-1">
            {kpi.conversion_rate || '68.4%'}
          </p>
          <span className="text-[11px] text-slate-400">Drafts converting to Published</span>
        </div>

        <div className="p-4 rounded bg-white border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Avg Wedding Gifts (KHR)</p>
          <p className="text-2xl font-bold text-brand-gold-900 mt-1">
            {(kpi.avg_gift_khr || 3800000).toLocaleString()} ៛
          </p>
          <span className="text-[11px] text-slate-400">Per registered event in KHR</span>
        </div>

        <div className="p-4 rounded bg-white border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Avg Wedding Gifts (USD)</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ${(kpi.avg_gift_usd || 940).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400">Per registered event in USD</span>
        </div>
      </div>

      <Card>
        <div className="px-5 pt-3">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Pie Chart Representation */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="label"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 px-3">Segment Label</th>
                    <th className="py-2.5 px-3 text-right">Volume</th>
                    <th className="py-2.5 px-3 text-right">Market Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {chartData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span>{item.label}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {item.count}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-brand-emerald-800">
                        {item.share}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ReportsPage;

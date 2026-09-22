import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from './Card';
import { Skeleton } from './Skeleton';
import { cn } from '../lib/utils';

export function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend, // { value: '+12%', isUp: true }
  variant = 'emerald', // 'emerald' | 'gold' | 'neutral'
  loading = false,
  className,
}) {
  const iconVariants = {
    emerald: 'bg-brand-emerald-50 text-brand-emerald-700 border border-brand-emerald-200/50',
    gold: 'bg-brand-gold-50 text-brand-gold-700 border border-brand-gold-200/50',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  if (loading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-10 rounded" />
          </div>
          <Skeleton className="h-7 w-32 mb-1.5" />
          <Skeleton className="h-3.5 w-40" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden hover:border-slate-300 transition-all shadow-xs', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          </div>

          {Icon && (
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded',
                iconVariants[variant] || iconVariants.emerald
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>

        {(subtext || trend) && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded',
                  trend.isUp
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-rose-700 bg-rose-50'
                )}
              >
                {trend.isUp ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {trend.value}
              </span>
            )}
            {subtext && <span className="text-slate-500">{subtext}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StatCard;

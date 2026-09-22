import React from 'react';
import { useTranslation } from 'react-i18next';
import { FolderOpen } from 'lucide-react';
import { cn } from '../lib/utils';
import Button from './Button';

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  compact = false,
  className,
}) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center rounded border border-dashed border-slate-300 bg-white/60 p-8',
        compact ? 'py-6 px-4' : 'py-14 px-6',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3.5">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-800 mb-1">
        {title || t('common.no_results')}
      </h3>
      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
        {description || t('common.no_results_desc')}
      </p>
      {actionLabel && onAction && (
        <Button
          size="sm"
          variant="secondary"
          icon={actionIcon}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;

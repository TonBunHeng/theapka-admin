import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, RotateCcw } from 'lucide-react';
import Button from './Button';
import { cn } from '../lib/utils';

export function FilterBar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder,
  filters = [], // [{ key, label, value, options: [{ value, label }], onChange }]
  onReset,
  children,
  className,
}) {
  const { t } = useTranslation();
  const [localSearch, setLocalSearch] = useState(searchValue);

  // Sync internal state when external searchValue changes
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  // 300ms debounce for search query
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== searchValue && onSearchChange) {
        onSearchChange(localSearch);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [localSearch, searchValue, onSearchChange]);

  const hasActiveFilters =
    Boolean(localSearch) ||
    filters.some((f) => f.value && f.value !== '' && f.value !== 'all');

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded border border-slate-200 mb-4',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2.5 flex-1">
        {/* Debounced Search */}
        {onSearchChange && (
          <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={searchPlaceholder || t('common.search')}
              className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-emerald-100 focus:border-brand-emerald-600 transition-colors"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  onSearchChange('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Dropdown Filters */}
        {filters.map((filter) => (
          <div key={filter.key} className="min-w-[140px]">
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="w-full py-1.5 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-emerald-100 focus:border-brand-emerald-600 transition-colors"
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Reset Button */}
        {hasActiveFilters && onReset && (
          <Button
            size="sm"
            variant="ghost"
            icon={RotateCcw}
            onClick={() => {
              setLocalSearch('');
              onReset();
            }}
            className="text-slate-500 hover:text-slate-900 h-8"
          >
            {t('common.reset')}
          </Button>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {children}
        </div>
      )}
    </div>
  );
}

export default FilterBar;

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { TableSkeleton } from './Skeleton';
import EmptyState from './EmptyState';
import Button from './Button';

export function DataTable({
  columns,
  data = [],
  // Server-side pagination & sorting
  pageCount = 1,
  pageIndex = 0,
  pageSize = 15,
  totalItems = 0,
  onPaginationChange,
  sorting = [],
  onSortingChange,
  // Row selection
  enableRowSelection = false,
  rowSelection = {},
  onRowSelectionChange,
  getRowId = (row, index) => row.id || index,
  // Status states
  isLoading = false,
  isError = false,
  onRetry,
  errorMessage,
  emptyTitle,
  emptyDescription,
  className,
}) {
  const { t } = useTranslation();

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
      sorting,
      rowSelection,
    },
    onPaginationChange,
    onSortingChange,
    onRowSelectionChange,
    getRowId,
    manualPagination: true,
    manualSorting: true,
    enableRowSelection,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading && data.length === 0) {
    return <TableSkeleton rows={pageSize > 10 ? 10 : pageSize} cols={columns.length} />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-rose-50/50 rounded border border-rose-200 text-center">
        <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
        <h4 className="text-sm font-semibold text-rose-900 mb-1">
          {errorMessage || t('common.error')}
        </h4>
        <p className="text-xs text-rose-700 mb-4 max-w-md">
          Unable to retrieve table data from the server. Please check your network connection.
        </p>
        {onRetry && (
          <Button size="sm" variant="danger-outline" onClick={onRetry}>
            {t('common.retry')}
          </Button>
        )}
      </div>
    );
  }

  const rows = table.getRowModel().rows;

  return (
    <div className={cn('w-full flex flex-col bg-white rounded border border-slate-200 overflow-hidden shadow-xs', className)}>
      {/* Table Container */}
      <div className="relative overflow-x-auto min-h-[300px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-2xs z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded bg-white shadow-md border border-slate-200 text-xs font-medium text-slate-700">
              <span className="w-2 h-2 rounded-full bg-brand-emerald-600 animate-ping" />
              <span>{t('common.loading')}</span>
            </div>
          </div>
        )}

        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header */}
          <thead className="bg-slate-50/90 text-slate-600 border-b border-slate-200 font-semibold sticky top-0 z-1">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        'py-3 px-4 text-slate-700 font-semibold tracking-wide select-none',
                        canSort && 'cursor-pointer hover:bg-slate-100 transition-colors'
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {canSort && (
                          <span className="text-slate-400">
                            {isSorted === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-brand-emerald-700" />
                            ) : isSorted === 'desc' ? (
                              <ArrowDown className="w-3.5 h-3.5 text-brand-emerald-700" />
                            ) : (
                              <ArrowUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'hover:bg-slate-50/80 transition-colors group',
                    row.getIsSelected() && 'bg-brand-emerald-50/40'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="py-3 px-4 text-slate-700 align-middle leading-normal"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center"
                >
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    compact
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          {enableRowSelection && Object.keys(rowSelection).length > 0 && (
            <span className="font-semibold text-brand-emerald-800 bg-brand-emerald-50 px-2 py-0.5 rounded border border-brand-emerald-200">
              {Object.keys(rowSelection).length} {t('common.selected')}
            </span>
          )}
          <span>
            {totalItems > 0 ? (
              <>
                Showing <strong className="text-slate-800">{pageIndex * pageSize + 1}</strong> to{' '}
                <strong className="text-slate-800">
                  {Math.min((pageIndex + 1) * pageSize, totalItems)}
                </strong>{' '}
                of <strong className="text-slate-800">{totalItems}</strong> entries
              </>
            ) : (
              '0 entries'
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5">
            <span>{t('common.rows_per_page')}:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                if (onPaginationChange) {
                  onPaginationChange({ pageIndex: 0, pageSize: newSize });
                }
              }}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-emerald-500"
            >
              {[10, 15, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Page Indicators & Controls */}
          <div className="flex items-center gap-1">
            <span className="mr-1">
              {t('common.page')} <strong className="text-slate-800">{pageIndex + 1}</strong> {t('common.of')}{' '}
              <strong className="text-slate-800">{Math.max(1, pageCount)}</strong>
            </span>

            <Button
              size="icon-sm"
              variant="secondary"
              disabled={pageIndex === 0 || isLoading}
              onClick={() => table.setPageIndex(0)}
              title="First page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="icon-sm"
              variant="secondary"
              disabled={pageIndex === 0 || isLoading}
              onClick={() => table.previousPage()}
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="icon-sm"
              variant="secondary"
              disabled={pageIndex >= pageCount - 1 || isLoading}
              onClick={() => table.nextPage()}
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="icon-sm"
              variant="secondary"
              disabled={pageIndex >= pageCount - 1 || isLoading}
              onClick={() => table.setPageIndex(pageCount - 1)}
              title="Last page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataTable;

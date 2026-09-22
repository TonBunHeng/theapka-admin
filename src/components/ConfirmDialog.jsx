import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = 'danger',
  requiresReason = true,
  reasonPlaceholder,
  loading = false,
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setReasonError('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (requiresReason && !reason.trim()) {
      setReasonError(t('common.reason_required'));
      return;
    }
    setReasonError('');
    onConfirm(reason.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2.5">
          <div
            className={
              variant === 'danger'
                ? 'p-1.5 rounded bg-rose-50 text-rose-600 border border-rose-200'
                : 'p-1.5 rounded bg-amber-50 text-amber-600 border border-amber-200'
            }
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span>{title}</span>
        </div>
      }
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText || t('common.cancel')}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmText || t('common.confirm')}
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm text-slate-600">
        {description && <p className="leading-relaxed">{description}</p>}

        {requiresReason && (
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>{t('common.reason')}</span>
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError) setReasonError('');
              }}
              placeholder={reasonPlaceholder || t('common.reason_required')}
              className={`w-full rounded border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                reasonError
                  ? 'border-rose-300 focus:ring-rose-200 text-rose-900'
                  : 'border-slate-300 focus:border-brand-emerald-600 focus:ring-brand-emerald-100'
              }`}
            />
            {reasonError && (
              <p className="text-xs text-rose-600 font-medium">{reasonError}</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ConfirmDialog;

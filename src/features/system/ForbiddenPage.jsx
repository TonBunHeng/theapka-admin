import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import Button from '../../components/Button';

export function ForbiddenPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded border border-rose-200 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold tracking-widest text-rose-600 uppercase">
          HTTP Error 403
        </span>

        <h1 className="text-2xl font-bold text-slate-900 mt-1 mb-2">
          {t('permissions.denied_title')}
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          {t('permissions.denied_desc')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="secondary"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
          >
            {t('common.back')}
          </Button>

          <Button
            variant="primary"
            icon={Home}
            onClick={() => navigate('/')}
            className="w-full sm:w-auto"
          >
            {t('permissions.return_dashboard')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ForbiddenPage;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileQuestion, Home } from 'lucide-react';
import Button from '../../components/Button';

export function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded border border-slate-200 flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
          HTTP Error 404
        </span>

        <h1 className="text-2xl font-bold text-slate-900 mt-1 mb-2">
          Page Not Found
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          The requested administrative resource does not exist or has been relocated.
        </p>

        <Button
          variant="primary"
          icon={Home}
          onClick={() => navigate('/')}
          className="w-full sm:w-auto mx-auto"
        >
          {t('permissions.return_dashboard')}
        </Button>
      </div>
    </div>
  );
}

export default NotFoundPage;

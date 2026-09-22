import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function AuthLayout() {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'km' ? 'en' : 'km';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-emerald-950 via-slate-900 to-slate-950 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle decorative gold ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top bar with language switcher */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between z-10 py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-brand-emerald-800 border border-brand-gold-400/40 flex items-center justify-center shadow-md">
            <span className="text-brand-gold-400 font-bold text-sm">TK</span>
          </div>
          <span className="text-white font-bold tracking-tight text-base sm:text-lg">
            {t('app.name')}
          </span>
        </div>

        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 text-white/90 hover:bg-white/20 transition-all text-xs font-medium border border-white/10 backdrop-blur-xs"
        >
          <Globe className="w-3.5 h-3.5 text-brand-gold-400" />
          <span>{i18n.language === 'km' ? 'English' : 'ភាសាខ្មែរ'}</span>
        </button>
      </div>

      {/* Center card */}
      <div className="w-full flex items-center justify-center py-8 z-10">
        <div className="w-full max-w-md bg-white rounded p-6 sm:p-8 shadow-2xl border border-slate-100">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-6xl mx-auto text-center text-xs text-slate-400 z-10 py-2">
        <p>© {new Date().getFullYear()} TheapKa Online Co., Ltd. All rights reserved.</p>
        <p className="mt-1 text-slate-500 text-[11px]">{t('app.tagline')}</p>
      </div>
    </div>
  );
}

export default AuthLayout;

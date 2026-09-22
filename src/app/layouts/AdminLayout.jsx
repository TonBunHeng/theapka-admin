import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Globe,
  Bell,
  Search,
  AlertTriangle,
  Shield,
  LayoutDashboard,
  Users,
  HeartHandshake,
  MailOpen,
  Palette,
  FileText,
  Contact2,
  CreditCard,
  BarChart3,
  LifeBuoy,
  Image,
  Megaphone,
  ShieldCheck,
  Lock,
  Settings,
  KeyRound,
  ScrollText,
  Wallet,
  DatabaseBackup,
  Wrench,
} from 'lucide-react';
import { MENU_GROUPS } from '../../config/menu';
import { useAuthStore } from '../../auth/authStore';
import { usePermission } from '../../auth/usePermission';
import api from '../../lib/api';
import { cn } from '../../lib/utils';
import Badge from '../../components/Badge';

// Map icon string names to Lucide icons
const iconMap = {
  LayoutDashboard,
  Users,
  HeartHandshake,
  MailOpen,
  Palette,
  FileText,
  Contact2,
  CreditCard,
  BarChart3,
  LifeBuoy,
  Image,
  Megaphone,
  ShieldCheck,
  Lock,
  Settings,
  KeyRound,
  ScrollText,
  Wallet,
  DatabaseBackup,
  Wrench,
};

export function AdminLayout() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout } = useAuthStore();
  const { can, isSuperAdmin } = usePermission();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Reactive maintenance mode state
  const { data: maintenanceData } = useQuery({
    queryKey: ['super-admin', 'maintenance'],
    queryFn: async () => {
      const res = await api.get('/super-admin/maintenance');
      return res.data?.data;
    },
    staleTime: 10000,
  });
  const maintenanceActive = Boolean(maintenanceData?.enabled);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const toggleLanguage = () => {
    const next = i18n.language === 'km' ? 'en' : 'km';
    i18n.changeLanguage(next);
  };

  // Filter menu groups dynamically by permissions and roles
  const filteredGroups = MENU_GROUPS.map((group) => {
    // If group requires super_admin, check isSuperAdmin
    if (group.role === 'super_admin' && !isSuperAdmin) {
      return null;
    }

    // Filter items inside the group
    const visibleItems = group.items.filter((item) => {
      if (item.role === 'super_admin' && !isSuperAdmin) return false;
      if (item.permission && !can(item.permission)) return false;
      return true;
    });

    if (visibleItems.length === 0) return null;

    return {
      ...group,
      items: visibleItems,
    };
  }).filter(Boolean);

  return (
    <div className="h-screen h-dvh bg-slate-50 flex flex-col overflow-hidden antialiased">
      {/* 1. Global Maintenance Alert Banner (when active) */}
      {maintenanceActive && (
        <div className="bg-rose-600 text-white text-xs font-semibold py-2 px-4 flex items-center justify-center gap-2 shadow-sm z-50 animate-pulse shrink-0">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-300" />
          <span>{t('system.maintenance.active_banner')}</span>
        </div>
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* 2. Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-2xs lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* 3. Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-200 select-none lg:static lg:h-full lg:shrink-0',
            mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0',
            isCollapsed ? 'lg:w-20' : 'lg:w-64'
          )}
        >
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
            <NavLink to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-brand-emerald-800 border border-brand-gold-400/50 flex items-center justify-center shadow-md shrink-0">
                <span className="text-brand-gold-400 font-bold text-base">TK</span>
              </div>
              {(!isCollapsed || mobileMenuOpen) && (
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white tracking-tight leading-tight">
                    {t('app.name')}
                  </span>
                  <span className="text-[10px] text-brand-gold-400 font-medium">
                    {isSuperAdmin ? 'Super Admin Portal' : 'Staff Back-Office'}
                  </span>
                </div>
              )}
            </NavLink>

            {/* Collapse button on desktop */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            {/* Close button on mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {filteredGroups.map((group) => (
              <div key={group.key} className="space-y-1">
                {(!isCollapsed || mobileMenuOpen) && (
                  <div className="flex items-center justify-between px-3 mb-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      {t(group.labelKey)}
                    </span>
                    {group.isSystem && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-gold-900/60 text-brand-gold-400 border border-brand-gold-700/50 font-bold">
                        SUPER
                      </span>
                    )}
                  </div>
                )}

                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = iconMap[item.icon] || LayoutDashboard;
                    return (
                      <NavLink
                        key={item.key}
                        to={item.path}
                        title={isCollapsed && !mobileMenuOpen ? t(item.labelKey) : undefined}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-all group relative',
                            isActive
                              ? 'bg-brand-emerald-700 text-white shadow-sm font-semibold'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80',
                            isCollapsed && !mobileMenuOpen && 'justify-center px-2'
                          )
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                        {(!isCollapsed || mobileMenuOpen) && (
                          <span className="truncate flex-1">{t(item.labelKey)}</span>
                        )}
                        {(!isCollapsed || mobileMenuOpen) && item.badgeKey && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
                            {t(item.badgeKey)}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer User Info */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/50">
            <div
              className={cn(
                'flex items-center gap-3 p-2 rounded transition-colors',
                isCollapsed && !mobileMenuOpen ? 'justify-center' : ''
              )}
            >
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Staff'}`}
                alt={user?.name}
                className="w-8 h-8 rounded bg-slate-800 object-cover border border-slate-700 shrink-0"
              />
              {(!isCollapsed || mobileMenuOpen) && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate leading-tight">
                    {user?.name || 'Staff User'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {user?.email || 'staff@theapka.com'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* 4. Main Body */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Topbar */}
          <header className="h-16 shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between z-30 shadow-2xs">
            <div className="flex items-center gap-3">
              {/* Mobile menu hamburger toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Quick Jump Search */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-slate-100/80 border border-slate-200 text-xs text-slate-500 w-64 focus-within:bg-white focus-within:border-brand-emerald-500 focus-within:ring-2 focus-within:ring-brand-emerald-100 transition-all">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Global search (couples, weddings)..."
                  className="bg-transparent border-none text-slate-800 text-xs focus:outline-none w-full"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      navigate(`/users?search=${encodeURIComponent(e.target.value.trim())}`);
                    }
                  }}
                />
              </div>
            </div>

            {/* Right Topbar actions */}
            <div className="flex items-center gap-3">
              {/* Role Indicator Badge */}
              {isSuperAdmin ? (
                <Badge variant="gold" size="sm">
                  <Shield className="w-3 h-3 mr-0.5 text-brand-gold-600" />
                  <span>{t('common.super_admin_badge')}</span>
                </Badge>
              ) : (
                <Badge variant="brand" size="sm">
                  <span>{t('common.admin_badge')}</span>
                </Badge>
              )}

              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                title="Toggle Language"
              >
                <Globe className="w-3.5 h-3.5 text-brand-emerald-700" />
                <span>{i18n.language === 'km' ? 'ភាសាខ្មែរ' : 'EN'}</span>
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-100 transition-colors"
                >
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Staff'}`}
                    alt={user?.name}
                    className="w-8 h-8 rounded bg-slate-200 object-cover border border-slate-200"
                  />
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded bg-white shadow-xl border border-slate-200 p-2 z-50 animate-popup-scale origin-top-right">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {user?.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {user?.email}
                        </p>
                      </div>

                      <NavLink
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{t('menu.profile')}</span>
                      </NavLink>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded transition-colors mt-1"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Scrollable Page Content Container */}
          <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;

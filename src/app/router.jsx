import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
import RequireAuth from '../auth/RequireAuth';
import RequireRole from '../auth/RequireRole';
import RequirePermission from '../auth/RequirePermission';
import { PERMISSIONS } from '../config/permissions';
import { Skeleton } from '../components/Skeleton';

// Lazy-loaded Feature Pages
const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('../features/auth/ForgotPasswordPage'));

const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const UsersListPage = lazy(() => import('../features/users/UsersListPage'));
const UserDetailPage = lazy(() => import('../features/users/UserDetailPage'));

const WeddingsListPage = lazy(() => import('../features/weddings/WeddingsListPage'));
const WeddingDetailPage = lazy(() => import('../features/weddings/WeddingDetailPage'));

const InvitationsListPage = lazy(() => import('../features/invitations/InvitationsListPage'));
const TemplatesListPage = lazy(() => import('../features/templates/TemplatesListPage'));
const TemplateEditorPage = lazy(() => import('../features/templates/TemplateEditorPage'));
const ContentListPage = lazy(() => import('../features/content/ContentListPage'));

const GuestsCrossSearchPage = lazy(() => import('../features/guests/GuestsCrossSearchPage'));

const PaymentsListPage = lazy(() => import('../features/payments/PaymentsListPage'));
const PaymentDetailPage = lazy(() => import('../features/payments/PaymentDetailPage'));
const ReportsPage = lazy(() => import('../features/reports/ReportsPage'));

const SupportListPage = lazy(() => import('../features/support/SupportListPage'));
const TicketDetailPage = lazy(() => import('../features/support/TicketDetailPage'));

const MediaGridPage = lazy(() => import('../features/media/MediaGridPage'));
const AnnouncementsListPage = lazy(() => import('../features/announcements/AnnouncementsListPage'));
const ProfilePage = lazy(() => import('../features/profile/ProfilePage'));

// Super Admin Only System Suite (Bundled separately)
const AdminAccountsPage = lazy(() => import('../features/system/admin-accounts/AdminAccountsPage'));
const RolesPermissionsPage = lazy(() => import('../features/system/roles-permissions/RolesPermissionsPage'));
const SettingsPage = lazy(() => import('../features/system/settings/SettingsPage'));
const SecurityPage = lazy(() => import('../features/system/security/SecurityPage'));
const AuditLogsPage = lazy(() => import('../features/system/audit-logs/AuditLogsPage'));
const PaymentConfigPage = lazy(() => import('../features/system/payment-config/PaymentConfigPage'));
const BackupPage = lazy(() => import('../features/system/backup/BackupPage'));
const MaintenancePage = lazy(() => import('../features/system/maintenance/MaintenancePage'));

const ForbiddenPage = lazy(() => import('../features/system/ForbiddenPage'));
const NotFoundPage = lazy(() => import('../features/system/NotFoundPage'));

function PageLoader() {
  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-80 w-full mt-6" />
    </div>
  );
}

export const router = createBrowserRouter([
  // Public Auth Routes
  {
    element: (
      <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
        <AuthLayout />
      </Suspense>
    ),
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },

  // Protected Admin Application Routes
  {
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: '/',
        element: (
          <RequirePermission permission={PERMISSIONS.DASHBOARD_VIEW}>
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: '/users',
        element: (
          <RequirePermission permission={PERMISSIONS.USERS_VIEW}>
            <Suspense fallback={<PageLoader />}>
              <UsersListPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: '/users/:id',
        element: (
          <RequirePermission permission={PERMISSIONS.USERS_VIEW}>
            <Suspense fallback={<PageLoader />}>
              <UserDetailPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: '/weddings',
        element: (
          <RequirePermission permission={PERMISSIONS.WEDDINGS_VIEW}>
            <Suspense fallback={<PageLoader />}>
              <WeddingsListPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: '/weddings/:id',
        element: (
          <RequirePermission permission={PERMISSIONS.WEDDINGS_VIEW}>
            <Suspense fallback={<PageLoader />}>
              <WeddingDetailPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: '/invitations',
        element: (
          <RequirePermission permission={PERMISSIONS.INVITATIONS_VIEW}>
            <Suspense fallback={<PageLoader />}>
              <InvitationsListPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: '/templates',
        element: (
          <RequirePermission permission={PERMISSIONS.TEMPLATES_VIEW}>
            <Suspense fallback={<PageLoader />}>
              <TemplatesListPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: '/templates/new',
        element: (
          <RequirePermission permission={PERMISSIONS.TEMPLATES_VIEW}>
            <Suspense fallback={<PageLoader />}>
              <TemplateEditorPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: '/templates/:id',
        element: (
          <RequirePermission permission={PERMISSIONS.TEMPLATES_VIEW}>
            <Suspense fallback={<PageLoader />}>
              <TemplateEditorPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: '/content',
        element: (
          <RequirePermission permission={PERMISSIONS.CONTENT_VIEW}>
            <Suspense fallback={<PageLoader />}>
              <ContentListPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: '/guests',
        element: (
          <RequirePermission permission={PERMISSIONS.GUESTS_VIEW}>
            <Suspense fallback={<PageLoader />}>
              <GuestsCrossSearchPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: '/payments',
        element: (
          <RequirePermission permission={PERMISSIONS.PAYMENTS_VIEW}>
            <Suspense fallback={<PageLoader />}>
              <PaymentsListPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: '/payments/:id',
        element: (
          <RequirePermission permission={PERMISSIONS.PAYMENTS_VIEW}>
            <Suspense fallback={<PageLoader />}>
              <PaymentDetailPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: '/reports',
        element: (
          <RequirePermission permission={PERMISSIONS.REPORTS_VIEW}>
            <Suspense fallback={<PageLoader />}>
              <ReportsPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: '/support',
        element: (
          <RequirePermission permission={PERMISSIONS.SUPPORT_VIEW}>
            <Suspense fallback={<PageLoader />}>
              <SupportListPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: '/support/:id',
        element: (
          <RequirePermission permission={PERMISSIONS.SUPPORT_VIEW}>
            <Suspense fallback={<PageLoader />}>
              <TicketDetailPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: '/media',
        element: (
          <RequirePermission permission={PERMISSIONS.MEDIA_VIEW}>
            <Suspense fallback={<PageLoader />}>
              <MediaGridPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: '/announcements',
        element: (
          <RequirePermission permission={PERMISSIONS.ANNOUNCEMENTS_VIEW}>
            <Suspense fallback={<PageLoader />}>
              <AnnouncementsListPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: '/profile',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProfilePage />
          </Suspense>
        ),
      },

      // Super Admin Only Area (/system/*) - Strictly guarded by RequireRole
      {
        path: '/system/admins',
        element: (
          <RequireRole role="super_admin">
            <Suspense fallback={<PageLoader />}>
              <AdminAccountsPage />
            </Suspense>
          </RequireRole>
        ),
      },
      {
        path: '/system/roles',
        element: (
          <RequireRole role="super_admin">
            <Suspense fallback={<PageLoader />}>
              <RolesPermissionsPage />
            </Suspense>
          </RequireRole>
        ),
      },
      {
        path: '/system/settings',
        element: (
          <RequireRole role="super_admin">
            <Suspense fallback={<PageLoader />}>
              <SettingsPage />
            </Suspense>
          </RequireRole>
        ),
      },
      {
        path: '/system/security',
        element: (
          <RequireRole role="super_admin">
            <Suspense fallback={<PageLoader />}>
              <SecurityPage />
            </Suspense>
          </RequireRole>
        ),
      },
      {
        path: '/system/audit-logs',
        element: (
          <RequireRole role="super_admin">
            <Suspense fallback={<PageLoader />}>
              <AuditLogsPage />
            </Suspense>
          </RequireRole>
        ),
      },
      {
        path: '/system/payment-config',
        element: (
          <RequireRole role="super_admin">
            <Suspense fallback={<PageLoader />}>
              <PaymentConfigPage />
            </Suspense>
          </RequireRole>
        ),
      },
      {
        path: '/system/backup',
        element: (
          <RequireRole role="super_admin">
            <Suspense fallback={<PageLoader />}>
              <BackupPage />
            </Suspense>
          </RequireRole>
        ),
      },
      {
        path: '/system/maintenance',
        element: (
          <RequireRole role="super_admin">
            <Suspense fallback={<PageLoader />}>
              <MaintenancePage />
            </Suspense>
          </RequireRole>
        ),
      },
    ],
  },

  // Error Pages
  {
    path: '/403',
    element: (
      <Suspense fallback={<div />}>
        <ForbiddenPage />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<div />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);

export default router;

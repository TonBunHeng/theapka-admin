import { PERMISSIONS } from './permissions';

/**
 * Data-driven navigation menu config.
 * Filtered dynamically in the sidebar based on user permissions and role.
 * Empty groups are automatically hidden.
 */
export const MENU_GROUPS = [
  {
    key: 'overview',
    labelKey: 'menu.groups.overview',
    items: [
      {
        key: 'dashboard',
        labelKey: 'menu.dashboard',
        icon: 'LayoutDashboard',
        path: '/',
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
    ],
  },
  {
    key: 'platform',
    labelKey: 'menu.groups.platform',
    items: [
      {
        key: 'users',
        labelKey: 'menu.users',
        icon: 'Users',
        path: '/users',
        permission: PERMISSIONS.USERS_VIEW,
      },
      {
        key: 'weddings',
        labelKey: 'menu.weddings',
        icon: 'HeartHandshake',
        path: '/weddings',
        permission: PERMISSIONS.WEDDINGS_VIEW,
      },
      {
        key: 'invitations',
        labelKey: 'menu.invitations',
        icon: 'MailOpen',
        path: '/invitations',
        permission: PERMISSIONS.INVITATIONS_VIEW,
      },
      {
        key: 'templates',
        labelKey: 'menu.templates',
        icon: 'Palette',
        path: '/templates',
        permission: PERMISSIONS.TEMPLATES_VIEW,
      },
      {
        key: 'content',
        labelKey: 'menu.content',
        icon: 'FileText',
        path: '/content',
        permission: PERMISSIONS.CONTENT_VIEW,
      },
      {
        key: 'guests',
        labelKey: 'menu.guests',
        icon: 'Contact2',
        path: '/guests',
        permission: PERMISSIONS.GUESTS_VIEW,
        badgeKey: 'common.private',
      },
    ],
  },
  {
    key: 'business',
    labelKey: 'menu.groups.business',
    items: [
      {
        key: 'payments',
        labelKey: 'menu.payments',
        icon: 'CreditCard',
        path: '/payments',
        permission: PERMISSIONS.PAYMENTS_VIEW,
      },
      {
        key: 'reports',
        labelKey: 'menu.reports',
        icon: 'BarChart3',
        path: '/reports',
        permission: PERMISSIONS.REPORTS_VIEW,
      },
    ],
  },
  {
    key: 'support',
    labelKey: 'menu.groups.support',
    items: [
      {
        key: 'support',
        labelKey: 'menu.support',
        icon: 'LifeBuoy',
        path: '/support',
        permission: PERMISSIONS.SUPPORT_VIEW,
      },
      {
        key: 'media',
        labelKey: 'menu.media',
        icon: 'Image',
        path: '/media',
        permission: PERMISSIONS.MEDIA_VIEW,
      },
      {
        key: 'announcements',
        labelKey: 'menu.announcements',
        icon: 'Megaphone',
        path: '/announcements',
        permission: PERMISSIONS.ANNOUNCEMENTS_VIEW,
      },
    ],
  },
  {
    key: 'system',
    labelKey: 'menu.groups.system',
    role: 'super_admin', // Whole group requires Super Admin
    isSystem: true,
    items: [
      {
        key: 'admin_accounts',
        labelKey: 'menu.admin_accounts',
        icon: 'ShieldCheck',
        path: '/system/admins',
        role: 'super_admin',
      },
      {
        key: 'roles_permissions',
        labelKey: 'menu.roles_permissions',
        icon: 'Lock',
        path: '/system/roles',
        role: 'super_admin',
      },
      {
        key: 'settings',
        labelKey: 'menu.settings',
        icon: 'Settings',
        path: '/system/settings',
        role: 'super_admin',
      },
      {
        key: 'security',
        labelKey: 'menu.security',
        icon: 'KeyRound',
        path: '/system/security',
        role: 'super_admin',
      },
      {
        key: 'audit_logs',
        labelKey: 'menu.audit_logs',
        icon: 'ScrollText',
        path: '/system/audit-logs',
        role: 'super_admin',
      },
      {
        key: 'payment_config',
        labelKey: 'menu.payment_config',
        icon: 'Wallet',
        path: '/system/payment-config',
        role: 'super_admin',
      },
      {
        key: 'backup',
        labelKey: 'menu.backup',
        icon: 'DatabaseBackup',
        path: '/system/backup',
        role: 'super_admin',
      },
      {
        key: 'maintenance',
        labelKey: 'menu.maintenance',
        icon: 'Wrench',
        path: '/system/maintenance',
        role: 'super_admin',
      },
    ],
  },
];

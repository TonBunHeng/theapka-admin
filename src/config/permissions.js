/**
 * Single source of truth for all permission keys.
 * Format: resource.action
 */
export const PERMISSIONS = {
  // Overview
  DASHBOARD_VIEW: 'dashboard.view',

  // Platform
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_SUSPEND: 'users.suspend',
  USERS_DELETE: 'users.delete',

  WEDDINGS_VIEW: 'weddings.view',
  WEDDINGS_EDIT: 'weddings.edit',
  WEDDINGS_SUSPEND: 'weddings.suspend',
  WEDDINGS_DELETE: 'weddings.delete',

  INVITATIONS_VIEW: 'invitations.view',
  INVITATIONS_MODERATE: 'invitations.moderate',

  TEMPLATES_VIEW: 'templates.view',
  TEMPLATES_CREATE: 'templates.create',
  TEMPLATES_EDIT: 'templates.edit',
  TEMPLATES_PUBLISH: 'templates.publish',
  TEMPLATES_DELETE: 'templates.delete',

  CONTENT_VIEW: 'content.view',
  CONTENT_EDIT: 'content.edit',

  // Couple private data (not granted by default)
  GUESTS_VIEW: 'guests.view',
  GUESTS_EXPORT: 'guests.export',
  GIFTS_VIEW: 'gifts.view',

  // Business
  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_VERIFY: 'payments.verify',
  PAYMENTS_REFUND: 'payments.refund',

  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',

  // Support & Operations
  SUPPORT_VIEW: 'support.view',
  SUPPORT_REPLY: 'support.reply',
  SUPPORT_ASSIGN: 'support.assign',
  SUPPORT_CLOSE: 'support.close',

  MEDIA_VIEW: 'media.view',
  MEDIA_DELETE: 'media.delete',

  ANNOUNCEMENTS_VIEW: 'announcements.view',
  ANNOUNCEMENTS_CREATE: 'announcements.create',
  ANNOUNCEMENTS_EDIT: 'announcements.edit',
  ANNOUNCEMENTS_DELETE: 'announcements.delete',

  // Super Admin only (System)
  ADMINS_VIEW: 'admins.view',
  ADMINS_CREATE: 'admins.create',
  ADMINS_EDIT: 'admins.edit',
  ADMINS_DISABLE: 'admins.disable',

  ROLES_VIEW: 'roles.view',
  ROLES_EDIT: 'roles.edit',

  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',

  SECURITY_VIEW: 'security.view',
  SECURITY_EDIT: 'security.edit',

  AUDIT_VIEW: 'audit.view',

  PAYMENT_CONFIG_VIEW: 'payment_config.view',
  PAYMENT_CONFIG_EDIT: 'payment_config.edit',

  BACKUP_VIEW: 'backup.view',
  BACKUP_CREATE: 'backup.create',
  BACKUP_RESTORE: 'backup.restore',

  MAINTENANCE_TOGGLE: 'maintenance.toggle',
};

/**
 * Permissions grouped by resource for UI matrices and role definitions
 */
export const PERMISSION_GROUPS = [
  {
    resource: 'dashboard',
    labelKey: 'permissions.groups.dashboard',
    permissions: [PERMISSIONS.DASHBOARD_VIEW],
  },
  {
    resource: 'users',
    labelKey: 'permissions.groups.users',
    permissions: [
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_EDIT,
      PERMISSIONS.USERS_SUSPEND,
      PERMISSIONS.USERS_DELETE,
    ],
  },
  {
    resource: 'weddings',
    labelKey: 'permissions.groups.weddings',
    permissions: [
      PERMISSIONS.WEDDINGS_VIEW,
      PERMISSIONS.WEDDINGS_EDIT,
      PERMISSIONS.WEDDINGS_SUSPEND,
      PERMISSIONS.WEDDINGS_DELETE,
    ],
  },
  {
    resource: 'invitations',
    labelKey: 'permissions.groups.invitations',
    permissions: [
      PERMISSIONS.INVITATIONS_VIEW,
      PERMISSIONS.INVITATIONS_MODERATE,
    ],
  },
  {
    resource: 'templates',
    labelKey: 'permissions.groups.templates',
    permissions: [
      PERMISSIONS.TEMPLATES_VIEW,
      PERMISSIONS.TEMPLATES_CREATE,
      PERMISSIONS.TEMPLATES_EDIT,
      PERMISSIONS.TEMPLATES_PUBLISH,
      PERMISSIONS.TEMPLATES_DELETE,
    ],
  },
  {
    resource: 'content',
    labelKey: 'permissions.groups.content',
    permissions: [PERMISSIONS.CONTENT_VIEW, PERMISSIONS.CONTENT_EDIT],
  },
  {
    resource: 'guests_gifts',
    labelKey: 'permissions.groups.guests_gifts',
    isPrivate: true,
    permissions: [
      PERMISSIONS.GUESTS_VIEW,
      PERMISSIONS.GUESTS_EXPORT,
      PERMISSIONS.GIFTS_VIEW,
    ],
  },
  {
    resource: 'payments',
    labelKey: 'permissions.groups.payments',
    permissions: [
      PERMISSIONS.PAYMENTS_VIEW,
      PERMISSIONS.PAYMENTS_VERIFY,
      PERMISSIONS.PAYMENTS_REFUND,
    ],
  },
  {
    resource: 'reports',
    labelKey: 'permissions.groups.reports',
    permissions: [PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_EXPORT],
  },
  {
    resource: 'support',
    labelKey: 'permissions.groups.support',
    permissions: [
      PERMISSIONS.SUPPORT_VIEW,
      PERMISSIONS.SUPPORT_REPLY,
      PERMISSIONS.SUPPORT_ASSIGN,
      PERMISSIONS.SUPPORT_CLOSE,
    ],
  },
  {
    resource: 'media',
    labelKey: 'permissions.groups.media',
    permissions: [PERMISSIONS.MEDIA_VIEW, PERMISSIONS.MEDIA_DELETE],
  },
  {
    resource: 'announcements',
    labelKey: 'permissions.groups.announcements',
    permissions: [
      PERMISSIONS.ANNOUNCEMENTS_VIEW,
      PERMISSIONS.ANNOUNCEMENTS_CREATE,
      PERMISSIONS.ANNOUNCEMENTS_EDIT,
      PERMISSIONS.ANNOUNCEMENTS_DELETE,
    ],
  },
  // System group (Super Admin only - can NEVER be assigned to Admin)
  {
    resource: 'system',
    labelKey: 'permissions.groups.system',
    isSystem: true,
    permissions: [
      PERMISSIONS.ADMINS_VIEW,
      PERMISSIONS.ADMINS_CREATE,
      PERMISSIONS.ADMINS_EDIT,
      PERMISSIONS.ADMINS_DISABLE,
      PERMISSIONS.ROLES_VIEW,
      PERMISSIONS.ROLES_EDIT,
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.SETTINGS_EDIT,
      PERMISSIONS.SECURITY_VIEW,
      PERMISSIONS.SECURITY_EDIT,
      PERMISSIONS.AUDIT_VIEW,
      PERMISSIONS.PAYMENT_CONFIG_VIEW,
      PERMISSIONS.PAYMENT_CONFIG_EDIT,
      PERMISSIONS.BACKUP_VIEW,
      PERMISSIONS.BACKUP_CREATE,
      PERMISSIONS.BACKUP_RESTORE,
      PERMISSIONS.MAINTENANCE_TOGGLE,
    ],
  },
];

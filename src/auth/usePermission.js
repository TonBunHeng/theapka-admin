import { useAuthStore } from './authStore';

export function usePermission() {
  const role = useAuthStore((s) => s.role);
  const permissions = useAuthStore((s) => s.permissions) || [];
  const isSuperAdmin = role === 'super_admin';

  /**
   * Check single permission key.
   * Super Admin is treated as having all permissions unconditionally.
   */
  const can = (permission) => {
    if (!permission) return true;
    if (isSuperAdmin) return true;
    return permissions.includes(permission);
  };

  /**
   * Check if user possesses at least one permission in the list
   */
  const canAny = (perms = []) => {
    if (!perms || perms.length === 0) return true;
    if (isSuperAdmin) return true;
    return perms.some((p) => permissions.includes(p));
  };

  /**
   * Check if user possesses all listed permissions
   */
  const canAll = (perms = []) => {
    if (!perms || perms.length === 0) return true;
    if (isSuperAdmin) return true;
    return perms.every((p) => permissions.includes(p));
  };

  const hasRole = (requiredRole) => {
    if (!requiredRole) return true;
    return role === requiredRole;
  };

  return {
    can,
    canAny,
    canAll,
    hasRole,
    isSuperAdmin,
    role,
    permissions,
  };
}

export default usePermission;

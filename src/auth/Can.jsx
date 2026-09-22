import React from 'react';
import { usePermission } from './usePermission';

export function Can({
  permission,
  any = [],
  all = [],
  role,
  fallback = null,
  children,
}) {
  const { can, canAny, canAll, hasRole } = usePermission();

  if (role && !hasRole(role)) {
    return fallback;
  }

  if (permission && !can(permission)) {
    return fallback;
  }

  if (any.length > 0 && !canAny(any)) {
    return fallback;
  }

  if (all.length > 0 && !canAll(all)) {
    return fallback;
  }

  return <>{children}</>;
}

export default Can;

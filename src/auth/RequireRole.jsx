import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermission } from './usePermission';

export function RequireRole({ role, children }) {
  const { hasRole, isSuperAdmin } = usePermission();

  // If super_admin is required, check isSuperAdmin
  if (role === 'super_admin' && !isSuperAdmin) {
    return <Navigate to="/403" replace />;
  }

  if (role && !hasRole(role) && !isSuperAdmin) {
    return <Navigate to="/403" replace />;
  }

  return children;
}

export default RequireRole;

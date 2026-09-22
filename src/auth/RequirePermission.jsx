import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermission } from './usePermission';

export function RequirePermission({ permission, any = [], children }) {
  const { can, canAny } = usePermission();

  if (permission && !can(permission)) {
    return <Navigate to="/403" replace />;
  }

  if (any.length > 0 && !canAny(any)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}

export default RequirePermission;

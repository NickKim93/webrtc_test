// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function ProtectedRoute({
  children,
  needRoles,
}: {
  children: React.ReactNode;
  needRoles?: string[];
}) {
  const { token, roles } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (needRoles && needRoles.length && !needRoles.some((r) => roles.includes(r))) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

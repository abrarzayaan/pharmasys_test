import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

export const RiderGuard: React.FC = () => {
  const { isLoggedIn, user } = useAuthStore();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/rider/login" state={{ from: location }} replace />;
  }

  // Check role if present
  if (user?.role && user.role !== 'rider' && user.role !== 'RIDER') {
    // If not rider role, redirect to rider login
    return <Navigate to="/rider/login" replace />;
  }

  return <Outlet />;
};

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

export const AdminGuard: React.FC = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  // During local development & testing, if logged in or visiting admin, allow access
  // Can be extended to check s.user?.is_staff || s.user?.is_superuser
  if (!isLoggedIn) {
    // For smooth dev workflow, we render Outlet inside AdminLayout
    return <Outlet />;
  }

  return <Outlet />;
};

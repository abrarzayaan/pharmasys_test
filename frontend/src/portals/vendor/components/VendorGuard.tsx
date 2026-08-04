import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { vendorApi, type VendorProfile } from '@/api/vendor.api';
import { Loader2 } from 'lucide-react';

export const VendorGuard: React.FC = () => {
  const { isLoggedIn } = useAuthStore();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<VendorProfile | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      checkVendorStatus();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const checkVendorStatus = async () => {
    try {
      setLoading(true);
      const res = await vendorApi.getProfile();
      setProfile(res);
    } catch (err) {
      console.error('Vendor guard status check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <Navigate to="/vendor/login" state={{ from: location }} replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex flex-col items-center justify-center text-[#e0e6ed]">
        <Loader2 size={36} className="text-emerald-500 animate-spin mb-3" />
        <p className="text-sm font-medium text-gray-400">Authenticating Vendor Partner Portal...</p>
      </div>
    );
  }

  // If vendor status is pending/inactive and not already on pending page
  if (
    profile &&
    profile.verification_status !== 'verified' &&
    location.pathname !== '/vendor/pending' &&
    location.pathname !== '/vendor/profile'
  ) {
    return <Navigate to="/vendor/pending" replace />;
  }

  return <Outlet />;
};

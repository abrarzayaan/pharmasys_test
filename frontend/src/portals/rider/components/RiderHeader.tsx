import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Bike, 
  LayoutDashboard, 
  PackageCheck, 
  UserCheck, 
  LogOut, 
  ShieldAlert, 
  CheckCircle2, 
  Power,
  Navigation,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { riderApi } from '@/api/rider.api';
import type { RiderProfile, AvailabilityStatus } from '@/api/rider.api';
import toast from 'react-hot-toast';

interface RiderHeaderProps {
  profile: RiderProfile | null;
  onRefreshProfile?: () => void;
  onOpenProfileModal?: () => void;
}

export const RiderHeader: React.FC<RiderHeaderProps> = ({
  profile,
  onRefreshProfile,
  onOpenProfileModal
}) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/rider/login');
  };

  const handleToggleAvailability = async () => {
    if (!profile) return;
    const current = profile.availability_status;
    const nextStatus: AvailabilityStatus = current === 'online' ? 'offline' : 'online';
    
    setUpdatingStatus(true);
    try {
      await riderApi.updateAvailability(nextStatus);
      toast.success(`Duty status updated to ${nextStatus.toUpperCase()}`);
      if (onRefreshProfile) onRefreshProfile();
    } catch (err: any) {
      toast.error('Failed to change availability status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const isProfileComplete = profile?.is_profile_complete ?? false;

  return (
    <header className="sticky top-0 z-40 bg-surface-card/85 backdrop-blur-xl border-b border-border-default/80 shadow-lg shadow-cyan-950/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Logo & Rider Express Badge */}
          <div className="flex items-center space-x-3">
            <Link to="/rider/dashboard" className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-emerald-500 to-teal-400 p-[1px] shadow-lg shadow-cyan-500/25 transition-transform duration-300 group-hover:scale-105">
                <div className="w-full h-full bg-surface-base/90 backdrop-blur-md rounded-[11px] flex items-center justify-center text-cyan-400">
                  <Bike className="w-5 h-5 text-cyan-400 group-hover:animate-bounce" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-head font-black text-lg bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                    PharmaSys
                  </span>
                  <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30 uppercase tracking-widest">
                    <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                    <span>RIDER</span>
                  </span>
                </div>
                <p className="text-[10px] text-content-muted font-mono tracking-tight hidden sm:block">
                  Express Logistics Portal
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-surface-base/60 p-1 rounded-2xl border border-border-default/60 shadow-inner">
            <Link
              to="/rider/dashboard"
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                location.pathname === '/rider/dashboard' || location.pathname === '/rider'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface-subtle/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/rider/orders"
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                location.pathname.startsWith('/rider/orders')
                  ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface-subtle/60'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Deliveries</span>
            </Link>

            <Link
              to="/rider/profile"
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                location.pathname === '/rider/profile'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface-subtle/60'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>My Profile</span>
            </Link>
          </nav>

          {/* Right: Duty Status, Completeness Pill & User Account */}
          <div className="flex items-center space-x-2.5">
            
            {/* Duty Status Button with Neon Dot */}
            <button
              onClick={handleToggleAvailability}
              disabled={updatingStatus || !profile}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-300 shadow-sm ${
                profile?.availability_status === 'online'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-emerald-500/10 hover:bg-emerald-500/25'
                  : profile?.availability_status === 'busy'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-amber-500/10 hover:bg-amber-500/25'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-rose-500/10 hover:bg-rose-500/25'
              }`}
              title="Click to toggle duty status"
            >
              <span className="relative flex h-2 w-2">
                {profile?.availability_status === 'online' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  profile?.availability_status === 'online' ? 'bg-emerald-400' :
                  profile?.availability_status === 'busy' ? 'bg-amber-400' : 'bg-rose-400'
                }`}></span>
              </span>
              <span className="capitalize font-mono tracking-tight">{profile?.availability_status || 'offline'}</span>
            </button>

            {/* Profile Completeness Pill */}
            {onOpenProfileModal && (
              <button
                onClick={onOpenProfileModal}
                className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isProfileComplete
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20'
                    : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10 hover:border-amber-400 animate-pulse'
                }`}
              >
                {isProfileComplete ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Verified Rider</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>Complete Profile</span>
                  </>
                )}
              </button>
            )}

            {/* User Profile Pill & Logout */}
            <div className="flex items-center space-x-2 pl-2 border-l border-border-default/60">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white font-bold text-xs shadow-md border border-cyan-400/30">
                {user?.first_name ? user.first_name[0].toUpperCase() : 'R'}
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-content-muted hover:text-rose-400 hover:bg-rose-500/15 rounded-xl transition-all"
                title="Sign out of Rider Portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="flex md:hidden border-t border-border-default/60 py-2 justify-around text-xs">
          <Link
            to="/rider/dashboard"
            className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition-all ${
              location.pathname === '/rider/dashboard' || location.pathname === '/rider'
                ? 'text-cyan-400 font-bold bg-cyan-500/10'
                : 'text-content-muted'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/rider/orders"
            className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition-all ${
              location.pathname.startsWith('/rider/orders')
                ? 'text-cyan-400 font-bold bg-cyan-500/10'
                : 'text-content-muted'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>Deliveries</span>
          </Link>

          <Link
            to="/rider/profile"
            className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition-all ${
              location.pathname === '/rider/profile'
                ? 'text-cyan-400 font-bold bg-cyan-500/10'
                : 'text-content-muted'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Profile</span>
          </Link>
        </div>

      </div>
    </header>
  );
};

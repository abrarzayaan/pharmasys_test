import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  Store,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  Clock,
  Building2,
  TrendingUp,
  PackageCheck,
  ShieldAlert,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { vendorApi, type VendorProfile } from '@/api/vendor.api';
import toast from 'react-hot-toast';

export const VendorLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profile = await vendorApi.getProfile();
      setVendorProfile(profile);
    } catch (err: any) {
      console.error('Failed to fetch vendor profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out from Vendor Partner Portal');
    navigate('/vendor/login');
  };

  const navItems = [
    {
      label: 'Dashboard & Dispatches',
      path: '/vendor',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: 'Stock Inventory',
      path: '/vendor/inventory',
      icon: Boxes,
      badge: null,
    },
    {
      label: 'Store Profile',
      path: '/vendor/profile',
      icon: Store,
      badge: null,
    },
  ];

  const isVerified = vendorProfile?.verification_status === 'verified';

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#e0e6ed] flex flex-col font-sans antialiased">
      {/* ── Top Navigation Header ────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#12141c]/90 backdrop-blur-md border-b border-[#1e2230] px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#1a1d2b] border border-[#2a2e42] text-gray-300 hover:text-white"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/vendor" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#12141c] rounded-[10px] flex items-center justify-center">
                <Building2 size={20} className="text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  {vendorProfile?.name || 'PharmaSys Vendor'}
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                  Partner Portal
                </span>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <span>Branch: {vendorProfile?.address?.city || 'Dhaka'}</span>
                <span>•</span>
                <span className="capitalize">{vendorProfile?.type || 'Pharmacy'}</span>
              </p>
            </div>
          </Link>
        </div>

        {/* Right Header Status & Profile */}
        <div className="flex items-center gap-3">
          {/* Verification Badge */}
          {loading ? (
            <div className="h-7 w-24 bg-[#1a1d2b] rounded-full animate-pulse"></div>
          ) : isVerified ? (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-medium">
              <CheckCircle2 size={14} />
              <span>Verified Store</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-medium">
              <Clock size={14} />
              <span>Verification Pending</span>
            </div>
          )}

          {/* Quick Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1d2b] hover:bg-rose-500/10 text-gray-300 hover:text-rose-400 border border-[#2a2e42] hover:border-rose-500/30 text-xs font-medium transition-all"
            title="Log Out"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* ── Main Layout Body ────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Sidebar Navigation ────────────────────────────── */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#12141c] border-r border-[#1e2230] p-4 flex flex-col justify-between transition-transform duration-300 transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="space-y-6">
            <div className="px-3 py-2 bg-[#171a26] rounded-xl border border-[#24283b]">
              <div className="text-xs text-gray-400">Logistics Hub Status</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-semibold text-white">Live Dispatches</span>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/vendor' && location.pathname.startsWith(item.path));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600/20 to-teal-600/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1d2b]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-gray-400'} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer Info Box */}
          <div className="pt-4 border-t border-[#1e2230] text-xs text-gray-400 space-y-2">
            <div className="flex items-center justify-between">
              <span>Sync Engine</span>
              <span className="text-emerald-400 font-mono">DRF v1.2</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#171a26] border border-[#24283b] text-[11px] leading-relaxed">
              💡 Orders confirmed by Admin deduct stock automatically from your pharmacy inventory.
            </div>
          </div>
        </aside>

        {/* Overlay backdrop for mobile drawer */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          />
        )}

        {/* ── Main View Content Area ────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-[#0b0c10] p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

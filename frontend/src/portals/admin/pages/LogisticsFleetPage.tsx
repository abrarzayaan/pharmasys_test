import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  MapPin,
  Phone,
  Search,
  RefreshCw,
  Bike,
  CheckCircle2,
  Clock,
  UserCheck,
  Package,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  adminRiderVerificationApi,
  type AdminRiderItem,
  type ActiveRiderOrder,
} from '../api/adminRiderVerification.api';

export const LogisticsFleetPage: React.FC = () => {
  const [riders, setRiders] = useState<AdminRiderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'BUSY' | 'FREE'>('ALL');

  const loadRiders = async () => {
    setLoading(true);
    try {
      const data = await adminRiderVerificationApi.getRiders();
      setRiders(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load logistics rider list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRiders();
  }, []);

  const handleVerifyRider = async (riderId: number, name: string) => {
    try {
      await adminRiderVerificationApi.updateRiderVerification(riderId, {
        verification_status: 'verified',
        availability_status: 'online',
      });
      toast.success(`Rider ${name} verified & activated successfully!`);
      loadRiders();
    } catch {
      toast.error('Failed to update rider verification status');
    }
  };

  const handleToggleStatus = async (rider: AdminRiderItem, newStatus: 'online' | 'offline' | 'busy') => {
    try {
      await adminRiderVerificationApi.updateRiderVerification(rider.id, {
        availability_status: newStatus,
      });
      toast.success(`${rider.rider_name} status set to ${newStatus}`);
      loadRiders();
    } catch {
      toast.error('Failed to update rider status');
    }
  };

  // Filtered riders list
  const filteredRiders = useMemo(() => {
    return riders.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        r.rider_name.toLowerCase().includes(q) ||
        r.phone_number.includes(searchQuery) ||
        r.vehicle_type.toLowerCase().includes(q) ||
        (r.active_orders &&
          r.active_orders.some(
            (o) =>
              o.order_number.toLowerCase().includes(q) ||
              o.delivery_address.toLowerCase().includes(q) ||
              o.order_status.toLowerCase().includes(q)
          ));

      if (!matchesSearch) return false;

      if (filterMode === 'BUSY') return !r.is_free && r.active_orders && r.active_orders.length > 0;
      if (filterMode === 'FREE') return r.is_free || !r.active_orders || r.active_orders.length === 0;
      return true;
    });
  }, [riders, searchQuery, filterMode]);

  // Operational metrics
  const totalCount = riders.length;
  const busyCount = riders.filter((r) => !r.is_free && r.active_orders && r.active_orders.length > 0).length;
  const freeCount = riders.filter((r) => r.is_free || !r.active_orders || r.active_orders.length === 0).length;

  const getOrderStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'DISPATCHED':
      case 'OUT_FOR_DELIVERY':
      case 'IN_TRANSIT':
        return 'bg-primary-500/10 text-primary-400 border-primary-500/20';
      case 'PROCESSING':
      case 'CONFIRMED':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  const getVehicleIcon = (v: string) => {
    const vehicle = v.toLowerCase();
    if (vehicle.includes('cycle') || vehicle.includes('bike')) return '🚲';
    return '🏍️';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary-950 via-bg-card to-bg-card p-6 rounded-3xl border border-primary-500/30 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 text-xs font-mono font-semibold">
            <Truck className="w-3.5 h-3.5" />
            <span>Section 11 — Fleet Logistics & Rider Duty Tracking</span>
          </div>
          <h1 className="text-2xl font-head font-bold text-content-primary">
            Rider Live Status & Delivery Orders
          </h1>
          <p className="text-xs text-content-muted">
            Overview of all registered riders, active assigned delivery orders, current statuses, and delivery destination addresses.
          </p>
        </div>

        <button
          onClick={loadRiders}
          className="px-4 py-2 rounded-xl bg-bg-surface hover:bg-bg-hover border border-bg-border text-content-primary font-bold text-xs shadow-glow transition-all flex items-center space-x-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Status</span>
        </button>
      </div>

      {/* Operational Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-bg-card border border-bg-border shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-content-muted">Total Fleet Riders</span>
            <UserCheck className="w-4 h-4 text-primary-400" />
          </div>
          <div className="text-2xl font-head font-extrabold text-content-primary">{totalCount}</div>
          <div className="text-[11px] text-content-muted font-mono">Registered delivery partner accounts</div>
        </div>

        <div className="p-5 rounded-2xl bg-bg-card border border-bg-border shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-content-muted">Working On Order</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-head font-extrabold text-amber-400">{busyCount}</div>
          <div className="text-[11px] text-amber-400/80 font-mono">Currently assigned active deliveries</div>
        </div>

        <div className="p-5 rounded-2xl bg-bg-card border border-bg-border shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-content-muted">Free / Available</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-head font-extrabold text-emerald-400">{freeCount}</div>
          <div className="text-[11px] text-emerald-400/80 font-mono">Available for new order assignment</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-bg-card border border-bg-border">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-content-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rider by name, phone, order #, or delivery address..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-bg-surface border border-bg-border text-xs text-content-primary focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold text-content-muted">Status:</span>
          <div className="flex rounded-xl bg-bg-surface border border-bg-border p-1">
            {(
              [
                { key: 'ALL', label: `All Riders (${totalCount})` },
                { key: 'BUSY', label: `📦 On Order (${busyCount})` },
                { key: 'FREE', label: `🟢 Free (${freeCount})` },
              ] as const
            ).map((st) => (
              <button
                key={st.key}
                onClick={() => setFilterMode(st.key)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  filterMode === st.key
                    ? 'bg-primary-500/20 text-primary-400 font-bold border border-primary-500/30 shadow-glow'
                    : 'text-content-muted hover:text-content-primary'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Riders Status Roster */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center rounded-3xl bg-bg-card border border-bg-border text-content-muted font-mono text-xs">
            Loading riders duty status...
          </div>
        ) : filteredRiders.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-bg-card border border-bg-border text-content-muted font-mono text-xs space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-amber-400 opacity-60" />
            <p>No riders match your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRiders.map((rider) => {
              const isWorking = !rider.is_free && rider.active_orders && rider.active_orders.length > 0;

              return (
                <div
                  key={rider.id}
                  className={`p-5 rounded-3xl bg-bg-card border transition-all shadow-card ${
                    isWorking
                      ? 'border-indigo-500/30 hover:border-indigo-500/50'
                      : 'border-emerald-500/30 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Rider Info */}
                    <div className="flex items-start space-x-4 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 border ${
                          isWorking
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        }`}
                      >
                        {getVehicleIcon(rider.vehicle_type)}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="font-bold text-base text-content-primary">{rider.rider_name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-bg-surface border border-bg-border text-[10px] font-mono font-semibold text-content-secondary">
                            {rider.vehicle_type} {rider.vehicle_number ? `(${rider.vehicle_number})` : ''}
                          </span>
                          {rider.verification_status === 'pending' ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold">
                              Verification Pending
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                              Verified Account
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-content-muted font-mono flex-wrap">
                          <span className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-content-muted" />
                            <span>{rider.phone_number || 'N/A'}</span>
                          </span>
                          {rider.nid_no && <span>🪪 NID: {rider.nid_no}</span>}
                          {rider.license_no && <span>🪪 License: {rider.license_no}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Overall Duty Status Badge */}
                    <div className="flex items-center space-x-3 shrink-0">
                      {isWorking ? (
                        <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-xs font-bold flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                          <span>WORKING ON ORDER ({rider.active_orders.length})</span>
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>FREE / AVAILABLE</span>
                        </div>
                      )}

                      {rider.verification_status === 'pending' && (
                        <button
                          onClick={() => handleVerifyRider(rider.id, rider.rider_name)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-glow transition-all flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Active Orders or Free Status Display */}
                  <div className="mt-4 pt-4 border-t border-bg-border">
                    {isWorking ? (
                      <div className="space-y-2">
                        <div className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                          📦 Current Active Delivery Tasks:
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {rider.active_orders.map((order: ActiveRiderOrder) => (
                            <div
                              key={order.id}
                              className="p-3.5 rounded-2xl bg-bg-surface border border-indigo-500/20 space-y-1.5 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-extrabold text-indigo-400 text-sm">
                                  #{order.order_number}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase ${getOrderStatusBadge(
                                    order.order_status
                                  )}`}
                                >
                                  {order.order_status}
                                </span>
                              </div>
                              <div className="text-content-primary flex items-start space-x-1.5 text-xs pt-1">
                                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                <span className="font-medium">
                                  <strong className="text-content-muted">Address:</strong>{' '}
                                  {order.delivery_address || 'Address details unavailable'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-400 font-mono">
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Rider is currently free with no active delivery tasks. Ready for dispatch!</span>
                        </div>
                        <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          Idle / Free
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

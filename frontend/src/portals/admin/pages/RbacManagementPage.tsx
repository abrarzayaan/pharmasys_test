import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Users,
  History,
  Plus,
  Search,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Eye,
  Edit3,
  Trash2,
  Key,
  Sliders,
  Filter,
  Check,
  Sparkles,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminRbacApi } from '../api/adminRbac.api';
import type {
  StaffRole as AdminRole,
  StaffUser,
  SecurityAuditLog as AuditLog,
  ModulePermissions as PermissionMatrix,
} from '../api/adminRbac.api';

export const RbacManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'staff' | 'audit'>('roles');

  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [staffStatusFilter, setStaffStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('all');

  // Role Form Modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [roleFormName, setRoleFormName] = useState('');
  const [roleFormDesc, setRoleFormDesc] = useState('');
  const [roleFormPermissions, setRoleFormPermissions] = useState<PermissionMatrix>({
    orders: 'READ',
    catalog: 'READ',
    users: 'NONE',
    prescriptions: 'NONE',
    cms: 'NONE',
    analytics: 'READ',
  });

  // Staff Form Modal
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffFormUsername, setStaffFormUsername] = useState('');
  const [staffFormEmail, setStaffFormEmail] = useState('');
  const [staffFormPhone, setStaffFormPhone] = useState('');
  const [staffFormRoleId, setStaffFormRoleId] = useState<number>(1);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    const [rData, sData, aData] = await Promise.all([
      adminRbacApi.getRoles(),
      adminRbacApi.getStaffUsers(),
      adminRbacApi.getAuditLogs(),
    ]);
    setRoles(rData);
    setStaffList(sData);
    setAuditLogs(aData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Staff
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchesSearch =
        (s.full_name || '').toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
        (s.phone_number || '').includes(staffSearchQuery) ||
        (s.role_name || '').toLowerCase().includes(staffSearchQuery.toLowerCase());

      const matchesStatus =
        staffStatusFilter === 'all'
          ? true
          : staffStatusFilter === 'active'
          ? s.status === 'ACTIVE'
          : s.status === 'SUSPENDED';

      return matchesSearch && matchesStatus;
    });
  }, [staffList, staffSearchQuery, staffStatusFilter]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((a) => {
      const matchesSearch =
        (a.description || '').toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
        (a.actor_name || '').toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
        (a.module || '').toLowerCase().includes(auditSearchQuery.toLowerCase());

      const matchesAction =
        auditActionFilter === 'all' ? true : a.action_type === auditActionFilter;

      return matchesSearch && matchesAction;
    });
  }, [auditLogs, auditSearchQuery, auditActionFilter]);

  // Handle Role Creation / Editing
  const openCreateRoleModal = () => {
    setSelectedRoleId(null);
    setRoleFormName('');
    setRoleFormDesc('');
    setRoleFormPermissions({
      orders: 'READ',
      catalog: 'READ',
      users: 'NONE',
      prescriptions: 'NONE',
      cms: 'NONE',
      analytics: 'READ',
    });
    setIsRoleModalOpen(true);
  };

  const openEditRoleModal = (role: AdminRole) => {
    setSelectedRoleId(role.id);
    setRoleFormName(role.name);
    setRoleFormDesc(role.description);
    setRoleFormPermissions(role.permissions);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormName.trim()) {
      toast.error('Role name is required');
      return;
    }

    const payload = {
      name: roleFormName,
      description: roleFormDesc,
      permissions: roleFormPermissions,
      is_system: false,
    };

    if (selectedRoleId) {
      await adminRbacApi.updateRole(selectedRoleId, payload);
      toast.success('Role permissions updated successfully!');
    } else {
      await adminRbacApi.createRole(payload);
      toast.success('New sub-admin role created!');
    }

    setIsRoleModalOpen(false);
    loadData();
  };

  const handleDeleteRole = async (role: AdminRole) => {
    if (role.is_system) {
      toast.error('System preset roles cannot be deleted.');
      return;
    }
    if (confirm(`Are you sure you want to delete role: ${role.name}?`)) {
      const success = await adminRbacApi.deleteRole(role.id);
      if (success) {
        toast.success('Role removed');
        loadData();
      } else {
        toast.error('Failed to delete role');
      }
    }
  };

  // Handle Staff User Onboarding
  const openCreateStaffModal = () => {
    setStaffFormUsername('');
    setStaffFormEmail('');
    setStaffFormPhone('');
    setStaffFormRoleId(roles[0]?.id || 1);
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffFormUsername.trim() || !staffFormPhone.trim()) {
      toast.error('Username and Phone Number are required');
      return;
    }

    await adminRbacApi.createStaffUser({
      full_name: staffFormUsername,
      email: staffFormEmail || `${staffFormUsername}@pharmasys.com`,
      phone_number: staffFormPhone,
      role_id: staffFormRoleId,
      role_name: 'Staff',
      status: 'ACTIVE',
    });

    toast.success('Staff user onboarded successfully!');
    setIsStaffModalOpen(false);
    loadData();
  };

  const handleToggleStaffStatus = async (staff: StaffUser) => {
    const nextStatus = staff.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await adminRbacApi.updateStaffStatus(staff.id, nextStatus);
    toast.success(staff.status === 'ACTIVE' ? `Staff ${staff.full_name} suspended` : `Staff ${staff.full_name} activated`);
    loadData();
  };

  // Module Label Mapper
  const moduleLabels: Record<keyof PermissionMatrix, { label: string; icon: string }> = {
    orders: { label: 'Order Fulfillment & Dispatch', icon: '📦' },
    catalog: { label: 'Product Catalog & Pricing', icon: '💊' },
    users: { label: 'Customer User Accounts', icon: '👥' },
    prescriptions: { label: 'Prescription Rx Verification', icon: '📋' },
    cms: { label: 'Dynamic Homepage CMS', icon: '🖼️' },
    analytics: { label: 'Sales Analytics & Reports', icon: '📊' },
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary-950 via-bg-card to-bg-card p-6 rounded-3xl border border-primary-500/30 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 text-xs font-mono font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Section 06 — Granular User Access Control (RBAC)</span>
          </div>
          <h1 className="text-2xl font-head font-bold text-content-primary">
            Staff Roles, Privileges & Audit Log
          </h1>
          <p className="text-xs text-content-muted">
            Configure sub-admin permissions, onboard staff users, and track real-time security audit trails.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={openCreateRoleModal}
            className="px-3.5 py-2 rounded-xl bg-bg-surface border border-bg-border hover:border-primary-500/40 text-content-primary font-bold text-xs shadow-sm transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4 text-primary-400" />
            <span>Create Role</span>
          </button>

          <button
            onClick={openCreateStaffModal}
            className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-glow transition-all flex items-center space-x-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>Onboard Staff</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-bg-card border border-bg-border shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-content-muted">Total Staff Users</span>
            <Users className="w-4 h-4 text-primary-400" />
          </div>
          <div className="text-2xl font-head font-extrabold text-content-primary">{staffList.length}</div>
          <div className="text-[10px] text-emerald-400 font-mono">
            {staffList.filter((s) => s.status === 'ACTIVE').length} Active Staff Accounts
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-bg-card border border-bg-border shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-content-muted">Defined Roles</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-head font-extrabold text-content-primary">{roles.length}</div>
          <div className="text-[10px] text-content-muted font-mono">Granular permission profiles</div>
        </div>

        <div className="p-5 rounded-2xl bg-bg-card border border-bg-border shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-content-muted">Suspended Staff</span>
            <Lock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-head font-extrabold text-rose-400">
            {staffList.filter((s) => s.status === 'SUSPENDED').length}
          </div>
          <div className="text-[10px] text-rose-400 font-mono">Access revoked</div>
        </div>

        <div className="p-5 rounded-2xl bg-bg-card border border-bg-border shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-content-muted">Audit Events</span>
            <History className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-head font-extrabold text-content-primary">{auditLogs.length}</div>
          <div className="text-[10px] text-amber-400 font-mono">Recorded activity log entries</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center border-b border-bg-border space-x-2">
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-5 py-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'roles'
              ? 'border-primary-500 text-primary-400'
              : 'border-transparent text-content-muted hover:text-content-primary'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Roles & Permission Matrix ({roles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`px-5 py-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'staff'
              ? 'border-primary-500 text-primary-400'
              : 'border-transparent text-content-muted hover:text-content-primary'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff User Directory ({staffList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-5 py-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'audit'
              ? 'border-primary-500 text-primary-400'
              : 'border-transparent text-content-muted hover:text-content-primary'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Security Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* ── TAB 1: ROLES & PERMISSION MATRIX ── */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <div
              key={role.id}
              className="p-6 rounded-3xl bg-bg-card border border-bg-border hover:border-primary-500/30 transition-all shadow-card space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="p-2 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
                      <ShieldCheck className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-head font-bold text-base text-content-primary">{role.name}</h3>
                      <div className="text-[10px] font-mono text-content-muted">
                        {role.member_count} Assigned Staff Users
                      </div>
                    </div>
                  </div>

                  {role.is_system ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      System Preset
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Custom Sub-Admin
                    </span>
                  )}
                </div>

                <p className="text-xs text-content-secondary line-clamp-2">{role.description}</p>

                {/* Permission Badges Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-bg-border/60">
                  {(Object.keys(moduleLabels) as Array<keyof PermissionMatrix>).map((mod) => {
                    const perm = role.permissions[mod];
                    const info = moduleLabels[mod];
                    return (
                      <div
                        key={String(mod)}
                        className="p-2 rounded-xl bg-bg-surface border border-bg-border flex items-center justify-between text-[11px]"
                      >
                        <span className="text-content-secondary truncate font-medium flex items-center space-x-1">
                          <span>{info.icon}</span>
                          <span className="truncate max-w-[110px]">{info.label}</span>
                        </span>
                        <span
                          className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded ${
                            perm === 'FULL' || (perm as any) === 'write'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : perm === 'READ' || (perm as any) === 'read'
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                              : 'bg-bg-base text-content-muted border border-bg-border'
                          }`}
                        >
                          {perm === 'FULL' || (perm as any) === 'write' ? 'Full Access' : perm === 'READ' || (perm as any) === 'read' ? 'Read Only' : 'No Access'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-bg-border">
                <button
                  onClick={() => openEditRoleModal(role as any)}
                  className="px-3 py-1.5 rounded-xl bg-bg-surface border border-bg-border hover:border-primary-500/40 text-primary-400 text-xs font-semibold flex items-center space-x-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Configure Matrix</span>
                </button>

                {!role.is_system && (
                  <button
                    onClick={() => handleDeleteRole(role as any)}
                    className="p-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:border-rose-500 text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 2: STAFF USER DIRECTORY ── */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-bg-card border border-bg-border">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-content-muted" />
              <input
                type="text"
                value={staffSearchQuery}
                onChange={(e) => setStaffSearchQuery(e.target.value)}
                placeholder="Search staff by name, email, phone, or role..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-bg-surface border border-bg-border text-xs text-content-primary focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-content-muted">Filter Status:</span>
              <div className="flex rounded-xl bg-bg-surface border border-bg-border p-1">
                {(['all', 'active', 'suspended'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStaffStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono capitalize transition-all ${
                      staffStatusFilter === st
                        ? 'bg-primary-500/20 text-primary-400 font-bold border border-primary-500/30'
                        : 'text-content-muted hover:text-content-primary'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-bg-card border border-bg-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-bg-border bg-bg-surface text-[11px] font-mono uppercase text-content-muted">
                    <th className="p-4">Staff User</th>
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">Assigned Role</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4">Last Login</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bg-border text-xs">
                  {filteredStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-bg-surface/50 transition-colors">
                      <td className="p-4 font-bold text-content-primary">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400 font-bold text-xs uppercase">
                            {(staff.full_name || 'S')[0]}
                          </div>
                          <div>
                            <div>{staff.full_name}</div>
                            <div className="text-[10px] text-content-muted font-mono">ID: #{staff.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 space-y-0.5">
                        <div className="text-content-primary">{staff.email}</div>
                        <div className="text-[11px] font-mono text-content-muted">{staff.phone_number}</div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {staff.role_name}
                        </span>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStaffStatus(staff)}
                          className="flex items-center space-x-2 text-xs font-bold"
                        >
                          {staff.status === 'ACTIVE' ? (
                            <ToggleRight className="w-6 h-6 text-emerald-400" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-rose-400" />
                          )}
                          <span className={staff.status === 'ACTIVE' ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
                            {staff.status}
                          </span>
                        </button>
                      </td>

                      <td className="p-4 font-mono text-content-muted text-[11px]">
                        {staff.joined_date ? new Date(staff.joined_date).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleStaffStatus(staff)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                            staff.status === 'ACTIVE'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          }`}
                        >
                          {staff.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: SYSTEM AUDIT LOGS ── */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-bg-card border border-bg-border">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-content-muted" />
              <input
                type="text"
                value={auditSearchQuery}
                onChange={(e) => setAuditSearchQuery(e.target.value)}
                placeholder="Search logs by actor, module, or description..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-bg-surface border border-bg-border text-xs text-content-primary focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-content-muted">Action Type:</span>
              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-bg-surface border border-bg-border text-xs font-mono text-content-primary focus:border-primary-500 focus:outline-none"
              >
                <option value="all">All Action Events</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="AUTH">AUTH</option>
                <option value="STATUS_CHANGE">STATUS_CHANGE</option>
              </select>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-bg-card border border-bg-border shadow-card space-y-4">
            <div className="space-y-3">
              {filteredAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-bg-surface border border-bg-border hover:border-primary-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start space-x-3">
                    <span
                      className={`px-2 py-1 rounded-lg font-mono font-bold text-[10px] shrink-0 ${
                        log.action_type === 'CREATE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : log.action_type === 'UPDATE'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          : log.action_type === 'DELETE'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {log.action_type}
                    </span>

                    <div className="space-y-0.5">
                      <div className="text-content-primary font-medium">{log.description}</div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-content-muted font-mono">
                        <span>
                          Actor: <strong className="text-primary-400">{log.actor_name}</strong>
                        </span>
                        <span>•</span>
                        <span>Action: {log.action_type}</span>
                        <span>•</span>
                        <span>Module: {log.module}</span>
                        <span>•</span>
                        <span>IP: {log.ip_address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono text-[11px] text-content-muted shrink-0 self-end sm:self-center">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 1: CONFIGURE ROLE & PERMISSIONS ── */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-card border border-bg-border rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-bg-border pb-3">
              <h2 className="text-lg font-head font-bold text-content-primary">
                {selectedRoleId ? 'Configure Role Permission Matrix' : 'Create New Sub-Admin Role'}
              </h2>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="text-content-muted hover:text-content-primary text-xs font-mono font-bold"
              >
                ✕ ESC
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-5">
              <div>
                <label className="block text-xs font-mono font-bold text-content-muted mb-1">
                  Role Profile Title *
                </label>
                <input
                  type="text"
                  required
                  value={roleFormName}
                  onChange={(e) => setRoleFormName(e.target.value)}
                  placeholder="e.g. Rx Verifier Lead"
                  className="w-full px-3.5 py-2 rounded-xl bg-bg-surface border border-bg-border text-xs text-content-primary focus:border-primary-500 focus:outline-none font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-content-muted mb-1">
                  Role Scope Description
                </label>
                <textarea
                  rows={2}
                  value={roleFormDesc}
                  onChange={(e) => setRoleFormDesc(e.target.value)}
                  placeholder="Briefly describe what this staff role is authorized to manage..."
                  className="w-full px-3.5 py-2 rounded-xl bg-bg-surface border border-bg-border text-xs text-content-primary focus:border-primary-500 focus:outline-none"
                />
              </div>

              {/* Granular Matrix Radio List */}
              <div className="space-y-3 pt-2 border-t border-bg-border">
                <label className="block text-xs font-mono font-bold text-content-muted">
                  Granular Permission Privileges Matrix
                </label>

                <div className="space-y-2">
                  {(Object.keys(moduleLabels) as Array<keyof PermissionMatrix>).map((mod) => {
                    const info = moduleLabels[mod];
                    const currentVal = roleFormPermissions[mod];
                    return (
                      <div
                        key={mod}
                        className="p-3 rounded-2xl bg-bg-surface border border-bg-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="font-bold text-content-primary flex items-center space-x-2">
                          <span>{info.icon}</span>
                          <span>{info.label}</span>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          {(['NONE', 'READ', 'FULL'] as const).map((lv) => (
                            <button
                              key={lv}
                              type="button"
                              onClick={() =>
                                setRoleFormPermissions({
                                  ...roleFormPermissions,
                                  [mod]: lv,
                                })
                              }
                              className={`px-3 py-1 rounded-lg text-xs font-mono capitalize border transition-all ${
                                currentVal === lv
                                  ? lv === 'FULL'
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
                                    : lv === 'READ'
                                    ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 font-bold'
                                    : 'bg-bg-base text-content-primary border-bg-border font-bold'
                                  : 'text-content-muted border-bg-border hover:text-content-primary'
                              }`}
                            >
                              {lv === 'FULL' ? 'Full Access' : lv === 'READ' ? 'Read Only' : 'No Access'}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-bg-border">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-bg-surface border border-bg-border text-xs font-semibold text-content-muted hover:text-content-primary"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-glow"
                >
                  Save Role Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: ONBOARD STAFF USER ── */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-card border border-bg-border rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-bg-border pb-3">
              <h2 className="text-lg font-head font-bold text-content-primary">Onboard New Staff User</h2>
              <button
                onClick={() => setIsStaffModalOpen(false)}
                className="text-content-muted hover:text-content-primary text-xs font-mono font-bold"
              >
                ✕ ESC
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-content-muted mb-1">
                  Staff Username *
                </label>
                <input
                  type="text"
                  required
                  value={staffFormUsername}
                  onChange={(e) => setStaffFormUsername(e.target.value)}
                  placeholder="e.g. karim_rx"
                  className="w-full px-3.5 py-2 rounded-xl bg-bg-surface border border-bg-border text-xs text-content-primary focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-content-muted mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={staffFormPhone}
                  onChange={(e) => setStaffFormPhone(e.target.value)}
                  placeholder="e.g. 01711223344"
                  className="w-full px-3.5 py-2 rounded-xl bg-bg-surface border border-bg-border text-xs text-content-primary focus:border-primary-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-content-muted mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={staffFormEmail}
                  onChange={(e) => setStaffFormEmail(e.target.value)}
                  placeholder="e.g. staff@pharmasys.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-bg-surface border border-bg-border text-xs text-content-primary focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-content-muted mb-1">
                  Assigned Sub-Admin Role *
                </label>
                <select
                  value={staffFormRoleId}
                  onChange={(e) => setStaffFormRoleId(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-bg-surface border border-bg-border text-xs text-content-primary focus:border-primary-500 focus:outline-none"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-bg-border">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-bg-surface border border-bg-border text-xs font-semibold text-content-muted hover:text-content-primary"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-glow"
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

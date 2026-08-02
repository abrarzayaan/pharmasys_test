import api from '../../../api/axios';

export interface PermissionMatrix {
  orders: 'none' | 'read' | 'write';
  catalog: 'none' | 'read' | 'write';
  users: 'none' | 'read' | 'write';
  prescriptions: 'none' | 'read' | 'write';
  cms: 'none' | 'read' | 'write';
  analytics: 'none' | 'read' | 'write';
}

export interface AdminRole {
  id: number;
  name: string;
  description: string;
  permissions: PermissionMatrix;
  user_count: number;
  is_system_preset?: boolean;
}

export interface StaffUser {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  role_id: number;
  role_name: string;
  is_active: boolean;
  last_login: string;
  date_joined: string;
}

export interface AuditLog {
  id: number;
  actor_username: string;
  actor_role: string;
  action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'AUTH' | 'STATUS_CHANGE';
  module: string;
  description: string;
  timestamp: string;
  ip_address: string;
}

const ROLES_STORAGE_KEY = 'pharmasys_admin_roles_v1';
const STAFF_STORAGE_KEY = 'pharmasys_admin_staff_v1';
const AUDIT_STORAGE_KEY = 'pharmasys_admin_audit_v1';

const defaultRoles: AdminRole[] = [
  {
    id: 1,
    name: 'Super Administrator',
    description: 'Master access to all system modules, configurations, staff onboarding, and analytics.',
    permissions: {
      orders: 'write',
      catalog: 'write',
      users: 'write',
      prescriptions: 'write',
      cms: 'write',
      analytics: 'write',
    },
    user_count: 2,
    is_system_preset: true,
  },
  {
    id: 2,
    name: 'Order & Dispatch Lead',
    description: 'Manages incoming orders, vendor item assignments, rider dispatches, and status updates.',
    permissions: {
      orders: 'write',
      catalog: 'read',
      users: 'read',
      prescriptions: 'write',
      cms: 'none',
      analytics: 'read',
    },
    user_count: 4,
    is_system_preset: true,
  },
  {
    id: 3,
    name: 'Pharmacy & Catalog Manager',
    description: 'Manages products, variants, dynamic bulk discounts, and inventory stock levels.',
    permissions: {
      orders: 'read',
      catalog: 'write',
      users: 'none',
      prescriptions: 'none',
      cms: 'read',
      analytics: 'read',
    },
    user_count: 3,
    is_system_preset: true,
  },
  {
    id: 4,
    name: 'Rx Prescription Verifier',
    description: 'Specialized pharmacist role for reviewing customer prescription uploads and order approval.',
    permissions: {
      orders: 'read',
      catalog: 'none',
      users: 'read',
      prescriptions: 'write',
      cms: 'none',
      analytics: 'none',
    },
    user_count: 2,
    is_system_preset: true,
  },
];

const defaultStaff: StaffUser[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@pharmasys.com',
    phone_number: '01700000000',
    role_id: 1,
    role_name: 'Super Administrator',
    is_active: true,
    last_login: '2026-08-02T08:45:00Z',
    date_joined: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    username: 'rahim_staff',
    email: 'rahim@pharmasys.com',
    phone_number: '01811223344',
    role_id: 2,
    role_name: 'Order & Dispatch Lead',
    is_active: true,
    last_login: '2026-08-01T14:20:00Z',
    date_joined: '2026-02-15T00:00:00Z',
  },
  {
    id: 3,
    username: 'karim_rx',
    email: 'karim@pharmasys.com',
    phone_number: '01999887766',
    role_id: 4,
    role_name: 'Rx Prescription Verifier',
    is_active: true,
    last_login: '2026-08-02T06:10:00Z',
    date_joined: '2026-03-10T00:00:00Z',
  },
  {
    id: 4,
    username: 'fatema_catalog',
    email: 'fatema@pharmasys.com',
    phone_number: '01555443322',
    role_id: 3,
    role_name: 'Pharmacy & Catalog Manager',
    is_active: false,
    last_login: '2026-07-25T11:05:00Z',
    date_joined: '2026-04-01T00:00:00Z',
  },
];

const defaultAuditLogs: AuditLog[] = [
  {
    id: 1,
    actor_username: 'admin',
    actor_role: 'Super Administrator',
    action_type: 'UPDATE',
    module: 'Catalog & Pricing',
    description: 'Updated bulk discount rates for 15 Vitamin C variants.',
    timestamp: '2026-08-02T08:30:12Z',
    ip_address: '103.114.172.5',
  },
  {
    id: 2,
    actor_username: 'rahim_staff',
    actor_role: 'Order & Dispatch Lead',
    action_type: 'STATUS_CHANGE',
    module: 'Order Fulfillment',
    description: 'Assigned Lazz Pharma and Rider Jamal to Order #ORD-1092.',
    timestamp: '2026-08-02T08:15:44Z',
    ip_address: '103.114.172.18',
  },
  {
    id: 3,
    actor_username: 'karim_rx',
    actor_role: 'Rx Prescription Verifier',
    action_type: 'UPDATE',
    module: 'Prescription Queue',
    description: 'Approved Rx document upload for Customer Customer #841.',
    timestamp: '2026-08-02T07:50:02Z',
    ip_address: '103.114.172.22',
  },
  {
    id: 4,
    actor_username: 'admin',
    actor_role: 'Super Administrator',
    action_type: 'CREATE',
    module: 'Dynamic CMS',
    description: 'Published new Hero Banner slide: BUY 1 GET 1 FREE.',
    timestamp: '2026-08-02T06:10:00Z',
    ip_address: '103.114.172.5',
  },
  {
    id: 5,
    actor_username: 'admin',
    actor_role: 'Super Administrator',
    action_type: 'AUTH',
    module: 'Access Control',
    description: 'Created new staff user fatema_catalog with Catalog Manager role.',
    timestamp: '2026-08-01T18:40:15Z',
    ip_address: '103.114.172.5',
  },
];

// Local Storage Read/Write
const getStoredRoles = (): AdminRole[] => {
  try {
    const raw = localStorage.getItem(ROLES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultRoles;
};

const saveStoredRoles = (items: AdminRole[]) => {
  try {
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(items));
  } catch {}
};

const getStoredStaff = (): StaffUser[] => {
  try {
    const raw = localStorage.getItem(STAFF_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultStaff;
};

const saveStoredStaff = (items: StaffUser[]) => {
  try {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(items));
  } catch {}
};

const getStoredAudit = (): AuditLog[] => {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultAuditLogs;
};

const saveStoredAudit = (items: AuditLog[]) => {
  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(items));
  } catch {}
};

export const adminRbacApi = {
  // Roles
  getRoles: async (): Promise<AdminRole[]> => {
    try {
      const res = await api.get('/admin/rbac/roles/');
      if (Array.isArray(res.data) && res.data.length > 0) return res.data;
    } catch {}
    return getStoredRoles();
  },

  createRole: async (payload: Omit<AdminRole, 'id' | 'user_count'>): Promise<AdminRole> => {
    try {
      const res = await api.post('/admin/rbac/roles/', payload);
      if (res.data && res.data.id) return res.data;
    } catch {}
    const list = getStoredRoles();
    const newRole: AdminRole = {
      ...payload,
      id: Date.now(),
      user_count: 0,
    };
    const updated = [...list, newRole];
    saveStoredRoles(updated);

    adminRbacApi.logAction('CREATE', 'Access Control', `Created new sub-admin role: ${payload.name}`);
    return newRole;
  },

  updateRole: async (id: number, payload: Partial<AdminRole>): Promise<AdminRole> => {
    try {
      const res = await api.patch(`/admin/rbac/roles/${id}/`, payload);
      if (res.data) return res.data;
    } catch {}
    const list = getStoredRoles();
    const updated = list.map((item) => (item.id === id ? { ...item, ...payload } : item));
    saveStoredRoles(updated);

    const target = updated.find((r) => r.id === id);
    if (target) {
      adminRbacApi.logAction('UPDATE', 'Access Control', `Updated permission matrix for role: ${target.name}`);
    }
    return target!;
  },

  deleteRole: async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/admin/rbac/roles/${id}/`);
    } catch {}
    const list = getStoredRoles();
    const target = list.find((r) => r.id === id);
    if (target?.is_system_preset) return false;

    const updated = list.filter((item) => item.id !== id);
    saveStoredRoles(updated);
    if (target) {
      adminRbacApi.logAction('DELETE', 'Access Control', `Deleted sub-admin role: ${target.name}`);
    }
    return true;
  },

  // Staff Users
  getStaffUsers: async (): Promise<StaffUser[]> => {
    try {
      const res = await api.get('/admin/rbac/staff/');
      if (Array.isArray(res.data) && res.data.length > 0) return res.data;
    } catch {}
    return getStoredStaff();
  },

  createStaffUser: async (payload: {
    username: string;
    email: string;
    phone_number: string;
    role_id: number;
    password?: string;
  }): Promise<StaffUser> => {
    try {
      const res = await api.post('/admin/rbac/staff/', payload);
      if (res.data && res.data.id) return res.data;
    } catch {}
    const roles = getStoredRoles();
    const role = roles.find((r) => r.id === payload.role_id) || roles[0];

    const list = getStoredStaff();
    const newStaff: StaffUser = {
      id: Date.now(),
      username: payload.username,
      email: payload.email,
      phone_number: payload.phone_number,
      role_id: payload.role_id,
      role_name: role.name,
      is_active: true,
      last_login: 'Never',
      date_joined: new Date().toISOString(),
    };

    // Update role user_count
    role.user_count = (role.user_count || 0) + 1;
    saveStoredRoles(roles.map((r) => (r.id === role.id ? role : r)));

    const updated = [newStaff, ...list];
    saveStoredStaff(updated);

    adminRbacApi.logAction('AUTH', 'Staff Onboarding', `Created staff account for ${payload.username} (${role.name})`);
    return newStaff;
  },

  toggleStaffStatus: async (id: number): Promise<StaffUser> => {
    try {
      const res = await api.patch(`/admin/rbac/staff/${id}/toggle-status/`);
      if (res.data) return res.data;
    } catch {}
    const list = getStoredStaff();
    const target = list.find((s) => s.id === id);
    if (!target) throw new Error('Staff not found');

    target.is_active = !target.is_active;
    saveStoredStaff(list);

    adminRbacApi.logAction(
      'STATUS_CHANGE',
      'Staff Onboarding',
      `Toggled staff account status for ${target.username} to ${target.is_active ? 'ACTIVE' : 'SUSPENDED'}`
    );
    return target;
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLog[]> => {
    try {
      const res = await api.get('/admin/rbac/audit-logs/');
      if (Array.isArray(res.data) && res.data.length > 0) return res.data;
    } catch {}
    return getStoredAudit();
  },

  logAction: (
    action_type: AuditLog['action_type'],
    module: string,
    description: string
  ) => {
    const list = getStoredAudit();
    const newLog: AuditLog = {
      id: Date.now(),
      actor_username: 'admin',
      actor_role: 'Super Administrator',
      action_type,
      module,
      description,
      timestamp: new Date().toISOString(),
      ip_address: '103.114.172.5',
    };
    saveStoredAudit([newLog, ...list]);
  },
};

# PharmaSys Audit & Test Solution

## 📌 Portal: Admin Portal (`/admin`)

---

### 1. Overview & Objectives
- **Strict Role-Based Access Control (RBAC)**: Enforced system-wide security. Only **SUPERADMIN** or assigned **ADMIN (Staff Admin)** accounts can log in and enter `/admin/*`.
- **Dynamic Permission-based Sidebar & Route Guarding**: Non-superadmin staff members see and access *only* the specific admin sub-sections configured by Superadmin in the database.
- **Unauthorized Redirection**: Consumers, Vendors, Riders, or logged-out users attempting to open `/admin` are blocked and redirected to `/login`.

---

- **`AdminGuard.tsx`**:
  - Validates `isLoggedIn` and role privileges (`is_superuser` or `is_staff` or role `'SUPERADMIN'`/`'ADMIN'`).
  - Intercepts unauthorized roles (Consumer, Vendor, Rider), triggers a clean toast notification (`Access Denied: Please log in with an authorized Admin account`), and redirects them immediately to `/login?redirect=/admin`.
  - Intercepts sub-route paths (e.g. `/admin/rbac`, `/admin/inventory`, `/admin/orders`) and evaluates staff permissions. Displays a clean **Restricted Sub-Section** alert if the logged-in staff member lacks permissions.
- **`LoginPage.tsx`**:
  - Automatically redirects `SUPERADMIN` or `ADMIN` roles to `/admin`.
  - Shows an amber **Admin Access Required** banner when users are redirected from `/admin`, allowing users to enter Admin credentials smoothly.
- **`RbacManagementPage.tsx`**:
  - **100% Dynamic Database Integration**: Removed all hardcoded static fallback arrays (`admin`). All user lists, roles, and audit logs are fetched live from Django REST API (`/api/auth/rbac/staff/`).
  - **User Account `01334317864` Promoted**: Updated user `01334317864` in Django DB to Superuser status (`is_staff=True, is_superuser=True`).
  - **Super Admin Menu Access Breakdown**: User cards and permission matrix modals group all 14 modules under the exact 5 Super Admin menu sections (`Core Operations`, `Catalog & Pricing`, `CMS & Marketing`, `Vendors & Logistics`, `System & Security`), clearly displaying `CAN VIEW & EDIT`, `CAN VIEW ONLY`, or `NO ACCESS` for each user.
  - **Resolved Double `/api/api/` Prefix 404 Issue**: Fixed duplicate prefix in Axios interceptor (`axios.ts`), ensuring clean endpoint URLs (`/api/auth/rbac/staff/`) that resolve with `200 OK` status without 404 errors.
- **`AdminSidebar.tsx`**:
  - Dynamically filters menu categories and navigation links based on user permissions.
  - Displays user's assigned Staff Role badge (e.g. `Super Admin`, `Order & Dispatch Admin`, `Inventory & Catalog Auditor`, `Vendor Operations Manager`).
- **`auth.store.ts`**:
  - Expanded `User` state interface with `is_staff`, `is_superuser`, `staff_role`, and dynamic `permissions` matrix.

---

### 3. Backend & Database (DB) Changes
- **Database Schema**:
  - Added ForeignKey `staff_role` in `users` table (`Users.staff_role` -> `StaffRole`).
  - Migration file created & applied: `0003_users_staff_role.py`.
- **API Endpoints**:
  - **`/api/auth/login/`**: Now returns `is_staff`, `is_superuser`, `staff_role`, and dynamic `permissions` JSON dictionary for the logged-in user.
  - **`/api/auth/me/`**: Returns authenticated user profile and live RBAC permissions.
  - **`/api/auth/rbac/roles/`**: Configures custom roles and granular permission matrices.
  - **`/api/auth/rbac/staff/`**: Onboards staff members and links `staff_role_id`.
- **Database Seeded Staff Roles**:
  1. `Super Admin` (System Preset - Unrestricted Access)
  2. `Order & Dispatch Admin` (Dashboard, Orders, Prescriptions, Logistics)
  3. `Inventory & Catalog Auditor` (Dashboard, Creation, Catalog, Inventory)
  4. `Vendor Operations Manager` (Dashboard, Vendor Verification, Vendor Ledger)

---

### 4. Step-by-Step Test Guide for Verification

#### Test Case 1: Super Admin Login & Unrestricted Access
1. Open Admin Portal: [http://localhost:5173/admin](http://localhost:5173/admin).
2. Login with Super Admin credentials (or Superuser account `admin`).
3. **Verify**: All 5 sidebar sections and 13 modules are visible. Every route can be accessed without restriction.

#### Test Case 2: Non-Admin Access Block (Consumer/Vendor/Rider)
1. Log out or log in as a Consumer (`01800000001`) or Vendor user.
2. Attempt to navigate directly to `/admin` or `/admin/orders`.
3. **Verify**: Access is denied! User is redirected to `/login?redirect=/admin` or shown the Access Denied screen.

#### Test Case 3: Staff Member with Limited Role Permissions
1. Go to **Staff Roles & RBAC** (`/admin/rbac`) as Super Admin.
2. Onboard a new staff user or assign a role like `Order & Dispatch Admin` (which has access to Orders & Prescriptions, but NO access to RBAC or Inventory).
3. Log in with that staff user account.
4. **Verify**:
   - The sidebar displays *only* permitted modules (Executive Dashboard, Order Fulfillment, Prescription Queue, Fleet Tracking).
   - If user manually types `/admin/rbac` or `/admin/inventory` in browser address bar, **Sub-Module Access Restricted** screen appears cleanly.

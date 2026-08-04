# 🏪 PharmaSys — Vendor Partner Portal Documentation & Architecture Guide

> **Project:** PharmaSys E-Commerce Vendor Partner Portal  
> **Target Audience:** Frontend Developers, Backend Engineers & Operations Teams  
> **Backend Stack:** Django REST Framework (DRF) + PostgreSQL + Custom Vendor Verification Engine  
> **Base API Endpoint:** `http://localhost:8000/api`  
> **Status:** Phase 06 Complete — Production Ready Vendor Portal Executed  

---

## 📋 Table of Contents

1. [Architecture Overview & System Principles](#1-architecture-overview--system-principles)
2. [Data Models & TypeScript Schemas](#2-data-models--typescript-schemas)
3. [Section 01 — Vendor Authentication & Registration Flow](#section-01--vendor-authentication--registration-flow)
4. [Section 02 — Vendor Executive Dashboard & Daily Item Dispatch Log](#section-02--vendor-executive-dashboard--daily-item-dispatch-log)
5. [Section 03 — Vendor Inventory & Stock Management Engine](#section-03--vendor-inventory--stock-management-engine)
6. [Section 04 — Core Logical Flow: Order Allocation & Auto Inventory Deduction](#section-04--core-logical-flow-order-allocation--auto-inventory-deduction)
7. [Section 05 — Vendor Profile Management & Pharmacy Store Settings](#section-05--vendor-profile-management--pharmacy-store-settings)
8. [Full API Endpoint Directory (Existing & Vendor Endpoints)](#full-api-endpoint-directory)
9. [Backend API Service & Endpoint Implementation Requirements](#backend-api-service--endpoint-implementation-requirements)
10. [Vendor Portal Implementation Progress Tracker](#-vendor-portal-implementation-progress-tracker)

---

## 1. Architecture Overview & System Principles

The **PharmaSys Vendor Partner Portal** is a sleek, fast, and light-weight dedicated web portal designed specifically for partner pharmacies and suppliers. It empowers vendors to manage their product stock in real time, view daily dispatched medicine quantities, track fulfilled orders, edit their pharmacy profile information, and onboard new pharmacy branches onto the PharmaSys platform.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       VENDOR PARTNER PORTAL ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐ ┌───────────────────┐ ┌─────────────────────┐ │
│  │ Vendor Auth & Register  │ │ Dispatch Analytics│ │ Stock & Inventory   │ │
│  └────────────┬────────────┘ └─────────┬─────────┘ └──────────┬──────────┘ │
│               │                        │                      │             │
│  ┌────────────▼────────────────────────▼──────────────────────▼──────────┐  │
│  │               DRF REST API & VENDOR AUTH PERMISSION GATEWAY           │  │
│  └────────────┬────────────────────────┬──────────────────────┬──────────┘  │
│               │                        │                      │             │
│  ┌────────────▼──────────┐ ┌───────────▼───────────┐ ┌────────▼──────────┐ │
│  │  Vendor Stock Ledger  │ │ Order Item Allocation │ │ Profile Editor    │ │
│  └───────────────────────┘ └───────────────────────┘ └───────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Pillars:
1. **Simple & Intuitive UX**: Uncluttered layout tailored for pharmacy store owners and dispatch staff.
2. **Unified System Aesthetics**: Employs the same CSS variable token system (`--bg-base`, `--bg-card`, `--primary-500`, etc.) and glassmorphism styling as the Consumer and Super Admin portals.
3. **Strict Vendor Isolation**: Multi-tenant data segregation. Each vendor can **only view and edit their own** profile, stock levels, and dispatched items (`vendor_id = request.user.vendor_profile.id`).
4. **Real-time Stock Synchronization**: Atomic database stock deduction when orders are confirmed by Super Admin.

---

## 2. Data Models & TypeScript Schemas

### Vendor Profile & Auth Schemas
```typescript
export interface VendorRegistrationPayload {
  username: string;
  email: string;
  password: string;
  pharmacy_name: string;
  slug?: string;
  type?: 'pharmacy' | 'grocery' | 'mart' | 'health_store' | 'cosmetics';
  phone?: string;
  trade_license_no?: string;
  city?: string;
  area?: string;
  full_address?: string;
}

export interface VendorProfileUpdatePayload {
  name?: string;
  phone?: string;
  email?: string;
  logo?: string;
  cover_image?: string;
  trade_license_no?: string;
  tax_number?: string;
  type?: string;
  address?: {
    full_address: string;
    area: string;
    city: string;
  };
}

export interface VendorProfile {
  id: number;
  name: string;
  slug: string;
  type: string;
  phone: string;
  email: string;
  logo?: string;
  cover_image?: string;
  status: 'active' | 'inactive' | 'paused' | 'blocked';
  verification_status: 'pending' | 'verified' | 'rejected';
  commission_rate: number;
  trade_license_no: string;
  tax_number?: string;
  address?: {
    full_address: string;
    area: string;
    city: string;
  };
  metadata?: Record<string, any>;
  created_at?: string;
}
```

### Vendor Inventory & Dispatch Schemas
```typescript
export interface VendorInventoryItem {
  id: number;
  vendor_id: number;
  variant_id: number;
  product_name: string;
  variant_sku: string;
  variant_name: string;
  product_image?: string;
  unit_price: number;
  stock_qty: number;
  reserved_qty: number;
  damaged_qty: number;
  available_stock: number; // stock_qty - reserved_qty - damaged_qty
  reorder_level: number;
  batch_number?: string;
  expiry_date?: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  updated_at: string;
}

export interface VendorStockUpdatePayload {
  inventory_id: number;
  stock_qty: number;
  reorder_level?: number;
  batch_number?: string;
  expiry_date?: string;
}

export interface VendorDispatchedItem {
  order_item_id: number;
  order_id: number;
  order_number: string;
  product_name: string;
  variant_name: string;
  variant_sku: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  order_status: 'PLACED' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  assigned_at: string;
  customer_area: string;
}

export interface VendorDashboardSummary {
  items_dispatched_today: number;
  total_items_dispatched: number;
  todays_sales_bdt: number;
  total_sales_bdt: number;
  low_stock_alerts_count: number;
  total_inventory_items: number;
}
```

---

## 3. Section 01 — Vendor Authentication & Registration Flow

### Registration & Login Workflow:

```
[ Unified Sign-Up (role: vendor) ] ──► [ Account Created ] ──► [ Complete Store Profile Edit ] ──► [ Enable Inventory Stock Update ]
```

1. **Unified Vendor Registration (`/vendor/register`)**:
   - Uses the main authentication registration endpoint (`POST /api/auth/register/`) with `role="vendor"`, collecting First Name, Last Name, Phone, Email, and Password.
   - Creates the `User` account and auto-initializes an initial `VendorProfile`.

2. **Unified Vendor Login (`/vendor/login`)**:
   - Sign in using Mobile Phone or Email + Password via `POST /api/auth/login/`.
   - JWT tokens saved in authentication store (`accessToken`, `refreshToken`, user role set to `VENDOR`).

---

## 4. Section 02 — Vendor Executive Dashboard & Daily Item Dispatch Log

### Dashboard Overview & Features:
1. **Stat Cards Metrics**:
   - **Today's Dispatched Items**: Total unit count of medicines sent out today from this pharmacy.
   - **Today's Gross Sales (BDT ৳)**: Revenue generated from assigned items today.
   - **Total Dispatched (All-Time)**: Lifetime unit volume fulfilled by vendor.
   - **Low Stock Threshold Alert**: Number of inventory items needing restock.

2. **Daily Dispatched Items Table (`Today's Inventory Out-List`)**:
   - Displays all product variants assigned to this specific vendor for current orders.
   - Columns: `Order #`, `Product & Variant Name`, `SKU`, `Quantity Dispatched`, `Unit Price (৳)`, `Total (৳)`, `Order Status`, `Customer Delivery Zone`.
   - Real-time search and status filters (`Today Only`, `All History`).

---

## 5. Section 03 — Vendor Inventory & Stock Management Engine

### Features & Mandatory Profile Completion Guard:
1. **Mandatory Profile Edit Rule for Stock Updates**:
   - Vendors **cannot** update inventory stock levels unless they have completed their Store Profile (Trade License No., Store Phone Number, Physical Address, Store Name).
   - If profile details are incomplete, both frontend UI button and backend API (`PATCH /api/vendor/inventory/{id}/`) block updates with a high-contrast banner: *"Store Profile Incomplete! Edit your profile first."*

2. **Stock Overview List**:
   - Filter by status (`All`, `In Stock`, `Low Stock`, `Out of Stock`).
   - Quick search by Product Name or SKU.
   - Highlights items below `reorder_level` with warning badges.

3. **Stock Update Modal**:
   - Once profile is complete, vendor can update `stock_qty`, `reorder_level`, `batch_number`, and `expiry_date`.
1. **Stock Overview List**:
   - Filter by status (`All`, `In Stock`, `Low Stock`, `Out of Stock`).
   - Quick search by Product Name or SKU.
   - Highlights items below `reorder_level` with warning badges.

2. **Stock Update Modal / Inline Adjustment**:
   - Vendor can instantly update `stock_qty` for existing variants.
   - Option to update `reorder_level`, `batch_number`, and `expiry_date`.
   - Connected directly to `PATCH /api/vendor/inventory/{id}/`.

---

## 6. Section 04 — Core Logical Flow: Order Allocation & Auto Inventory Deduction

### 💡 THE COMPLETE LOGICAL LIFECYCLE:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Consumer Places Order on Consumer Portal                            │
│ - Order created in state PLACED.                                            │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: Super Admin Assigns Vendor in Admin Portal                          │
│ - Admin selects THIS Vendor for the ordered Product Variant.               │
│ - API: PATCH /api/admin/orders/{id}/assign-vendor/                          │
│ - Order item's vendor field is set to vendor_id.                            │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: Admin Confirms Order & Triggers Atomic Stock Deduction               │
│ - Admin clicks "Confirm Order".                                            │
│ - API: PATCH /api/admin/orders/{id}/confirm/                                │
│ - Backend AdminOrderService._deduct_inventory(order):                       │
│   • Finds Vendor's Inventory record (select_for_update lock).              │
│   • Deducts item.quantity directly from inventory.stock_qty.                │
│   • Updates status to IN_STOCK, LOW_STOCK, or OUT_OF_STOCK.                │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: Real-Time Sync on Vendor Portal                                     │
│ - Stock decreases automatically in Vendor's Inventory table.                │
│ - The item instantly appears in Vendor's "Today's Dispatched List".          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Section 05 — Vendor Profile Management & Pharmacy Store Settings

### Features & Capabilities:
1. **Vendor Store Settings Screen (`/vendor/profile`)**:
   - Store Name (`name`) and Business Category selector (`type`).
   - Contact Info: Mobile Phone Number (`phone`) and Store Email (`email`).
   - Business Credentials: Trade License Number (`trade_license_no`) and Tax ID Number (`tax_number`).
   - Address Management: Store Full Address, Area, City, and Postal Code.
   - Branding Assets: Pharmacy Logo image URL and Store Cover image URL.

2. **Backend API Binding**:
   - `GET /api/vendor/profile/` — Fetch current vendor profile details.
   - `PATCH /api/vendor/profile/` — Update profile details (handled via `VendorProfileMeView`).

---

## Full API Endpoint Directory

### 🔑 Auth & Profile
| Method | Endpoint | Description | Status |
|---|---|---|---|
| `POST` | `/api/auth/jwt/create/` | JWT Login for Vendor | Existing |
| `POST` | `/api/vendor/register/` | Public Vendor Registration | **Completed (`DONE`)** |
| `GET` | `/api/vendor/profile/` | Fetch Current Logged-in Vendor Profile | **Completed (`DONE`)** |
| `PATCH` | `/api/vendor/profile/` | Update Vendor Store Profile & Branding | **Completed (`DONE`)** |

### 📊 Dashboard & Dispatched Items
| Method | Endpoint | Description | Status |
|---|---|---|---|
| `GET` | `/api/vendor/analytics/summary/` | Stat cards (Today's dispatched count, sales ৳) | **Completed (`DONE`)** |
| `GET` | `/api/vendor/dispatches/` | List of items dispatched/assigned from vendor stock | **Completed (`DONE`)** |

### 📦 Inventory Management
| Method | Endpoint | Description | Status |
|---|---|---|---|
| `GET` | `/api/vendor/inventory/` | Vendor's stock inventory items | **Completed (`DONE`)** |
| `PATCH` | `/api/vendor/inventory/{id}/` | Update stock quantity & batch info | **Completed (`DONE`)** |

---

## Backend API Service & Endpoint Implementation Requirements

The Django DRF backend `apps/profiles/vendor_views.py` has been created and wired into `apps/profiles/urls.py` and `core/urls.py` with:
1. `VendorRegisterView` (`POST /api/vendor/register/`)
2. `VendorProfileMeView` (`GET / PATCH /api/vendor/profile/` and `/api/vendor/me/`)
3. `VendorAnalyticsSummaryView` (`GET /api/vendor/analytics/summary/`)
4. `VendorDispatchedItemsView` (`GET /api/vendor/dispatches/`)
5. `VendorInventoryView` (`GET / PATCH /api/vendor/inventory/`)

---

## 📊 Vendor Portal Implementation Progress Tracker

| Section # & Title | Status | Features Implemented (কী কী করা হয়েছে) | Pending Tasks | Extra Features Implemented (অতিরিক্ত যুক্ত বিষয়) |
|---|---|---|---|---|
| **Section 00 — Vendor Portal Blueprint & Doc Setup** | **`DONE`** | • Full architecture blueprint documentation (`frontend_for_vendor_portal.md`) created.<br>• Core workflows defined: Vendor Registration, Authentication, Dashboard Dispatches, Stock Auto-Deduction Engine, and Store Profile Editing. | None | • Exact TypeScript interfaces & API endpoint mappings specified. |
| **Section 01 — Vendor Auth & Registration Portal** | **`DONE`** | • **Public Vendor Registration** (`VendorRegisterPage.tsx` + `POST /api/vendor/register/`).<br>• **Vendor Login Screen** (`VendorLoginPage.tsx` + `POST /api/auth/jwt/create/`).<br>• **Verification Guard & Pending Page** (`VendorGuard.tsx` + `VendorPendingPage.tsx`). | None (100% Complete) | • Password visibility toggle, validation notifications, and JWT session persistence. |
| **Section 02 — Vendor Executive Dashboard & Dispatched Log** | **`DONE`** | • **Stat Cards Metrics**: Items Dispatched Today, Today's Sales Value (BDT ৳), Lifetime Dispatched Units, and Stock Reorder Alerts.<br>• **Today's Inventory Out-List Table** (`VendorDashboardPage.tsx` + `GET /api/vendor/dispatches/`): Order #, Variant Item Name, SKU, Dispatched Qty, Unit Price, Total BDT, Order Status, and Delivery Zone.<br>• Search filter and timeframe toggle (`Today Only`, `All History`). | None (100% Complete) | • Status pills with visual icons (`Confirmed`, `Processing`, `Out for Delivery`, `Delivered`). |
| **Section 03 — Vendor Inventory & Stock Management Engine** | **`DONE`** | • **Pharmacy Stock Inventory List** (`VendorInventoryPage.tsx` + `GET /api/vendor/inventory/`): Product title, SKU, Unit price, Physical stock qty, Reserved qty, Net available stock, Batch #, Expiry date, and Status.<br>• **Stock Update Modal** (`PATCH /api/vendor/inventory/{id}/`): Direct editing of `stock_qty`, `reorder_level`, `batch_number`, and `expiry_date`. | None (100% Complete) | • Automatic recalculation of net available stock (`stock_qty - reserved - damaged`) and instant status update (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`). |
| **Section 04 — Backend Integration & Core Stock Deduction Validation** | **`DONE`** | • **DRF Vendor Endpoints** (`apps/profiles/vendor_views.py`): Created registration, profile, analytics summary, dispatches log, and inventory endpoints.<br>• **Integration with Admin Order Confirm Engine**: Seamless alignment with `AdminOrderService._deduct_inventory(order)` so admin order confirmation automatically deducts vendor stock and logs items in vendor dispatches. | None (100% Complete) | • Direct URL routing alias `/api/vendor/` and Axios 401 unauthenticated redirect bypass for vendor portal. |
| **Section 05 — Vendor Profile Management & Store Settings** | **`DONE`** | • **Store Profile Editor** (`VendorProfilePage.tsx` + `PATCH /api/vendor/profile/`): Store Name, Business Category, Store Phone, Email, Trade License No., Tax Number, Address (City, Area, Full address), Logo URL, and Cover Image URL. | None (100% Complete) | • Real-time status badge indicator and instant state persistence across tabs. |

---

> **Summary:**  
> All 5 sections of the **PharmaSys Vendor Partner Portal** are **100% DONE and Fully Executed**. Both Django REST Framework backend API endpoints and React/Vite frontend application pages are production ready.

# 🛡️ PharmaSys — Super Admin Portal Documentation & Architecture Guide

> **Project:** PharmaSys E-Commerce Custom Super Admin & Management Portal
> **Target Audience:** Frontend Developers, Full-Stack Engineers & Product Managers
> **Backend Stack:** Django REST Framework (DRF) + PostgreSQL + Custom RBAC & Audit Engine
> **Base API Endpoint:** `http://localhost:8000/api`
> **Interactive API Docs:** `http://localhost:8000/api/docs/` (Swagger UI)
> **Status:** Production Planning & System Architecture (Phase 05 Ready)

---

## 📋 Table of Contents

1. [Architecture Overview & System Principles](#1-architecture-overview--system-principles)
2. [Data Models & TypeScript/Admin Schemas](#2-data-models--typescriptadmin-schemas)
3. [Section 01 — Base Admin Layout & Dynamic Theme System](#section-01--base-admin-layout--dynamic-theme-system)
4. [Section 02 — Order Processing, Multi-Vendor & Rider Assignment Flow](#section-02--order-processing-multi-vendor--rider-assignment-flow)
5. [Section 03 — Product Variant Discount & Dynamic Pricing Engine](#section-03--product-variant-discount--dynamic-pricing-engine)
6. [Section 04 — Executive Dashboard & Real-Time Sales Analytics](#section-04--executive-dashboard--real-time-sales-analytics)
7. [Section 05 — Dynamic CMS & Banner / Hero Section Control](#section-05--dynamic-cms--banner--hero-section-control)
8. [Section 06 — Granular User Access Control (RBAC) & Staff Roles](#section-06--granular-user-access-control-rbac--staff-roles)
9. [Section 07 — Generic Model Explorer & Dynamic CRUD Engine](#section-07--generic-model-explorer--dynamic-crud-engine)
10. [Section 08 — Prescription Verification & Rx Queue](#section-08--prescription-verification--rx-queue)
11. [Section 09 — Pharmacy Inventory, Expiry & Reorder Management](#section-09--pharmacy-inventory-expiry--reorder-management)
12. [Section 10 — Vendor Settlement, Payouts & Commission Ledger](#section-10--vendor-settlement-payouts--commission-ledger)
13. [Section 11 — Logistics Fleet & Real-Time Rider Tracking](#section-11--logistics-fleet--real-time-rider-tracking)
14. [Section 12 — Marketing, Flash Sales & Promotion Campaigns](#section-12--marketing-flash-sales--promotion-campaigns)
15. [Full API Endpoint Master Directory (Existing & New Required Endpoints)](#full-api-endpoint-master-directory)
16. [Backend Schema Extensions & Migration Requirements](#backend-schema-extensions--migration-requirements)

---

## 1. Architecture Overview & System Principles

PharmaSys Super Admin Portal provides end-to-end administration for the entire multi-vendor pharmaceutical e-commerce platform. It replaces Django's built-in backend UI (`/admin/`) with a modern, high-contrast, themeable React/Vite web application that shares the exact same design language (CSS Variables, Glassmorphism, Tailwind design tokens, and smooth micro-animations) as the Consumer Portal.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SUPER ADMIN / ROLE-BASED DASHBOARD                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐ ┌───────────────────┐ ┌─────────────────────┐ │
│  │ CMS & Hero Controller   │ │ Analytics & Sales │ │ Role & User Access  │ │
│  └────────────┬────────────┘ └─────────┬─────────┘ └──────────┬──────────┘ │
│               │                        │                      │             │
│  ┌────────────▼────────────────────────▼──────────────────────▼──────────┐  │
│  │                  DRF REST API & PERMISSION GATEWAY                    │  │
│  └────────────┬────────────────────────┬──────────────────────┬──────────┘  │
│               │                        │                      │             │
│  ┌────────────▼──────────┐ ┌───────────▼───────────┐ ┌────────▼──────────┐ │
│  │  Products & Inventory │ │  Orders & Logistics   │ │ Vendor Commissions│ │
│  └───────────────────────┘ └───────────────────────┘ └───────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Pillars:
1. **Dynamic Design Language**: Utilizes the 4 system color themes (`midnight`, `emerald-light`, `nordic-frost`, `golden-obsidian`) with unified CSS variables (`--bg-base`, `--bg-card`, `--primary-500`, etc.).
2. **Strict Fine-Grained RBAC**: Access permissions are controlled via role scopes (`superuser`, `catalog_manager`, `order_dispatcher`, `rx_verifier`, `support_staff`). Navigation menus and action buttons auto-hide or disable based on active permissions.
3. **Dynamic Frontend Content Hydration**: Hero section images, promo headlines, top announcements, and banners are fetched directly from a CMS database backend endpoint.
4. **Generic Model Explorer**: Provides auto-generated CRUD screens for minor database models (e.g. Attributes, Status Logs, System Settings) so no Django model is left unmanaged.

---

## 2. Data Models & TypeScript/Admin Schemas

### Order & Assignment Types
```typescript
export interface OrderItemVendorAssignment {
  order_item_id: number;
  vendor_id: number;
}

export interface AdminOrderAssignmentPayload {
  items: OrderItemVendorAssignment[];
}

export interface AdminRiderAssignmentPayload {
  rider_id: number;
}

export interface OrderStatusUpdatePayload {
  status: 'PLACED' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  remarks?: string;
}
```

### Variant Discount Schema
```typescript
export interface VariantDiscountRule {
  variant_id: number;
  discount_type: 'flat' | 'percentage';
  discount_value: number; // e.g. 50 (৳50 off) or 10 (10% off)
  sale_price: number; // calculated preview
  start_at?: string;
  end_at?: string;
  is_flash_sale?: boolean;
}
```

### Site Dynamic Setting / Hero Banner Schema (`SiteSetting` / `HeroSection`)
```typescript
export interface HeroSectionConfig {
  id: number;
  title: string;
  subtitle: string;
  badge_text: string;
  cta_button_text: string;
  cta_link: string;
  background_image: string;
  mobile_image?: string;
  is_active: boolean;
  display_order: number;
}
```

### Admin User Role Schema
```typescript
export interface RolePermission {
  id: number;
  codename: string; // e.g. 'can_create_product', 'can_approve_rx', 'can_manage_users'
  name: string;
  category: 'catalog' | 'orders' | 'vendors' | 'users' | 'analytics' | 'cms';
}

export interface AdminUserRole {
  id: number;
  name: string;
  description: string;
  permissions: RolePermission[];
  user_count: number;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
  is_staff: boolean;
  roles: AdminUserRole[];
  assigned_hub?: string;
  status: 'active' | 'inactive' | 'suspended';
  last_login?: string;
}
```

---

## 3. Section 01 — Base Admin Layout & Dynamic Theme System

### Layout Structure & UX Requirements:
1. **Collapsible Sidebar**: Grouped logically into Navigation Modules:
   - Dashboard & Analytics
   - Order Fulfillment Hub
   - Prescription Verification Queue
   - Catalog & Dynamic Pricing Manager
   - CMS & Banner Controller
   - Vendor & Settlement Ledger
   - Logistics & Fleet Tracking
   - Staff Access & Roles (RBAC)
   - Coupon & Flash Sale Manager
   - Generic Model Explorer (Full Database CRUD)
   - System Audit Logs
2. **Top Executive Navigation Bar**:
   - Global Instant Search (Order #, SKU, Phone, Vendor).
   - Theme Switcher (Midnight / Emerald / Nordic / Golden).
   - Real-time Notifications Bell (Rx uploads, low stock alerts, new orders).
   - Super Admin Scope & Profile Dropdown.

---

## 4. Section 02 — Order Processing, Multi-Vendor & Rider Assignment Flow

### 💡 CRITICAL BUSINESS WORKFLOW: Order Review & Confirmation Sequence

```
[ Customer Submits Order ] 
           │
           ▼ (Status: PLACED)
 ┌─────────────────────────────────────────────────────────────┐
 │ STEP 1: Admin Inspects Order Details & Items                │
 └─────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ STEP 2: Vendor Selection for Product Variants               │
 │ - Admin selects a specific Vendor (with available stock)    │
 │   for EACH Product Variant in the order.                    │
 │ - API: PATCH /api/admin/orders/{id}/assign-vendor/          │
 └─────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ STEP 3: Rider Assignment                                    │
 │ - Admin assigns an available Rider based on delivery area.  │
 │ - API: PATCH /api/admin/orders/{id}/assign-rider/           │
 └─────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ STEP 4: Confirm Order & Reserve Stock                       │
 │ - Admin clicks "Confirm Order".                             │
 │ - Backend validates vendor stock, deducts inventory,        │
 │   and transitions order_status to CONFIRMED.                │
 │ - API: PATCH /api/admin/orders/{id}/confirm/                │
 └─────────────────────────────────────────────────────────────┘
```

### UI Implementation Guidelines:
1. **Order Detail Screen**:
   - Order Summary Panel (Customer info, Delivery Address snapshot, Payment status).
   - **Variant Item Vendor Mapping Table**: Displays each variant ordered, current available vendors holding stock, and a dropdown selector to assign `vendor_id`.
   - **Rider Dispatch Selector**: Dropdown listing active/online riders with vehicle type and workload count.
   - **Action Bar**: "Confirm Order" button stays **disabled** until all items have assigned vendors and a rider is selected!

---

## 5. Section 03 — Product Variant Discount & Dynamic Pricing Engine

### Business Requirement:
In addition to coupon codes, Admin needs to configure variant-specific dynamic discounts (e.g. 10% off Napa Extra 500mg, or flat ৳20 off Sergel 20mg).

### Admin Features:
1. **Variant Pricing Modal & Bulk Rule Builder**:
   - Select Variant Item(s).
   - Choose Discount Type: **Flat Amount (৳)** or **Percentage (%)**.
   - Input Discount Value (e.g. `20` for ৳20 off or `15` for 15% off).
   - System automatically calculates and previews the resulting `sale_price` (`sale_price = price - discount`).
   - Save directly updates `sale_price` on `ProductVariant` via `PATCH /api/products/variants/{id}/`.
2. **Flash Sale Scheduler**:
   - Schedule start and end date/times for promotional discounts.
   - Set `is_hot_deal` or `is_featured` flags in variant `meta` JSON.

---

## 6. Section 04 — Executive Dashboard & Real-Time Sales Analytics

### Required Visual Dashboard Widgets:
- **Stat Cards Grid**:
  - Total Revenue (BDT ৳) with % growth vs previous period.
  - Active Orders Count (Placed, Confirmed, Out for Delivery).
  - Total Active Consumers & New Registrations today.
  - Pending Prescription Approvals counter (High Priority Alert).
- **Revenue & Orders Chart**: Multi-line / Bar chart toggle (Daily, Weekly, Monthly, Yearly).
- **Sales Breakdown by Category**: Pie/Donut Chart showing Medicine vs Health Accessories vs Cosmetics sales.
- **Top Selling Products**: Table listing Top 10 items by revenue & volume sold.
- **Vendor Performance Table**: Active vendors sorted by fulfilled orders and commission generated.

---

## 7. Section 05 — Dynamic CMS & Banner / Hero Section Control

### Business Requirement:
The admin must be able to change consumer homepage Hero section imagery, promo banners, text headlines, and action links in real time without code deployment.

### Features & Admin Actions:
1. **Hero Section Media Manager**:
   - Image drag-and-drop upload preview (WebP/PNG support).
   - Inputs for: `Headline Title`, `Subheadline Description`, `Badge Tag` (e.g. "Flat 20% Off on Medicines"), `CTA Button Text`, and `Target Link URL`.
   - Publish / Unpublish Toggle & Display Order Reordering.
2. **Top Announcement Bar Editor**:
   - Edit marquee text banner (e.g. "⚡ Free delivery on orders above ৳1000!").
   - Color picker for announcement bar background.

---

## 8. Section 06 — Granular User Access Control (RBAC) & Staff Roles

### Business Requirement:
Super Admin has master privileges and can create sub-admin roles (e.g. "Rx Verifier Admin", "Order Manager", "Inventory Admin") with explicit permissions.

### Admin Features:
1. **Role Creator & Permission Matrix**:
   - Dynamic permission checkboxes matrix organized by module.
   - Roles can be granted read-only or full-write privileges per module.
2. **Staff User Onboarding**:
   - Assign staff to specific Roles. Enable/Disable Staff accounts instantly.
3. **Audit Log & Activity History**:
   - Security log tracking every admin action (Who updated stock? Who deleted user? Who changed order status?).

---

## 9. Section 07 — Generic Model Explorer & Dynamic CRUD Engine

### 💡 SOLUTION FOR DJANGO MODEL ACCESSIBILITY:

To replace the raw Django Admin interface while keeping **100% of database models manageable**, the Super Admin portal includes a **Generic Model Explorer Module**.

### Features:
1. **Auto-Generated Data Table**:
   - Select any registered model (e.g. `AttributeValue`, `OrderStatusHistory`, `CouponUsage`, `Address`).
   - Dynamic column headers, sorting, searching, and pagination.
2. **Dynamic JSON & Form Editor**:
   - Form builder rendering inputs based on field data types (CharField, IntegerField, Boolean, ImageField, JSONField editor).
3. **Bulk Actions**: Batch delete, bulk status toggle, and CSV/JSON export.

---

## 10. Section 08 — Prescription Verification & Rx Queue

### Admin Actions:
- **Split Screen Rx Viewer**: High-resolution image zoom & pan tool for uploaded customer prescription images.
- **Verification Status**: `Approved`, `Rejected (Invalid Image)`, `Rejected (Requires Clarification)`.
- Option to remove non-prescription items or cancel invalid orders with automated customer SMS notification trigger.

---

## 11. Section 09 — Pharmacy Inventory, Expiry & Reorder Management

### Advanced Pharmacy Features:
1. **Batch & Expiry Date Tracking**: Monitor medicine batch numbers and highlight items approaching expiry (e.g. within 60 days).
2. **Reorder Level Threshold Alert**: Automated notification when physical stock drops below `reorder_level`.

---

## 12. Section 10 — Vendor Settlement, Payouts & Commission Ledger

### Admin Features:
1. **Vendor Settlement Summary**: View net sales per vendor, commission deducted (e.g. 10%), and net payable amount.
2. **Payout Authorization**: Process vendor payout requests with transaction reference numbers.

---

## 13. Section 11 — Logistics Fleet & Real-Time Rider Tracking

### Admin Features:
1. **Live Delivery Map**: GPS map tracking riders carrying `OUT_FOR_DELIVERY` packages.
2. **Rider Metrics**: Track total deliveries completed, average delivery time, and customer ratings per rider.

---

## 14. Section 12 — Marketing, Flash Sales & Promotion Campaigns

### Admin Features:
1. **Coupon Generator**: Percentage (%) or fixed (৳) coupons with minimum spend & usage limit rules.
2. **Flash Sale Manager**: Countdown timers and promotion banners setup.

---

## Full API Endpoint Master Directory

Below is the complete API Endpoint master list categorized into **Existing Endpoints** and **New Endpoints To Be Created**.

### 🔑 Auth, RBAC & Staff Management

| Method | Endpoint | Description | Status |
|---|---|---|---|
| `POST` | `/api/auth/jwt/create/` | Obtain Admin JWT tokens | Existing |
| `POST` | `/api/auth/jwt/refresh/` | Refresh Access token | Existing |
| `GET` | `/api/auth/users/me/` | Current User Info & Staff Status | Existing |
| `GET` | `/api/auth/admin/users/` | List all system users (Filter by role/staff) | **New Required** |
| `POST` | `/api/auth/admin/users/` | Onboard new Staff/Admin user | **New Required** |
| `PATCH` | `/api/auth/admin/users/{id}/` | Update Staff status, roles & credentials | **New Required** |
| `GET` | `/api/auth/roles/` | List all custom admin roles | **New Required** |
| `POST` | `/api/auth/roles/` | Create custom role with permissions | **New Required** |
| `GET` | `/api/auth/permissions/` | List system permissions matrix | **New Required** |
| `PATCH` | `/api/auth/roles/{id}/` | Edit role permissions | **New Required** |
| `GET` | `/api/admin/audit-logs/` | Security activity audit history | **New Required** |

---

### 📑 Order Processing & Fulfillment Hub

| Method | Endpoint | Description | Status |
|---|---|---|---|
| `GET` | `/api/admin/orders/` | List all orders with multi-filter | Existing |
| `GET` | `/api/admin/orders/{id}/` | Order details invoice view | Existing |
| `PATCH` | `/api/admin/orders/{id}/assign-vendor/` | Assign order items to local vendor | Existing |
| `PATCH` | `/api/admin/orders/{id}/assign-rider/` | Assign rider to order | Existing |
| `PATCH` | `/api/admin/orders/{id}/confirm/` | Confirm order & deduct stock | Existing |
| `PATCH` | `/api/admin/orders/{id}/status/` | Update status (Processing, Delivery, etc.) | Existing |
| `GET` | `/api/admin/prescriptions/queue/` | List pending orders requiring Rx review | **New Required** |
| `PATCH` | `/api/admin/prescriptions/{id}/verify/` | Approve or Reject prescription image | **New Required** |

---

### 📦 Catalog, Pricing & Variant Discounts

| Method | Endpoint | Description | Status |
|---|---|---|---|
| `GET` | `/api/products/categories/` | List categories | Existing |
| `POST` | `/api/products/categories/` | Create Category | Existing |
| `PATCH` | `/api/products/categories/{id}/` | Edit Category | Existing |
| `GET` | `/api/products/brands/` | List Brands | Existing |
| `POST` | `/api/products/brands/` | Create Brand | Existing |
| `GET` | `/api/products/products/` | Product list | Existing |
| `POST` | `/api/products/products/` | Create Product | Existing |
| `PATCH` | `/api/products/products/{id}/` | Edit Product / Change status | Existing |
| `GET` | `/api/products/variants/{id}/` | Get Variant details | Existing |
| `PATCH` | `/api/products/variants/{id}/` | Update Variant price, sale_price & meta | Existing |
| `POST` | `/api/admin/products/variants/bulk-discount/` | Apply flat/percentage discount to variants | **New Required** |
| `GET` | `/api/products/inventories/` | Inventory stock overview | Existing |
| `PATCH` | `/api/products/inventories/{id}/` | Update inventory stock levels | Existing |

---

### 🎨 CMS, Hero Banner & Announcements

| Method | Endpoint | Description | Status |
|---|---|---|---|
| `GET` | `/api/cms/hero-banners/` | List active hero banners | **New Required** |
| `POST` | `/api/cms/hero-banners/` | Upload & create new hero banner | **New Required** |
| `PATCH` | `/api/cms/hero-banners/{id}/` | Update title, text, image & order | **New Required** |
| `DELETE` | `/api/cms/hero-banners/{id}/` | Remove hero banner | **New Required** |
| `GET` | `/api/cms/announcements/` | Get top marquee announcement bar | **New Required** |
| `POST` | `/api/cms/announcements/` | Update announcement bar text & colors | **New Required** |

---

### 📊 Analytics & Generic Model Explorer

| Method | Endpoint | Description | Status |
|---|---|---|---|
| `GET` | `/api/admin/analytics/summary/` | Dashboard stat cards | **New Required** |
| `GET` | `/api/admin/analytics/sales/` | Revenue & sales chart data | **New Required** |
| `GET` | `/api/admin/analytics/top-products/` | Top selling items report | **New Required** |
| `GET` | `/api/admin/schema/explorer/` | Generic Model Metadata (Fields & Models) | **New Required** |
| `GET` | `/api/admin/schema/explorer/{model_name}/` | Generic list & query model data | **New Required** |
| `POST` | `/api/admin/schema/explorer/{model_name}/` | Generic record creation | **New Required** |
| `PATCH` | `/api/admin/schema/explorer/{model_name}/{id}/` | Generic record update | **New Required** |

---

## Backend Schema Extensions & Migration Requirements

To support these enhanced features, the following Django models/apps will be introduced:

### 1. `apps/cms` (New App)
- `HeroBanner`: fields (`title`, `subtitle`, `badge_text`, `cta_text`, `cta_url`, `image`, `sort_order`, `is_active`).
- `AnnouncementBar`: fields (`text`, `bg_color`, `text_color`, `is_active`).

### 2. `apps/authentication` (Update Existing)
- Role permission mapping to DRF permissions.
- `AuditLog`: fields (`user`, `action`, `module`, `ip_address`, `timestamp`, `details_json`).

### 3. `apps/analytics` (New App)
- Query aggregation services for sales metrics, daily charts, and top selling products.

---

> **Summary:**
> This updated blueprint provides complete coverage of the **Order Confirmation Workflow (Vendor & Rider Assignment)**, **Product Variant Discount Engine**, **Dynamic CMS**, **RBAC Access Control**, and **Generic Model Explorer**. All Super Admin portal development will follow this guide.

---

## 📊 Super Admin Portal Implementation Progress Tracker

| Section # & Title | Status | Features Implemented (কী কী করা হয়েছে) | Pending Tasks (যদি কিছু বাকি থাকে) | Extra Features Implemented (অতিরিক্ত যুক্ত বিষয়) |
|---|---|---|---|---|
| **Section 00 — Unified Master Creation Hub** | **`DONE`** | • Dedicated Creation Center (`/admin/creation`) with 6 clean visual step wizards.<br>• **Category & Sub-category Creation** (`POST /api/products/categories/`).<br>• **Product Master Creation** (`POST /api/products/products/`) with Rx prescription requirement toggle.<br>• **Product Variant & Meta JSON Builder** (`POST /api/products/variants/`):<br> - Exact `meta` JSON flags: `is_hot_deal` 🔥, `is_best_selling` 🏆 (Best Selling), `is_featured` ⭐ (Featured / Quick Access), `is_flash_sale` ⚡ (Flash Sale).<br>• **Dynamic Key-Value Pair Builder** (`DynamicMetaKeyValueBuilder.tsx`) for `short_description` & `long_description` JSON objects.<br>• **Brand / Pharma Manufacturer Creation** (`BrandCreateForm.tsx`, `POST /api/products/brands/`).<br>• **Initial Stock & Inventory Setup** (`InventoryCreateForm.tsx`, `POST /api/products/inventories/`).<br>• **Variant Image Gallery Uploader** (`POST /api/products/images/`). | None (100% Complete) | • Clean 6-step wizard UI eliminating cluttered "ghiji miji" design.<br>• Auto-serializes key-value arrays to clean JSON objects for DRF.<br>• Calculated Net Available Stock preview badge (`stock_qty - reserved - damaged`). |
| **Section 01 — Base Admin Layout & Dynamic Theme System** | **`DONE`** | • `AdminLayout` with responsive mobile drawer.<br>• `AdminSidebar` with 10+ module links & badge counters.<br>• `AdminHeader` with Command Search (`Ctrl+K`), 4 System Themes picker, Notification Popover & Admin Profile dropdown.<br>• `AdminGuard` auth route protector.<br>• `DashboardOverview` with executive stat cards. | None (100% Complete) | • Keyboard shortcut (`Ctrl+K`) for command search modal.<br>• Real-time DRF API status indicator in sidebar footer. |
| **Section 02 — Order Processing, Multi-Vendor & Rider Assignment Flow** | **`DONE`** | • `OrderFulfillmentPage` (`/admin/orders`) with status tabs & search.<br>• `OrderDetailModal` implementing exact 4-step workflow:<br> 1. Order Detail Inspection & Address Snapshot<br> 2. Variant Item Vendor Selection (`PATCH /api/admin/orders/{id}/assign-vendor/`)<br> 3. Delivery Rider Dispatch (`PATCH /api/admin/orders/{id}/assign-rider/`)<br> 4. Confirm Order & Reserve Stock (`PATCH /api/admin/orders/{id}/confirm/`)<br>• Status transition controls (`/status/`).<br>• Full DRF API service (`adminOrder.api.ts`). | None (100% Complete) | • Interactive Order Lifecycle timeline bar.<br>• Auto-disabling Confirm button with helper alert when vendor/rider is missing.<br>• Toast feedback notifications on every step.<br>• Fixed 401 unauthenticated Axios redirect bypass on `/admin` routes. |
| **Section 03 — Product Catalog & Dynamic Pricing Engine** | **`DONE`** | • Dedicated Catalog & Pricing Hub (`/admin/catalog`) focused on variant listing, price management & discount rule builder.<br>• `BulkDiscountModal` supporting Flat (৳) or Percentage (%) discount calculations with multi-select & real-time preview table.<br>• `SingleVariantEditModal` for individual variant price & `sale_price` updates.<br>• Promotional badges displaying Hot Deal 🔥, Best Selling 🏆, Featured ⭐, Flash Sale ⚡.<br>• DRF API integration (`adminCatalog.api.ts`). | None (100% Complete) | • Direct shortcut button to Section 00 Master Creation Hub.<br>• Real-time savings & discount percentage calculations (`% OFF` badge).<br>• Multi-variant select-all/deselect-all batch action controller. |
| **Section 04 — Executive Dashboard & Real-Time Sales Analytics** | **`DONE`** | • **Executive Analytics Service** (`adminAnalytics.api.ts`): Real-time revenue aggregates, active orders count, customer counts & prescription queue metrics.<br>• **Interactive Revenue & Orders Chart**: SVG Area/Bar chart visualizer with timeframe filter toggle (`Daily`, `Weekly`, `Monthly`, `Yearly`) and interactive data point hover tooltips.<br>• **Category Sales Donut Split**: Visual SVG Donut chart displaying percentage revenue breakdown across Prescription, OTC, Baby Care & Healthcare Devices.<br>• **Top Selling Products Ranking Table**: Ranked Top 5 items with sales volume (pcs) and total BDT ৳ revenue.<br>• **Pharmacy Vendor Performance Table**: Active pharmacy hubs with fulfilled orders count, rating ★, and total payout summaries. | None (100% Complete) | • Zero external chart bundle dependencies (pure lightweight SVG rendering engine).<br>• Interactive hover tooltip displaying exact revenue & order count for time intervals.<br>• Direct quick-action navigation shortcuts to Orders, Catalog, CMS & Model Explorer. |
| **Section 05 — Dynamic CMS & Banner / Hero Section Control** | **`DONE`** | • **Dynamic CMS Hub (`/admin/cms`)**: Comprehensive management of homepage Hero slides and top announcement bar marquee text.<br>• **Hero Section Media & Content Controller** (`CmsBannerPage.tsx`): Manage headline titles, subheadlines, promotional badge tags (e.g. `BUY 1 GET 1 FREE`), CTA button text & target link URLs.<br>• **Top Announcement Marquee Bar Editor**: Edit announcement text, select background color themes (`Midnight`, `Emerald`, `Indigo`, `Rose`, `Amber`), and toggle visibility.<br>• **Consumer Portal Integration**: Dynamic binding in consumer `Header.tsx` and `HomePage.tsx` so all CMS updates immediately update the live consumer site. | None (100% Complete) | • Scaled live preview card showing instant visual rendering of Hero slide changes before publishing.<br>• Instant published/draft toggle per hero slide.<br>• Full fallback persistence store guaranteeing data consistency across refreshes. |
| **Section 06 — Granular User Access Control (RBAC) & Staff Roles** | **`DONE`** | • **RBAC Hub (`/admin/rbac`)**: Granular Role-Based Access Control and Staff Onboarding Engine.<br>• **Role Creator & Dynamic Permission Matrix**: Configure sub-admin roles (Super Admin, Order Lead, Catalog Manager, Rx Verifier) with explicit `No Access`, `Read Only`, or `Full Access` privileges across Orders, Catalog, Users, Prescriptions, CMS, and Analytics.<br>• **Staff User Onboarding & Directory**: Manage staff accounts, assign roles, and perform instant 1-click status toggling (`Active` / `Suspended`).<br>• **Security Audit Log**: Security action trail logging actor credentials, action types (`CREATE`, `UPDATE`, `DELETE`, `AUTH`, `STATUS_CHANGE`), modules, descriptions, timestamps, and IP addresses. | None (100% Complete) | • 3-tab glassmorphic interface (`Roles & Matrix`, `Staff Directory`, `Security Audit Trail`).<br>• Real-time metric cards for Total Staff, Defined Roles, Suspended Users & Audit Events.<br>• Full API service (`adminRbac.api.ts`) with fallback local storage persistence. |
| **Section 07 — Generic Model Explorer & Dynamic CRUD Engine** | **`DONE`** | • **Model Explorer Hub (`/admin/explorer`)**: Dynamic database inspection and record management engine replacing raw Django Admin interface while keeping 100% of Django models accessible.<br>• **App Model Inspector Drawer**: Organized sidebar grouped by Django app modules (`Products & Catalog`, `Inventory & Warehouses`, `Order Fulfillment`, `Authentication & Users`, `Marketing & Promos`, `CMS & Content`).<br>• **Auto-Generated Data Table**: Dynamic headers, type-aware column cells (`Boolean` badges, `Foreign Key` pills, `{ JSON }` preview modal viewer), real-time search, and pagination.<br>• **Dynamic Record Editor Modal**: Adaptive input generator for String, Number, Boolean, DateTime, Foreign Key, and JSON syntax validation.<br>• **Batch Actions & Data Export**: Batch row selection, bulk record deletion, and instant **CSV** / **JSON** file download export buttons. | None (100% Complete) | • Solves raw Django Admin limitation by giving Super Admin 100% control over all database tables.<br>• Built-in JSON syntax validator preventing malformed payload saves.<br>• Direct API service (`adminExplorer.api.ts`) with offline fallback support. |
| **Section 09 — Pharmacy Inventory, Expiry & Reorder Management** | **`DONE`** | • **Inventory Hub (`/admin/inventory`)**: Medicine batch tracking, expiry countdown alerts, and low stock threshold manager.<br>• **Batch & Expiry Date Tracking**: Monitor batch numbers (`batch_number`), manufacturing dates (`mfg_date`), expiry dates (`expiry_date`), and unit cost (BDT ৳).<br>• **Automatic Status Engine**: Real-time status tags: `🟢 Healthy Stock`, `⚠️ Low Stock` (< reorder level), `⏳ Expiring Soon` (<= 60 days remaining), `🔴 Expired` (days remaining <= 0).<br>• **Urgent Alert Banners**: Top banner notifications warning admin of expired medicine batches requiring quarantine and low stock reorder triggers.<br>• **Quick Stock Adjustment Modal**: Rapid +/- adjustment of physical stock, reserved qty, and damaged stock. | None (100% Complete) | • Prevents accidental shipment of expired medicines with automatic status flag.<br>• Net available stock calculation (`stock_qty - reserved - damaged`).<br>• API service (`adminInventory.api.ts`) with fallback local storage persistence. |
| **Section 10 — Vendor Settlement, Payouts & Commission Ledger** | **`DONE`** | • **Vendor Settlement Hub (`/admin/vendors`)**: Partner pharmacy financial ledger, platform commission deduction manager, and payout authorization engine.<br>• **Vendor Financial Ledger**: View gross sales (BDT ৳), platform commission percentage (e.g. 10%), total disbursed payouts, and net payable balance for each pharmacy partner.<br>• **Payout Authorization Queue**: Filter payout withdrawal requests by status (`Pending`, `Approved`, `Rejected`).<br>• **Payout Approval Modal**: Authorize vendor balance payouts with mandatory Bank / MFS transaction TRX reference ID logging.<br>• **Payout Rejection Modal**: Reject invalid withdrawal requests with custom reason feedback. | None (100% Complete) | • Automatically updates vendor disbursed amount and remaining payable balance upon approval.<br>• Real-time financial summary cards (Gross Sales, Commission Earned, Disbursed Payouts, Pending Requests).<br>• API service (`adminVendorSettlement.api.ts`) with local storage persistence. |
| **Section 11 — Logistics Fleet & Real-Time Rider Tracking** | **`DONE`** | • **Logistics Fleet Hub (`/admin/logistics`)**: Real-time GPS rider telemetry, fleet dispatch management, and rider workload monitor.<br>• **Live GPS Radar Visualizer**: Spatial grid radar map rendering active riders carrying `OUT_FOR_DELIVERY` medicine packages across Dhaka hubs (Dhanmondi, Gulshan, Uttara, Mirpur, Shahbagh) with animated pulsing radar pins.<br>• **Rider Roster Directory**: Manage riders, vehicle types (`Motorcycle 🏍️`, `Scooter 🛵`, `Electric Bike ⚡`, `Bicycle 🚲`), assigned zones, active order IDs, and ratings ★.<br>• **Duty Status Controller**: Toggle rider availability (`In-Transit`, `On-Duty`, `Off-Duty`).<br>• **Rider Onboarding Modal**: Onboard new delivery riders with name, mobile phone number, vehicle type, and assigned delivery zone. | None (100% Complete) | • Spatial telemetry visualization with animated pulsing radar pin markers.<br>• Operational metrics (Active Fleet Count, In-Transit Packages, Avg Delivery Speed, Customer Satisfaction Rating).<br>• API service (`adminLogistics.api.ts`) with local storage persistence store. |
| **Backend & Portal Sync — Real Database API Integration** | **`DONE`** | • **DRF Real DB Endpoints**: Created `AdminVendorListView` (`GET /api/admin/orders/vendors/`) and `AdminRiderListView` (`GET /api/admin/orders/riders/`) fetching active `VendorProfile` & `RiderProfile` records directly from Django DB.<br>• **Backend Data Flow**: Fully connected `adminOrder.api.ts` and `adminCatalog.api.ts` so all creation, fulfillment, vendor, rider, and variant list queries pull directly from and enter into the DRF Database.<br>• **Consumer Portal Renaming & Meta Field Mapping**: Renamed "Top Deals" $\rightarrow$ **"Best Selling"** (`meta.is_best_selling`) and "Top Rated" $\rightarrow$ **"Flash Sale"** (`meta.is_flash_sale`) across consumer `Header.tsx`, `ProductListPage.tsx`, and `VariantDetailPage.tsx`. | None (100% Complete) | • Automatic fallback seed response if database tables are unpopulated during initial migrations.<br>• Synchronized meta-field JSON structure (`is_best_selling`, `is_flash_sale`, `is_hot_deal`, `is_quick_access`) between Master Creation Hub and Consumer filters. |

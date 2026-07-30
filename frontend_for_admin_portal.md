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

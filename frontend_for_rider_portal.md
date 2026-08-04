# 🚴 PharmaSys — Rider Partner Portal Documentation & Architecture Guide

> **Project:** PharmaSys E-Commerce Rider Partner Portal  
> **Target Audience:** Frontend Developers, Backend Engineers & Logistics Operations Teams  
> **Backend Stack:** Django REST Framework (DRF) + PostgreSQL + Custom Rider Allocation Engine  
> **Base API Endpoint:** `http://localhost:8000/api`  
> **Status:** Phase 07 — Rider Partner Portal Execution Guide  

---

## 📋 Table of Contents

1. [Architecture Overview & System Principles](#1-architecture-overview--system-principles)
2. [Data Models & TypeScript Schemas](#2-data-models--typescript-schemas)
3. [Section 01 — Rider Auth & Profile Enforcement Flow](#section-01--rider-auth--profile-enforcement-flow)
4. [Section 02 — Rider Executive Dashboard & Performance Analytics](#section-02--rider-executive-dashboard--performance-analytics)
5. [Section 03 — Order Assignment Pool & Vendor Product Collection](#section-03--order-assignment-pool--vendor-product-collection)
6. [Section 04 — Core Logical Flow: Single Active Order Constraint & Timeline Sync](#section-04--core-logical-flow-single-active-order-constraint--timeline-sync)
7. [Section 05 — Rider Availability & Live Location Tracking](#section-05--rider-availability--live-location-tracking)
8. [Full API Endpoint Directory (Rider & Order Endpoints)](#full-api-endpoint-directory)
9. [Backend API Implementation & Verification Strategy](#backend-api-implementation--verification-strategy)
10: [Rider Portal Implementation Progress Tracker](#-rider-portal-implementation-progress-tracker)

---

## 1. Architecture Overview & System Principles

The **PharmaSys Express Rider Partner Portal** is a high-performance, mobile-optimized dedicated web portal designed for logistics riders and express delivery personnel. It enables riders to view assigned orders, track product collection vendor locations, update order progress in real-time, monitor daily earnings/COD collections, and manage delivery availability.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RIDER PARTNER PORTAL ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐ ┌───────────────────┐ ┌─────────────────────┐ │
│  │  Rider Auth & Register  │ │ Delivery Dashboard│ │ Order Dispatch Pool │ │
│  └────────────┬────────────┘ └─────────┬─────────┘ └──────────┬──────────┘ │
│               │                        │                      │             │
│  ┌────────────▼────────────────────────▼──────────────────────▼──────────┐  │
│  │             DRF REST API & RIDER PROFILE ENFORCEMENT GATEWAY          │  │
│  └────────────┬────────────────────────┬──────────────────────┬──────────┘  │
│               │                        │                      │             │
│  ┌────────────▼──────────┐ ┌───────────▼───────────┐ ┌────────▼──────────┐ │
│  │ Profile Completion    │ │ Vendor Pickup Info   │ │ Timeline History  │ │
│  │ Check Guard           │ │ & Single Active Guard│ │ Consumer Sync     │ │
│  └───────────────────────┘ └───────────────────────┘ └───────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Pillars:
1. **Mobile-First & Flexible UX**: Optimized for smartphones and tablets used by riders in the field.
2. **Mandatory Profile Completion Guard**: Riders **cannot perform any action on any order** (accepting/picking/updating status) until their profile (NID, License, Vehicle Info, Phone) is completely updated.
3. **Flexible Pick with Single Active Order Constraint**: Riders can pick any assigned order from their task pool, but **must complete (or resolve) that order before picking or starting another order**.
4. **Multi-Vendor Product Collection Details**: Each assigned order clearly displays the assigned Vendors (Pharmacy/Store name, phone, full address) from which the rider must collect the medicines.
5. **Real-time Consumer & Admin Synchronization**: Status transitions (`PROCESSING` ➔ `PACKED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`) populate order timeline history visible to both the consumer on their tracking page and the admin team.

---

## 2. Data Models & TypeScript Schemas

### Rider Profile Schemas
```typescript
export type VehicleType = 'bike' | 'cycle' | 'car';
export type AvailabilityStatus = 'online' | 'offline' | 'busy';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface RiderProfile {
  id: number;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
  };
  vehicle_type: VehicleType;
  vehicle_number: string;
  nid_no: string;
  license_no: string;
  availability_status: AvailabilityStatus;
  verification_status: VerificationStatus;
  current_latitude?: number | null;
  current_longitude?: number | null;
  is_profile_complete: boolean;
  meta?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface RiderProfileUpdatePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  vehicle_type?: VehicleType;
  vehicle_number?: string;
  nid_no?: string;
  license_no?: string;
  availability_status?: AvailabilityStatus;
  current_latitude?: number;
  current_longitude?: number;
}
```

### Rider Order & Pickup Schemas
```typescript
export interface VendorPickupItem {
  vendor_id: number;
  vendor_name: string;
  vendor_type: string;
  vendor_phone: string;
  vendor_address: {
    full_address: string;
    area: string;
    city: string;
  };
  items: Array<{
    item_id: number;
    product_name: string;
    variant_name: string;
    quantity: number;
    sku: string;
    image?: string;
  }>;
}

export interface RiderOrder {
  id: number;
  order_number: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  delivery_address: {
    receiver_name: string;
    receiver_phone: string;
    full_address: string;
    area: string;
    city: string;
    landmark?: string;
  };
  vendor_pickups: VendorPickupItem[];
  subtotal: number;
  delivery_charge: number;
  grand_total: number;
  payment_method: 'COD' | 'BKASH' | 'NAGAD' | 'SSLCOMMERZ' | 'STRIPE';
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  order_status: 'PLACED' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  placed_at: string;
  confirmed_at?: string;
  delivered_at?: string;
  is_active_order: boolean;
}

export interface RiderDashboardSummary {
  today_completed_deliveries: number;
  today_earnings_bdt: number;
  total_completed_deliveries: number;
  availability_status: AvailabilityStatus;
  is_profile_complete: boolean;
  active_order: RiderOrder | null;
  assigned_orders_count: number;
}

export interface RiderStatusUpdatePayload {
  status: 'PROCESSING' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  remarks?: string;
}
```

---

## 3. Section 01 — Rider Auth & Profile Enforcement Flow

### Workflow:
```
[ Register (role: rider) ] ──► [ Login ] ──► [ Profile Check Guard ] ──► Complete Profile (if needed) ──► Unlock Order Actions
```

1. **Rider Registration**:
   - Registration endpoint (`POST /api/auth/register/`) with `role="rider"`.
   - Auto-creates user and initial `RiderProfile`.

2. **Rider Login**:
   - Login via `POST /api/auth/jwt/create/`.
   - JWT contains user role `rider`.

3. **Mandatory Profile Enforcement Guard**:
   - Upon logging in, the portal queries `GET /api/profiles/rider/`.
   - If `is_profile_complete === false` (missing NID, Vehicle No, License, Phone, or Name):
     - Profile alert banner is displayed on the screen.
     - Frontend disables all action buttons on assigned orders.
     - Backend API blocks `PATCH /api/orders/rider/{id}/status/` calls with HTTP 403 Forbidden: `"Profile incomplete. Please update NID, License, and Vehicle info first."`

---

## 4. Section 02 — Rider Executive Dashboard & Performance Analytics

### Dashboard Components:
1. **Header & Status Switch**:
   - Instant Online/Offline toggle (`GET/PATCH /api/profiles/rider/availability/`).
   - Profile completeness status pill (`Verified & Complete` vs `Action Required: Complete Profile`).

2. **Stat Cards Metrics**:
   - **Today's Completed Deliveries**: Count of packages delivered today.
   - **Today's Cash Collected (BDT ৳)**: COD amount collected from customers today.
   - **Lifetime Completed Deliveries**: Total successful deliveries count.
   - **Assigned Tasks Pool**: Number of pending assigned orders waiting for dispatch.

3. **Active Delivery Banner / Widget**:
   - If an order is currently in-progress (`OUT_FOR_DELIVERY` or `PACKED`/`PROCESSING`), it is pinned to the top of the dashboard with quick action buttons.

---

## 5. Section 03 — Order Assignment Pool & Vendor Product Collection

### Features:
1. **Assigned Order List**:
   - Shows all orders where `assigned_rider == current_rider`.
   - Filter tabs: `All Assigned`, `Active Delivery`, `Completed Today`.
   - Search bar by Order Number or Customer Phone.

2. **Vendor Collection Breakdown**:
   - When viewing order details, order items are logically grouped by **Vendor**.
   - Rider can view:
     - Vendor Pharmacy Name & Type
     - Vendor Phone Number (with direct `tel:` click button)
     - Full Vendor Address & Area
     - Specific medicines & quantities to collect from each vendor.

3. **Customer Delivery Details**:
   - Receiver Name & Direct Call button.
   - Exact Delivery Address & Landmark.
   - Payment type badge (e.g. `Cash On Delivery: Collect ৳540` or `Prepaid: ৳0`).

---

## 6. Section 04 — Core Logical Flow: Single Active Order Constraint & Timeline Sync

### 💡 THE SINGLE ACTIVE ORDER RULE & LIFECYCLE:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Admin Assigns Order & Vendor(s) to Rider                           │
│ - Admin selects Rider and Vendor(s) for the placed order.                   │
│ - Order appears in Rider's Assigned Orders Pool.                            │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: Profile Completeness Validation Check                                │
│ - Rider clicks on an order to start working.                                │
│ - System verifies rider.is_profile_complete == True.                        │
│ - If False: BLOCKED ("Complete your NID & Vehicle info first").             │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: Single Active Order Validation Guard                                 │
│ - Rider picks Order A and updates status to PROCESSING / OUT_FOR_DELIVERY.  │
│ - Order A becomes rider's ACTIVE ORDER.                                     │
│ - If rider attempts to start Order B while Order A is active:               │
│   BLOCKED ("You have an active order #ORD-101. Finish it first!").           │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: Timely Status Transition & Timeline Sync                              │
│ - Rider updates status:                                                     │
│   1. PROCESSING ➔ Collecting products from assigned vendors.                │
│   2. PACKED ➔ Items collected and prepared into package.                   │
│   3. OUT_FOR_DELIVERY ➔ En route to customer.                              │
│   4. DELIVERED ➔ Package delivered; COD marked PAID automatically.           │
│ - Status history logged automatically in OrderStatusHistory.                │
│ - Consumer tracking page updates live timeline instantly.                   │
└─────────────────────────┴───────────────────────────────────────────────────┘
```

---

## 7. Section 05 — Rider Availability & Live Location Tracking

### Features:
1. **Availability Toggle**:
   - Rider can switch between `online`, `offline`, and `busy`.
   - When `offline` or `busy`, admin order assignment list reflects status.

2. **Coordinates & Location Tracking**:
   - Rider app updates `current_latitude` and `current_longitude` via GPS API (`PATCH /api/profiles/rider/location/`).
   - Consumer order tracking page reads current coordinates to display rider location.

---

## Full API Endpoint Directory

### 🔑 Auth & Rider Profile
| Method | Endpoint | Description | Status |
|---|---|---|---|
| `POST` | `/api/auth/jwt/create/` | JWT Login for Rider | Existing |
| `POST` | `/api/auth/register/` | Public Registration (role=`rider`) | Existing |
| `GET` | `/api/profiles/rider/` | Fetch Logged-in Rider Profile & Completeness | **Enhanced (`DONE`)** |
| `PATCH` | `/api/profiles/rider/` | Update Rider Profile (NID, License, Vehicle, Phone) | **Enhanced (`DONE`)** |
| `PATCH` | `/api/profiles/rider/availability/` | Update Availability (online/offline/busy) | **Added (`DONE`)** |
| `PATCH` | `/api/profiles/rider/location/` | Update Live GPS Coordinates | **Added (`DONE`)** |

### 📊 Dashboard & Order Management
| Method | Endpoint | Description | Status |
|---|---|---|---|
| `GET` | `/api/orders/rider/dashboard/` | Dashboard Stat Cards, Today's Earnings & Active Order | **Added (`DONE`)** |
| `GET` | `/api/orders/rider/` | List Assigned Orders for Logged-in Rider | Existing |
| `GET` | `/api/orders/rider/{id}/` | Order Details with Vendor Pickup Breakdown | **Enhanced (`DONE`)** |
| `PATCH` | `/api/orders/rider/{id}/status/` | Update Delivery Status (Guarded by Profile & Single Active rule) | **Enhanced (`DONE`)** |

---

## Backend API Implementation & Verification Strategy

The backend has been enhanced across DRF views and serializers:
1. `apps/profiles/serializers.py` — `RiderProfileSerializer` includes nested user details, `is_profile_complete` computer field, and user profile update logic.
2. `apps/profiles/views.py` — `RiderProfileUpdateView` supports `GET` & `PATCH`, plus `RiderAvailabilityView` and `RiderLocationView`.
3. `apps/orders/API/rider/serializers.py` — `RiderOrderStatusUpdateSerializer` supports status choices (`PROCESSING`, `PACKED`, `OUT_FOR_DELIVERY`, `DELIVERED`).
4. `apps/orders/API/rider/views.py` — `RiderDashboardView` returns daily metrics, active order, profile status; `RiderOrderViewSet` enforces profile completeness and single active order guard, and returns vendor pickup location grouping.

---

## 📊 Rider Portal Implementation Progress Tracker

| Section # & Title | Status | Features Implemented (কী কী করা হয়েছে) | Pending Tasks | Extra Features Implemented (অতিরিক্ত যুক্ত বিষয়) |
|---|---|---|---|---|
| **Section 00 — Rider Blueprint & Documentation Setup** | **`DONE`** | • Full architecture blueprint documentation (`frontend_for_rider_portal.md`) created.<br>• Core workflows defined: Rider Auth, Profile Guard, Single Active Order Constraint, Vendor Pickup Grouping, and Timeline Sync. | None | • Detailed TypeScript schemas & endpoint directory specified. |
| **Section 01 — Rider Auth & Profile Verification Guard** | **`DONE`** | • **Rider Auth**: Registered with role `rider` & login JWT.<br>• **Rider Profile API** (`GET/PATCH /api/profiles/rider/`): Includes user info, NID, License, Vehicle details, and `is_profile_complete`.<br>• **Profile Completion Guard**: Order status changes blocked if profile incomplete. | None (100% Complete) | • Vehicle-specific license requirement logic (Cycle vs Motorbike/Car). |
| **Section 02 — Rider Executive Dashboard & Performance Analytics** | **`DONE`** | • **Dashboard API** (`GET /api/orders/rider/dashboard/`): Today's completed count, today's COD earnings (৳), total completed deliveries, availability status, active order object.<br>• **Availability Toggle** (`PATCH /api/profiles/rider/availability/`). | None (100% Complete) | • Active order pinned widget on top of rider dashboard. |
| **Section 03 — Order Assignment & Vendor Pickup Collection** | **`DONE`** | • **Assigned Order List** (`GET /api/orders/rider/`).<br>• **Vendor Pickup Locations** (`GET /api/orders/rider/{id}/`): Groups items by Vendor with Vendor Name, Type, Phone, Full Address & Map location. | None (100% Complete) | • Quick call buttons for customer and vendor store managers. |
| **Section 04 — Single Active Order Rule & Order Lifecycle Sync** | **`DONE`** | • **Single Active Order Constraint**: Prevents starting order B if order A is in progress.<br>• **Order Status Updates** (`PATCH /api/orders/rider/{id}/status/`): `PROCESSING` ➔ `PACKED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`.<br>• **Timeline Sync**: Updates consumer tracking page & marks COD as PAID on delivery. | None (100% Complete) | • Automatic COD payment status settlement upon delivery confirmation. |
| **Section 05 — Rider Frontend Interface & Routing** | **`DONE`** | • **Rider Portal UI** (`frontend/src/portals/rider`): Rider Navigation, Dashboard, Profile Editor, Order List, and Order Detail Modal.<br>• **Router Setup** (`riderRoutes` in React Router). | None (100% Complete) | • Mobile-first responsive glassmorphism UI design. |

---

> **Summary:**  
> All 5 sections of the **PharmaSys Express Rider Partner Portal** are documented and ready for backend & frontend implementation.

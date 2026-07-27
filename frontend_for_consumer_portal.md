# 📱 PharmaSys — Consumer Portal Documentation & Mobile App Integration Guide

> **Project:** PharmaSys E-Commerce Consumer Portal
> **Target Audience:** Frontend Developers & Mobile App Engineers (Android / Kotlin / Flutter / iOS)
> **Backend Stack:** Django REST Framework (DRF) + PostgreSQL + JWT Authentication
> **Base API Endpoint:** `http://localhost:8000/api`
> **Interactive API Docs:** `http://localhost:8000/api/docs/` (Swagger UI)
> **Status:** Sections 01 to 09 Completed (Production Ready)

---

## 📋 Table of Contents

1. [Architecture Overview & Token Flow](#1-architecture-overview--token-flow)
2. [Data Models & TypeScript/Mobile Schemas](#2-data-models--typescriptmobile-schemas)
3. [Section 01 — Base Setup & HTTP Client Logic](#section-01--base-setup--http-client-logic)
4. [Section 02 — Authentication & User Onboarding](#section-02--authentication--user-onboarding)
5. [Section 03 — Home Page & Product Discovery Catalog](#section-03--home-page--product-discovery-catalog)
6. [Section 04 — Product Detail & Variant Selection](#section-04--product-detail--variant-selection)
7. [Section 05 — Cart Management & Initial Address Pre-Check](#section-05--cart-management--initial-address-pre-check)
8. [Section 06 — Wishlist & Saved Items](#section-06--wishlist--saved-items)
9. [Section 07 — Checkout & Payment Workflow](#section-07--checkout--payment-workflow)
10. [Section 08 — Orders History & Real-Time Tracking](#section-08--orders-history--real-time-tracking)
11. [Section 09 — Profile Management & Delivery Addresses](#section-09--profile-management--delivery-addresses)
12. [Full Endpoint Cheat Sheet for Mobile Developers](#full-endpoint-cheat-sheet-for-mobile-developers)

---

## 1. Architecture Overview & Token Flow

PharmaSys Consumer Portal follows a **Fat Service / Thin View** pattern on the backend and an **Event-driven, Query-cached React/Zustand** pattern on the frontend. Mobile applications (Android/iOS) should replicate the same state machine and token lifecycle:

```
[ Mobile App / Frontend ]
          │
          ├── 1. POST /api/auth/jwt/create/ (username & password)
          │   └── Response: { access, refresh }
          │
          ├── 2. Attach Header to all requests:
          │   └── Authorization: Bearer <access>
          │
          └── 3. If HTTP 401 Unauthorized:
              └── POST /api/auth/jwt/refresh/ { refresh }
                  ├── Success: Store new <access> token & retry request
                  └── Failure: Clear session & redirect to Login screen
```

---

## 2. Data Models & TypeScript/Mobile Schemas

### User Profile Schema
```json
{
  "id": 1,
  "username": "01700000000",
  "first_name": "Abrar",
  "last_name": "Zayaan",
  "email": "abrar@example.com",
  "phone_number": "01700000000",
  "gender": "male",
  "date_of_birth": "1998-05-15",
  "profile_image": "/media/profiles/avatar.jpg"
}
```

### Product Variant Item Schema
```json
{
  "id": 10,
  "product_id": 4,
  "product_name": "Napa Extra",
  "product_slug": "napa-extra",
  "variant_name": "500mg/65mg - 100 Tablets Box",
  "short_description": "Paracetamol & Caffeine analgesic for severe headache",
  "sku": "NAPA-EXT-100",
  "price": "250.00",
  "sale_price": "225.00",
  "thumbnail": "/media/products/napa_extra.jpg",
  "category_id": 2,
  "category_name": "Pain Relief",
  "brand_id": 1,
  "brand_name": "Beximco Pharmaceuticals",
  "is_prescription_required": false
}
```

---

## 3. Section 01 — Base Setup & HTTP Client Logic

### Core Mobile/Frontend Business Logic:
1. **Global Interceptor**: Intercept all outgoing HTTP calls. If an `access_token` exists in secure storage (SharedPreferences / EncryptedStorage), automatically add `Authorization: Bearer <token>`.
2. **Automatic Token Refresh**: On receiving `401 Unauthorized`, execute a silent refresh call to `/api/auth/jwt/refresh/`.
3. **Base URL Config**: `http://<your-server-ip>:8000/api`

---

## 4. Section 02 — Authentication & User Onboarding

### Endpoints Used:

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/api/auth/jwt/create/` | Obtain JWT tokens | `{ "username": "...", "password": "..." }` | `{ "access": "...", "refresh": "..." }` |
| `POST` | `/api/auth/users/` | Register new consumer | `{ "username": "...", "phone_number": "...", "password": "...", "re_password": "...", "first_name": "...", "last_name": "...", "email": "..." }` | User Object |
| `GET` | `/api/auth/users/me/` | Current User Info | None (Bearer Token required) | User Object |
| `POST` | `/api/auth/jwt/refresh/` | Refresh Access Token | `{ "refresh": "..." }` | `{ "access": "..." }` |

### Business Logic for Android Developer:
- **Login Input**: Allow user to enter either their **Phone Number** or **Username**. Map this input value to the `username` key in the request payload.
- **On Auth Success**: Save `access` and `refresh` tokens securely. Fetch `/api/auth/users/me/` immediately to populate profile state.

---

## 5. Section 03 — Home Page & Product Discovery Catalog

### Endpoints Used:

| Method | Endpoint | Query Parameters | Description |
|---|---|---|---|
| `GET` | `/api/products/categories/` | None | Hierarchical Category Tree (with subcategories) |
| `GET` | `/api/products/brands/` | None | Brand List |
| `GET` | `/api/products/variants/` | `?page=1&search=napa&category=2&brand=1&ordering=-created_at` | Paginated Variant Items List |
| `GET` | `/api/products/subcategories/{id}/variants/` | None | Variants by subcategory ID |

### Business Logic for Android Developer:
- **Search Bar**: Implement **300ms Debounce** on search input before invoking `getVariants(?search=...)`.
- **Card Display**: Always display **`product_name`** in bold header and **`variant_name`** (e.g. `500mg - Box of 10`) underneath to help customers differentiate medicine dosages easily.

---

## 6. Section 04 — Product Detail & Variant Selection

### Endpoints Used:

| Method | Endpoint | Description | Response |
|---|---|---|---|
| `GET` | `/api/products/variants/{id}/` | Full Variant Detail | `ProductVariantDetail` (images, SKU, stock, Rx flag, descriptions) |

### Business Logic for Android Developer:
- **Prescription Warning**: If `is_prescription_required == true`, display a prominent Red **`Rx` Badge** and Prescription Required alert box.
- **Direct Buy Now Action**: "Buy Now" bypasses the cart drawer and navigates straight to Checkout with parameters `?variant_id={id}&qty={quantity}`.

---

## 7. Section 05 — Cart Management & Initial Address Pre-Check

### Endpoints Used:

| Method | Endpoint | Request Payload | Description |
|---|---|---|---|
| `GET` | `/api/cart/` | None | Fetch user active cart |
| `POST` | `/api/cart/items/` | `{ "product_variant_id": 10, "quantity": 1 }` | Add item to cart |
| `PATCH` | `/api/cart/items/{itemId}/` | `{ "quantity": 3 }` | Update item quantity |
| `DELETE` | `/api/cart/items/{itemId}/` | None | Remove item |
| `DELETE` | `/api/cart/` | None | Clear entire cart |

### 💡 CRITICAL BUSINESS LOGIC: Initial Address Check Before Cart Add
Before allowing a user to add an item to the cart or proceed to order:
1. Check if the user has at least **1 registered address** (`/api/profiles/consumer/addresses/`).
2. If `addresses.length === 0`: Show an **Address Setup Modal/Screen** prompting the user to fill initial delivery details (`receiver_name`, `receiver_phone`, `full_address`, `area`, `city`).
3. Once address is created, resume the Add to Cart action!

---

## 8. Section 06 — Wishlist & Saved Items

### Business Logic for Android Developer:
- Maintain wishlist IDs locally (or sync via API).
- Show heart icon status on all variant cards.
- Quick action button: "Add to Cart" directly from Wishlist items.

---

## 9. Section 07 — Checkout & Payment Workflow

### Endpoints Used:

| Method | Endpoint | Request Payload | Description |
|---|---|---|---|
| `POST` | `/api/checkout/preview/` | `{ "address_id": 1, "coupon_code": "PHARMA10" }` | Cart Checkout Price Calculation Preview |
| `POST` | `/api/checkout/direct-preview/` | `{ "product_variant_id": 10, "quantity": 2, "address_id": 1, "coupon_code": "" }` | Buy-Now Checkout Preview |
| `POST` | `/api/orders/` | `{ "address_id": 1, "payment_method": "COD", "coupon_code": "", "notes": "" }` | Finalize Order from Cart |
| `POST` | `/api/orders/buy-now/` | `{ "product_variant_id": 10, "quantity": 2, "address_id": 1, "payment_method": "COD" }` | Finalize Direct Buy-Now Order |

### Business Logic for Android Developer:
1. **Default Payment**: Set `payment_method = "COD"` (Cash on Delivery) as active default option. UI stubs for bKash/Nagad can be disabled.
2. **Order Success Action**: On successful HTTP 201 response:
   - Clear Cart state completely (`cartCount = 0`).
   - Navigate to `/order-success/{orderId}` screen showing celebrating animation, invoice details, and "Track Order" button.

---

## 10. Section 08 — Orders History & Real-Time Tracking

### Endpoints Used:

| Method | Endpoint | Description | Response |
|---|---|---|---|
| `GET` | `/api/orders/` | Paginated Customer Orders | Array of Order Objects |
| `GET` | `/api/orders/{id}/` | Single Order Detail | Full Order Object with `product_snapshot` |
| `PATCH` | `/api/orders/{id}/cancel/` | Cancel Order | Updated Order (only allowed if status == `PLACED`) |
| `GET` | `/api/orders/{id}/tracking/` | Real-time Tracking Info | Tracking timeline + assigned Rider details |

### Status Colors & Stepper Workflow:

| Order Status | Display Label | Mobile Color Theme |
|---|---|---|
| `PLACED` | Order Placed | Blue (`#3b82f6`) |
| `CONFIRMED` | Confirmed | Indigo (`#6366f1`) |
| `PROCESSING` | Preparing | Amber (`#f59e0b`) |
| `PACKED` | Packed & Ready | Orange (`#f97316`) |
| `OUT_FOR_DELIVERY` | On The Way | Cyan/Teal (`#06b6d4`) |
| `DELIVERED` | Delivered | Emerald/Green (`#10b981`) |
| `CANCELLED` | Cancelled | Rose/Red (`#ef4444`) |

### Business Logic for Android Developer:
- **Live Polling**: Enable auto-refresh timer (every **30 seconds**) on the Order Tracking Screen to fetch `/api/orders/{id}/tracking/`.
- **Rider Contact**: If `rider` object exists, render clickable call button using `tel:${rider.phone}`.

---

## 11. Section 09 — Profile Management & Delivery Addresses

### Endpoints Used:

| Method | Endpoint | Content-Type | Description |
|---|---|---|---|
| `GET` | `/api/profiles/consumer/me/` | `application/json` | Fetch current consumer profile |
| `PATCH` | `/api/profiles/consumer/me/` | `multipart/form-data` | Update name, DOB, gender & upload profile avatar |
| `GET` | `/api/profiles/consumer/addresses/` | `application/json` | List delivery addresses |
| `POST` | `/api/profiles/consumer/addresses/` | `application/json` | Create new delivery address |
| `PATCH` | `/api/profiles/consumer/addresses/{id}/` | `application/json` | Edit address |
| `DELETE` | `/api/profiles/consumer/addresses/{id}/` | `application/json` | Delete address |

### Address Payload Schema:
```json
{
  "label": "home",
  "receiver_name": "Abrar Zayaan",
  "receiver_phone": "01700000000",
  "full_address": "House 45, Road 11, Block 3",
  "area": "Dhanmondi",
  "city": "Dhaka",
  "postal_code": "1209",
  "is_default": true
}
```

---

## 12. Full Endpoint Cheat Sheet for Mobile Developers

```
AUTHENTICATION
POST   /api/auth/jwt/create/               → Obtain Access & Refresh Tokens
POST   /api/auth/jwt/refresh/              → Refresh Access Token
POST   /api/auth/users/                    → Register Consumer
GET    /api/auth/users/me/                 → Get Authenticated User Info

CATALOG & DISCOVERY
GET    /api/products/categories/           → Category List with Tree
GET    /api/products/brands/               → Brand List
GET    /api/products/variants/             → Paginated Variants Search & Filter
GET    /api/products/variants/{id}/        → Variant Detail Page Data

SHOPPING CART
GET    /api/cart/                          → Get Active Cart
POST   /api/cart/items/                    → Add Variant to Cart
PATCH  /api/cart/items/{itemId}/           → Update Quantity
DELETE /api/cart/items/{itemId}/           → Remove Item from Cart
DELETE /api/cart/                          → Clear Entire Cart

CHECKOUT & ORDER FINALIZATION
POST   /api/checkout/preview/              → Cart Pricing Calculation
POST   /api/checkout/direct-preview/       → Buy-Now Pricing Calculation
POST   /api/orders/                        → Place Order from Cart
POST   /api/orders/buy-now/                → Place Direct Buy-Now Order

ORDERS & LIVE TRACKING
GET    /api/orders/                        → My Orders List
GET    /api/orders/{id}/                   → Order Details & Invoice
PATCH  /api/orders/{id}/cancel/            → Cancel Placed Order
GET    /api/orders/{id}/tracking/          → Real-time Live Tracking Stepper

PROFILE & ADDRESSES
GET    /api/profiles/consumer/me/          → Get Profile Info
PATCH  /api/profiles/consumer/me/          → Update Profile & Avatar
GET    /api/profiles/consumer/addresses/   → Get Saved Addresses
POST   /api/profiles/consumer/addresses/   → Add Delivery Address
PATCH  /api/profiles/consumer/addresses/{id}/ → Edit Delivery Address
DELETE /api/profiles/consumer/addresses/{id}/ → Delete Address
```

---

> **Note for Future Portals:**
> This document specifically details **Consumer Portal (Portal 1)**. Separate documentation files will be created for:
> 1. `frontend_for_rider_portal.md` (Rider Delivery App & GPS Tracking)
> 2. `frontend_for_vendor_admin_portal.md` (Vendor Inventory & Admin Management Dashboard)


> **To Run Local Network to Public Access With Cloudflare Tunnel:**

Step 1: Start Django Backend Server (Terminal 1)
 > python manage.py runserver 0.0.0.0:8000

Step 2: Start Vite React Frontend (Terminal 2)
 > npm run dev

Step 3: Start Cloudflare Tunnel (Terminal 3)
 > npx cloudflared tunnel --url http://127.0.0.1:5173
# 🛒 PharmaSys — Consumer Portal Frontend: Complete Task & Requirements

> **Project:** PharmaSys E-Commerce Consumer Portal
> **Backend:** Django REST Framework (DRF) + JWT Auth
> **Base API URL:** `http://localhost:8000/api`
> **API Docs:** `http://localhost:8000/api/docs/` (Swagger UI)
> **Approach:** Section-by-section, API-integrated, production-grade build

---

## 📋 Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [Design System](#2-design-system)
3. [Professional Features & Animations](#3-professional-features--animations)
4. [Project Structure](#4-project-structure)
5. [Section 01 — Project Setup & Foundation](#section-01--project-setup--foundation)
6. [Section 02 — Authentication](#section-02--authentication-register--login)
7. [Section 03 — Home Page & Product Discovery](#section-03--home-page--product-discovery)
8. [Section 04 — Product Detail Page](#section-04--product-detail-page)
9. [Section 05 — Cart](#section-05--cart)
10. [Section 06 — Wishlist](#section-06--wishlist)
11. [Section 07 — Checkout & Payment](#section-07--checkout--payment)
12. [Section 08 — Orders & Tracking](#section-08--orders--tracking)
13. [Section 09 — User Profile & Addresses](#section-09--user-profile--addresses)
14. [Section 10 — Polish, SEO & Performance](#section-10--polish-seo--performance)
15. [Full API Endpoint Reference](#full-api-endpoint-reference)
16. [Status Tracker](#status-tracker)

---

## 1. Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| **Framework** | React 19 + Vite | Fast HMR, modern JSX transform |
| **Language** | TypeScript | Type-safe API contracts |
| **Styling** | Tailwind CSS v3 | Utility-first, consistent design |
| **State Management** | Zustand | Lightweight, no boilerplate |
| **Server State** | TanStack Query v5 | Caching, background refetch, mutations |
| **Routing** | React Router v6 | Nested routes, protected routes |
| **Forms** | React Hook Form + Zod | Validation, type-safe schemas |
| **HTTP Client** | Axios | Interceptors for JWT token injection |
| **Animations** | Framer Motion | Page transitions, micro-animations |
| **Icons** | Lucide React | Consistent, tree-shakable icons |
| **Toasts** | React Hot Toast | Elegant success/error notifications |
| **Date Formatting** | date-fns | Lightweight date utilities |

### Install Command
```bash
npm create vite@latest pharmasys-consumer -- --template react-ts
cd pharmasys-consumer
npm install react-router-dom @tanstack/react-query axios zustand \
  react-hook-form zod @hookform/resolvers framer-motion \
  lucide-react react-hot-toast date-fns
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 2. Design System

### 2.1 Color Palette

```css
/* Primary — Indigo Brand */
--color-primary-500: #6366f1;
--color-primary-600: #4f46e5;
--color-primary-700: #4338ca;

/* Accent — Vibrant Teal */
--color-accent-400: #2dd4bf;
--color-accent-500: #14b8a6;

/* Dark Surfaces */
--color-bg-base:    #0f0f13;
--color-bg-surface: #18181f;
--color-bg-card:    #1e1e2a;
--color-bg-border:  #2a2a3a;

/* Text */
--color-text-primary:   #f0f0ff;
--color-text-secondary: #a0a0c0;
--color-text-muted:     #60607a;

/* Status */
--color-success: #22c55e;
--color-warning: #f59e0b;
--color-danger:  #ef4444;
--color-info:    #3b82f6;
```

### 2.2 Typography

```html
<!-- Google Fonts in index.html -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

- **Body:** `Inter` — clean, readable
- **Headings:** `Outfit` — bold, modern
- **Prices / Order Numbers:** `JetBrains Mono` — monospaced

### 2.3 Spacing & Radius

- Cards: `rounded-xl` (12px)
- Modals: `rounded-2xl` (16px)
- Pills/Badges: `rounded-full`
- Glow shadow: `box-shadow: 0 0 20px rgba(99,102,241,0.15)`

---

## 3. Professional Features & Animations

### Framer Motion Animations
- **Page transitions:** fade + slide-up on every route change
- **Product card hover:** scale(1.02) + glow border
- **Cart drawer:** slide-in from right
- **Modal:** fade + scale from center
- **Toast:** slide-in from top-right
- **Skeleton loaders:** shimmer on all loading states
- **Scroll-triggered:** product grid items stagger-in

### Professional E-Commerce Features
- ✅ Sticky header with cart count badge
- ✅ Responsive mobile bottom tab bar
- ✅ Category navigation with subcategories
- ✅ Debounced product search
- ✅ Filter sidebar (price, brand, category)
- ✅ Sort options (newest, price asc/desc)
- ✅ Product image gallery with zoom
- ✅ Prescription required badge + warning
- ✅ Persistent cart (backend-synced)
- ✅ Wishlist (Zustand + localStorage)
- ✅ Coupon code at checkout
- ✅ Order tracking timeline stepper
- ✅ Rider info card on tracking page
- ✅ Profile photo upload
- ✅ Address CRUD management
- ✅ Order cancellation flow
- ✅ Empty states with illustrations
- ✅ 404 page
- ✅ Default dark mode

---

## 4. Project Structure

```
src/
├── api/
│   ├── axios.ts          # Axios instance + JWT interceptor
│   ├── auth.api.ts
│   ├── products.api.ts
│   ├── cart.api.ts
│   ├── checkout.api.ts
│   ├── orders.api.ts
│   └── profile.api.ts
│
├── store/
│   ├── auth.store.ts     # token, user, setAuth, logout
│   ├── cart.store.ts     # item count cache
│   └── wishlist.store.ts # persisted to localStorage
│
├── types/
│   ├── auth.types.ts
│   ├── product.types.ts
│   ├── cart.types.ts
│   ├── order.types.ts
│   └── profile.types.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useCart.ts
│   └── useWishlist.ts
│
├── components/
│   ├── ui/             # Button, Input, Badge, Spinner, Skeleton
│   ├── layout/         # Header, Footer, Sidebar, MobileNav
│   ├── product/        # ProductCard, ProductGrid, ProductFilters
│   ├── cart/           # CartDrawer, CartItem, CartSummary
│   └── order/          # OrderCard, OrderStatusBadge, TrackingTimeline
│
├── pages/
│   ├── HomePage.tsx
│   ├── ProductListPage.tsx
│   ├── VariantDetailPage.tsx
│   ├── CartPage.tsx
│   ├── WishlistPage.tsx
│   ├── CheckoutPage.tsx
│   ├── OrderSuccessPage.tsx
│   ├── OrdersPage.tsx
│   ├── OrderDetailPage.tsx
│   ├── OrderTrackingPage.tsx
│   ├── ProfilePage.tsx
│   ├── AddressesPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── NotFoundPage.tsx
│
├── router/
│   ├── index.tsx
│   └── ProtectedRoute.tsx
│
└── utils/
    ├── formatCurrency.ts
    ├── formatDate.ts
    └── getOrderStatusColor.ts
```

---

## Section 01 — Project Setup & Foundation ✅ DONE

**Goal:** Vite + React TS project running, all libs wired up, layout shell ready.
**Status:** ✅ Complete — App running at `http://localhost:5173/`
**Location:** `pharmaSYS__TEST/frontend/`

### Tasks
- [x] Create Vite project (`react-ts` template), install all dependencies
- [x] Configure `tailwind.config.js` — brand colors (Indigo + Teal), Inter/Outfit/JetBrains Mono fonts, glow shadows, shimmer animation
- [x] `src/index.css` — global dark theme, custom scrollbar, `.skeleton` shimmer, `.glass` utility
- [x] `src/api/axios.ts` — Axios instance:
  - `baseURL: 'http://localhost:8000/api'`
  - Request interceptor → attach `Authorization: Bearer <token>` from Zustand
  - Response interceptor → 401 auto-logout + redirect to `/login`
- [x] `src/api/auth.api.ts` — login, register, refresh
- [x] `src/api/products.api.ts` — categories, brands, variants
- [x] `src/api/cart.api.ts` — get/add/update/remove/clear
- [x] `src/api/checkout.api.ts` — preview, directPreview
- [x] `src/api/orders.api.ts` — place/list/get/cancel/track/buy-now
- [x] `src/api/profile.api.ts` — update profile, addresses CRUD
- [x] `src/store/auth.store.ts` — Zustand + localStorage persist (token, refresh, user)
- [x] `src/store/wishlist.store.ts` — Zustand + localStorage persist (variant IDs)
- [x] `src/store/cart.store.ts` — item count for header badge
- [x] `src/router/index.tsx` — all 15 routes (public + protected, lazy-loaded)
- [x] `src/router/ProtectedRoute.tsx` — auth guard (redirects to `/login`)
- [x] `src/components/layout/Layout.tsx` — page transition animations, scroll-to-top
- [x] `src/components/layout/Header.tsx` — sticky, search bar, cart badge, wishlist badge, user dropdown
- [x] `src/components/layout/Footer.tsx` — 4-column footer with links
- [x] `src/components/layout/MobileNav.tsx` — bottom tab bar with animated active indicator
- [x] `src/components/ui/Button.tsx` — 5 variants, 3 sizes, loading state, Framer Motion tap animation
- [x] `src/components/ui/Input.tsx` — label, error, icon slot, focus ring
- [x] `src/components/ui/Badge.tsx` — 6 color variants
- [x] `src/components/ui/Skeleton.tsx` — block, card, text skeletons with shimmer
- [x] `src/components/ui/PageLoader.tsx` — full-page spinner + inline Spinner
- [x] `src/utils/formatCurrency.ts` — BDT currency + discount % formatter
- [x] `src/utils/getOrderStatusColor.ts` — order status → Tailwind color mapping
- [x] `src/main.tsx` — QueryClient, RouterProvider, themed Toaster wired up
- [x] `vite.config.ts` — `@/*` path alias
- [x] `tsconfig.app.json` — paths config for `@/*`
- [x] All 15 page stubs created (ready for each section to implement)

**Deliverable:** ✅ Running at `http://localhost:5173/` — sticky header with logo + search + cart/wishlist icons, full footer, mobile nav, page transitions working.

---

## Section 02 — Authentication (Register / Login) ✅ DONE

**Goal:** Users can register, log in, receive JWT tokens, stay logged in.
**Status:** ✅ Complete — `/login` and `/register` both live

### Pages
- `LoginPage.tsx` — `/login`
- `RegisterPage.tsx` — `/register`

### API Integration

> ⚠️ **Corrected from backend inspection:**
> - Register body: `{ first_name, last_name, phone, email, password, role: "consumer" }`
> - Login body: `{ phone, password }` — NOT `phone_number`
> - Login response: `{ access, refresh }` only (no user object)

```
POST /api/auth/register/
Body: { first_name, last_name, phone, email, password, role: "consumer" }
→ { message: "Registration Successful and Profile Created!" }

POST /api/auth/login/
Body: { phone, password }
→ { access, refresh }

POST /api/auth/token/
Body: { refresh }
→ { access }
```

### Tasks
- [x] `LoginPage.tsx` — phone + password form, show/hide toggle, Zod validation
- [x] `RegisterPage.tsx` — first_name, last_name, email, phone, password, confirm_password
- [x] `PasswordStrength` component — live checker (length, number, letter)
- [x] Zod schemas for both forms with `@hookform/resolvers`
- [x] On login success → save `access` + `refresh` + `{ phone }` to Zustand + localStorage
- [x] On register success → toast + redirect to `/login`
- [x] Backend field-level error display (e.g., duplicate phone/email)
- [x] `authApi` updated with exact field names matching Django backend
- [x] `auth.store.ts` updated — user shape uses `phone` field
- [x] Header updated — shows phone in user dropdown

### UX Built
- Split layout: animated brand panel (left) + form (right)
- Left panel: gradient blobs, feature list (Login) / stats grid (Register)
- Framer Motion entrance animations on both panels
- Show/hide password toggle on all password fields
- Spinner on submit button while request is pending
- Error toast for failed login; field-level errors for register
- Password strength indicator (live, 3 checks)
- "Back to Login" link on Register page
- Trust badge: "🔒 Your data is encrypted and never shared"

---

## Section 03 — Home Page & Product Discovery ✅ DONE

**Goal:** Category navigation, featured products, search, browse by subcategory.
**Status:** ✅ Complete — Home page (`/`) and Catalog (`/products`) live

### Pages
- `HomePage.tsx` — `/`
- `ProductListPage.tsx` — `/products`

### API Integration

```
GET /api/products/categories/
→ Returns nested category tree with subcategories

GET /api/products/subcategories/{subcategory_id}/variants/
→ Returns product variants under a specific subcategory

GET /api/products/brands/
→ Returns list of pharmaceutical brands

GET /api/products/variants/
→ Returns product variants catalog
```

### Tasks Built
- [x] `HomePage.tsx`:
  - Hero banner with quick search input, "Browse Catalog" & "Upload Prescription" CTAs
  - Top categories grid with drill-down active subcategories strip
  - Featured product variants showcase using `VariantCard`
  - Pharmaceutical brands section (Beximco, Incepta, Square, etc.)
  - Health trust banner & prescription assistance notice
- [x] `ProductListPage.tsx`:
  - Sidebar filters: Categories & subcategories accordion, brand selector, Rx-required checkbox
  - Search input with active filter pill badges
  - Price sorting dropdown (Low-to-High, High-to-Low, Name)
  - Responsive variant cards grid
  - Skeleton loading states and empty state handlers
- [x] `VariantCard.tsx`:
  - Product thumbnail with fallback
  - Prescription badge (Rx Required) & discount percentage badge
  - Wishlist toggle button (persisted to Zustand store)
  - Price display with strikethrough sale price
  - Direct "Add to Cart" button integrated with `cartApi`
- [x] Unauthenticated guest browsing enabled for categories, subcategories, and variants


---

## Section 04 — Variant Detail Page

**Goal:** Show full variant info (the leaf/purchasable entity). Each variant has its own SKU, price, stock, and images. The user lands here from a `VariantCard` click.

> ⚠️ **Architecture Note:** `ProductVariant` is the final purchasable unit in PharmaSys.
> - A **Product** is a generic entity (e.g., "Napa Extra").
> - A **ProductVariant** is what the user actually buys (e.g., "Napa Extra — 500mg / 10 Tab Pack", SKU: MED-001).
> - The detail page is always variant-based. We navigate by `variant ID`.
> - The parent product's info (name, description, brand, category) is embedded in the variant serializer response.

### Page
- `VariantDetailPage.tsx` — `/variants/:id`

### Route Example
```
/variants/42   → show ProductVariant with id=42
```

### API Integration

```
GET /api/products/variants/{id}/
→ {
    id,
    variant_name,       ← e.g., "500mg / 10 Tabs Pack"
    sku,
    price,
    sale_price,         ← null if no discount
    min_order_qty,
    max_order_qty,
    weight,
    dimensions,
    status,
    meta,               ← { pack_size, color, size, ... }
    images: [
      { id, image_url, is_primary, sort_order }
    ],
    product: {
      id, name, slug,
      short_description, long_description,
      is_prescription_required,
      product_type,
      thumbnail,
      brand: { id, name, logo },
      category: { id, name, slug }
    }
  }

GET /api/products/subcategories/{subcategory_id}/variants/
(for "Other Variants of this Product" section — same subcategory)
```

### Tasks
- [x] **Image Gallery:**
  - Use `variant.images` (sorted by `sort_order`)
  - Primary image (`is_primary=true`) shown by default
  - Thumbnail strip below; click to switch
  - Fullscreen zoom modal
- [x] **Variant Header:**
  - `product.name` as the main heading (e.g., "Napa Extra")
  - `variant_name` as subtitle (e.g., "500mg | 10 Tablets Pack")
  - SKU badge: `SKU: MED-001`
- [x] **Pricing:**
  - If `sale_price` exists → show strikethrough `price` + `sale_price` in accent color + discount % badge
  - Else → show `price` only
- [x] **Stock Status:** derive from `status` field (`active` = In Stock, else Out of Stock)
- [x] **Quantity Stepper:** min = `min_order_qty`, max = `max_order_qty` (or a safe default like 10)
- [x] **"Add to Cart"** → `POST /api/cart/items/` `{ variant_id: id, quantity }` → toast "✅ Added to cart"
- [x] **"Buy Now"** → navigate to `/checkout?variant={id}&qty={quantity}`
- [x] **Prescription required warning:** if `product.is_prescription_required` is true → show banner/modal before Buy Now
- [x] **Product Info Tabs:** Description | Details (weight, dimensions, meta) | How to Use
- [x] **Brand & Category info:** small badge row under title
- [x] **Other Variants section:** list sibling variants from same subcategory/product
- [x] **Breadcrumb:** Home > Catalog > {category.name} > {product.name} ({variant_name})

---

## Section 05 — Cart

**Goal:** View, update, remove cart items. Accessible from header (drawer) and full `/cart` page.

### Pages
- `CartDrawer` component (slide-in)
- `CartPage.tsx` — `/cart`

### API Integration

```
GET    /api/cart/                         → full cart with items + totals
POST   /api/cart/items/                   body: { variant_id, quantity }
PATCH  /api/cart/items/{variant_id}/      body: { quantity }
DELETE /api/cart/items/{variant_id}/
DELETE /api/cart/clear/
```

### Tasks
- [ ] `CartDrawer`: slides from right, shows item count, subtotal, CTA buttons
- [ ] `CartPage`: items list + order summary sticky sidebar
- [ ] Item row: thumbnail, name, variant info, qty stepper, price, remove button
- [ ] Real-time totals update on qty change
- [ ] "Proceed to Checkout" → `/checkout`
- [ ] "Continue Shopping" link
- [ ] Empty cart illustration + CTA
- [ ] Cart count badge in header (Zustand)

### UX
- Optimistic UI for qty changes
- Slide-out animation on item remove
- Skeleton on initial load

---

## Section 06 — Wishlist

**Goal:** Save/remove products, view wishlist page.

> **Note:** No dedicated backend wishlist API. Store variant IDs in Zustand + localStorage.

### Page
- `WishlistPage.tsx` — `/wishlist`

### Tasks
- [ ] `wishlistStore`: `{ items: number[], toggle(id), isWishlisted(id), clear() }`
- [ ] Persist via Zustand `persist` middleware → `localStorage`
- [ ] Heart icon on every `ProductCard` — filled if wishlisted
- [ ] `WishlistPage`: fetch variant details from `/api/products/variants/{id}/` for each stored ID
- [ ] Show: image, name, price, "Add to Cart", "Remove from Wishlist"
- [ ] Empty wishlist state with illustration

---

## Section 07 — Checkout & Payment

**Goal:** Address selection, coupon code, price preview, place order.

### Pages
- `CheckoutPage.tsx` — `/checkout`
- `OrderSuccessPage.tsx` — `/order-success/:orderId`

### API Integration

```
POST /api/checkout/
Body: { address_id, coupon_code? }
→ { items, subtotal, discount, tax, delivery_charge, grand_total, coupon_applied }

POST /api/checkout/variants/{variant_id}/
Body: { quantity, address_id, coupon_code? }

GET  /api/profiles/addresses/   (for address selector)

POST /api/orders/
Body: { address_id, payment_method: "COD", coupon_code?, notes? }
→ Order object
```

### Tasks
- [ ] Checkout page layout:
  - Address selector (list saved + "Add New" inline)
  - Order items review
  - Coupon code input + "Apply" button → re-hits `/checkout/` with code
  - Price breakdown: subtotal, discount, tax, delivery, **grand total**
  - Payment method selector (COD only for now)
  - "Place Order" button → POST `/api/orders/`
- [ ] On success → redirect to `/order-success/:orderId`
- [ ] `OrderSuccessPage`: ✅ animation, order number, "Track Order" + "Keep Shopping" CTAs
- [ ] Prevent double-submit (disable button + loading spinner)

### UX
- Price panel sticky on desktop
- Coupon success: green badge with discount amount
- Confetti animation on order success page

---

## Section 08 — Orders & Tracking

**Goal:** Order history, detail view, cancel, real-time tracking.

### Pages
- `OrdersPage.tsx` — `/account/orders`
- `OrderDetailPage.tsx` — `/account/orders/:id`
- `OrderTrackingPage.tsx` — `/account/orders/:id/tracking`

### API Integration

```
GET   /api/orders/              → paginated order list
GET   /api/orders/{id}/         → full order detail
PATCH /api/orders/{id}/cancel/  → cancel (only if PLACED)
GET   /api/orders/{id}/tracking/
→ { order_number, current_status, placed_at, confirmed_at, delivered_at,
    cancelled_at, rider: { name, phone, vehicle_type, vehicle_number,
    current_latitude, current_longitude }, history: [{status, remarks, created_at}] }
```

### Tasks
- [ ] **OrdersPage:** order cards with filter tabs (All / Active / Delivered / Cancelled) + pagination
- [ ] **OrderDetailPage:**
  - Header: order number, date, status badge
  - Items from `product_snapshot` (immutable data)
  - Price breakdown
  - Address snapshot display
  - Coupon info if applied
  - "Cancel Order" button (only if status == PLACED)
  - "Track Order" link
- [ ] **OrderTrackingPage:**
  - Visual stepper: Placed → Confirmed → Processing → Packed → Out for Delivery → Delivered
  - Each step: status + timestamp from history
  - Rider info card
  - Lat/Lng display (map placeholder for v1)
  - Auto-refresh every 30 seconds via `useQuery` `refetchInterval`

### Status → Color Mapping
| Status | Color |
|---|---|
| PLACED | Blue |
| CONFIRMED | Indigo |
| PROCESSING | Yellow |
| PACKED | Orange |
| OUT_FOR_DELIVERY | Teal |
| DELIVERED | Green |
| CANCELLED | Red |

---

## Section 09 — User Profile & Addresses

**Goal:** Edit personal info, manage delivery addresses.

### Pages
- `ProfilePage.tsx` — `/account/profile`
- `AddressesPage.tsx` — `/account/addresses`

### API Integration

```
PATCH /api/profiles/consumer/update/
Body (multipart): { date_of_birth, gender, profile_image }

GET    /api/profiles/addresses/
POST   /api/profiles/addresses/
       Body: { label, receiver_name, receiver_phone, full_address,
               landmark, area, city, postal_code, is_default }
PATCH  /api/profiles/addresses/{id}/
DELETE /api/profiles/addresses/{id}/
```

### Tasks
- [ ] **ProfilePage:**
  - Avatar with upload + preview
  - Read-only: username, email, phone_number
  - Editable: date_of_birth, gender
  - Save with success toast
- [ ] **AddressesPage:**
  - Address cards: label badge (Home/Office/etc.), name, full address, default star
  - "Add Address" → modal form
  - "Edit" → modal pre-filled
  - "Delete" → confirm dialog
  - Set default toggle
- [ ] **Account Sidebar Layout:** Profile | Addresses | Orders | Wishlist | Logout

---

## Section 10 — Polish, SEO & Performance

**Goal:** Production-ready finish with accessibility, SEO, and mobile UX.

### Tasks
- [ ] `<title>` + `<meta name="description">` per page
- [ ] Single `<h1>` per page, correct heading hierarchy
- [ ] `aria-label` on all icon-only buttons
- [ ] `loading="lazy"` on all below-fold images
- [ ] All interactive elements have unique `id` attributes
- [ ] Skeleton loaders on every async data point
- [ ] Global error boundary component
- [ ] Scroll-to-top on route change
- [ ] Mobile: bottom tab bar (Home | Categories | Cart | Orders | Profile)
- [ ] 404 Not Found page
- [ ] Final end-to-end API integration test pass
- [ ] Responsive audit: 375px / 768px / 1280px / 1440px

---

## Full API Endpoint Reference

| Module | Method | Endpoint | Auth |
|---|---|---|---|
| Auth | POST | `/auth/register/` | ❌ |
| Auth | POST | `/auth/login/` | ❌ |
| Auth | POST | `/auth/token/` | ❌ |
| Products | GET | `/products/brands/` | ❌ |
| Products | GET | `/products/categories/` *(includes `children` subcategories)* | ❌ |
| Products | GET | `/products/subcategories/{id}/variants/` | ❌ |
| Products | GET | `/products/variants/{id}/` *(Variant Detail — main page endpoint)* | ❌ |
| Products | GET | `/products/variants/?product={id}` | ❌ |
| Cart | GET | `/cart/` | ✅ |
| Cart | POST | `/cart/items/` | ✅ |
| Cart | PATCH | `/cart/items/{variant_id}/` | ✅ |
| Cart | DELETE | `/cart/items/{variant_id}/` | ✅ |
| Cart | DELETE | `/cart/clear/` | ✅ |
| Checkout | POST | `/checkout/` | ✅ |
| Checkout | POST | `/checkout/variants/{variant_id}/` | ✅ |
| Orders | POST | `/orders/` | ✅ |
| Orders | GET | `/orders/` | ✅ |
| Orders | GET | `/orders/{id}/` | ✅ |
| Orders | PATCH | `/orders/{id}/cancel/` | ✅ |
| Orders | GET | `/orders/{id}/tracking/` | ✅ |
| Orders | POST | `/orders/buy-now/` | ✅ |
| Profile | PATCH | `/profiles/consumer/update/` | ✅ |
| Addresses | GET | `/profiles/addresses/` | ✅ |
| Addresses | POST | `/profiles/addresses/` | ✅ |
| Addresses | PATCH | `/profiles/addresses/{id}/` | ✅ |
| Addresses | DELETE | `/profiles/addresses/{id}/` | ✅ |

---

## Status Tracker

| Section | Status | Notes |
|---|---|---|
| Section 01 — Setup & Foundation | ✅ DONE | Vite + React TS, all APIs, stores, router, layout, UI components |
| Section 02 — Authentication | ✅ DONE | Login (phone/username) + Register with Zod, JWT tokens, split-screen UI |
| Section 03 — Home & Product Catalog | ✅ DONE | Responsive home page & catalog, flyout hover category tree, guest browsing |
| Section 04 — Product Detail | ✅ DONE | Variant details, image gallery zoom, Rx alert, quantity stepper, cart & wishlist integration |
| Section 05 — Cart | ⬜ TODO | |
| Section 06 — Wishlist | ⬜ TODO | |
| Section 07 — Checkout & Payment | ⬜ TODO | |
| Section 08 — Orders & Tracking | ⬜ TODO | |
| Section 09 — Profile & Addresses | ⬜ TODO | |
| Section 10 — Polish & SEO | ⬜ TODO | |

---

> **Current:** Section 03 & Authentication Fixes ✅ COMPLETED.
>
> **Next Step:** Tell me **"start section 04"** to build the **Product Variant Detail Page** (`/variants/:id`).


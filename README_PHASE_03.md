
# README - Phase 03 (Updated)

## 1. Phase Goal

Phase-03 focuses on implementing the complete purchase pipeline of the Pharmacy E-commerce Platform.

The objective is to build a production-ready flow where every business rule is placed inside the Service Layer.

```
Product
    ↓
Cart
    ↓
Checkout
    ↓
Validate Default Address
    ↓
Validate Inventory
    ↓
Validate Coupon
    ↓
Calculate Order Summary
    - Subtotal
    - Coupon Discount
    - Tax
    - Delivery Charge
    - Final Amount
    ↓
Place Order
    ↓
Create CouponUsage Record
    ↓
Update Coupon Usage
```

---

# 2. Architecture

Model
→ Serializer
→ Service Layer
→ GenericAPIView
→ URL
→ Swagger

Business logic must never be written inside Views.

---

# 3. Development Progress

## Step-1 Cart Module ✅ Completed

Completed

- Cart Model
- Cart Item Model
- Business Validation
- Service Layer
- CRUD APIs
- API Testing

Status: Production Ready

---

## Step-2 Coupon Module ✅ Core Completed

Completed

- Coupon Model
- Enums
- Model Validation
- full_clean()
- Coupon CRUD APIs
- Serializer
- Service Layer
    - validate_coupon()
    - calculate_discount()
- API Testing (GET/POST/PATCH/DELETE)

Current Scope

The Coupon module is intentionally limited to coupon management only.
Coupon usage validation and order calculation will be handled from Checkout and Order modules.

Remaining (Later)

- Swagger
- CouponUsage integration
- Usage Limit Validation
- Per-user Usage Validation

Status: Stable

---

## Step-3 Checkout Module ✅ Completed

Purpose

Checkout is the business engine of the order process.

Responsibilities

Completed

- CheckoutRequestSerializer
- CheckoutResponseSerializer
- CheckoutService
- validate_cart()
- validate_address() (Default Address Strategy)
- validate_stock()
- calculate_subtotal()
- apply_coupon()
- calculate_tax() (Placeholder)
- calculate_delivery_charge() (Placeholder)
- calculate_grand_total()
- generate_checkout()
- Checkout API
- Swagger Documentation
- API Testing

Responsibilities

- Load User Cart
- Validate Cart
- Receive Coupon Code
- Call CouponService.validate_coupon()
- Calculate Discount
- Calculate Subtotal
- Calculate Delivery Charge
- Calculate Tax
- Calculate Final Payable Amount
- Return Complete Order Summary

Output Example

- Subtotal
- Discount
- Tax
- Delivery
- Grand Total

---

## Step-4 Order Module

Responsibilities

- Create Order
- Create Order Items
- Save Pricing Snapshot
- Save Coupon Used
- Prepare Payment
- Reserve/Deduct Inventory (if applicable)

---

## Step-5 Coupon Usage

Responsibilities

- Create CouponUsage record
- Increase Used Count
- Validate Global Usage Limit
- Validate Per-user Usage Limit

This module executes only after a successful order.

---

## Step-6 Order Workflow

Order Status

- Pending
- Confirmed
- Processing
- Shipped
- Delivered
- Cancelled

---

# 4. Folder Structure

apps/

- cart/
- coupons/
- checkout/
- orders/

Each module follows:

- models.py
- serializers.py
- services.py
- views.py
- urls.py

---

# 5. Current API Status

Completed

Cart APIs

Coupon CRUD APIs

Completed

Checkout APIs

Upcoming

Order APIs

Coupon Usage APIs

---

# 6. Business Rules

Current

- One coupon per order
- Coupon code unique
- Coupon stored uppercase
- Active coupon only
- Start/End date validation
- Minimum order validation
- Percentage <=100%
- Fixed discount <= subtotal
- Max discount supported

Future

- Global usage limit
- Per-user usage limit
- Coupon history
- Order-based coupon validation

---

# 7. Phase-03 Roadmap

✅ Cart

↓

✅ Coupon CRUD

↓

✅ Coupon API Testing

↓

✅ Checkout Module

↓

Order Module

↓

CouponUsage

↓

Usage Validation

↓

Order Workflow

---

# 8. Development Principle

- Keep business logic inside Service Layer.
- Views should remain thin.
- Checkout consumes Cart and Coupon services.
- Order consumes Checkout results.
- CouponUsage is created only after successful order creation.

This sequence should remain unchanged throughout Phase-03.


---

# 9. Checkout Design Decisions (Final)

## Current Checkout Flow

```
Product
    ↓
Cart
    ↓
Checkout
    ↓
Validate Cart
    ↓
Validate Default Address
    ↓
Validate Inventory
    ↓
Validate Coupon
    ↓
Calculate Pricing
    ↓
Return Checkout Summary
    ↓
Order Module
```

## Important Decisions

Implemented in Phase-03

- Checkout uses Service Layer only.
- Views remain thin.
- Coupon logic is reused from CouponService.
- Cart total_price is reused.
- Inventory is validated before pricing.
- Default Address is used during checkout.
- Checkout DOES NOT create Order.
- Checkout DOES NOT assign Vendor.
- Checkout DOES NOT reduce Inventory.
- Checkout only returns a validated checkout summary.

Deferred to Next Phase (Order Module)

- Order Creation
- Order Item Creation
- Vendor Assignment
- Inventory Reservation
- Inventory Deduction
- CouponUsage Record
- Coupon Used Count Update
- Payment Integration
- Invoice Generation
- Order Status Workflow

Phase-03 Status: Checkout V1 Completed ✅
Next Development Target: Order Module

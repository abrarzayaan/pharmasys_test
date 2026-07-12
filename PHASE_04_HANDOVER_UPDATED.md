# PharmaSys Phase-04 Handover Context

## Project Rules
- Continue ONLY from the current architecture.
- Follow the existing PharmaSys coding style.
- Fat Service, Thin View architecture.
- Work step-by-step.
- Always mention the exact file path before writing code.
- When a file changes significantly, return the complete file.
- Avoid unnecessary refactoring unless it fixes a bug.

# Current Phase-04 Status

## Orders Module
Completed:
- Orders app
- choices.py
- constants.py
- admin.py
- migrations

## Models
Completed:
- Order
- OrderItem
- Payment
- OrderStatusHistory
- CouponUsage

Architecture:
- Order.customer -> ConsumerProfile
- Order.assigned_rider -> RiderProfile
- OrderItem.product_variant -> ProductVariant
- OrderItem.vendor -> VendorProfile (nullable)
- Address Snapshot
- Coupon Snapshot
- Payment OneToOne
- CouponUsage inside coupons app

## CheckoutService
Completed:
validate_cart
validate_address
validate_stock
calculate_subtotal
apply_coupon
calculate_tax
calculate_delivery_charge
calculate_grand_total
calculate_checkout
generate_checkout

Pricing logic exists ONLY here.

## OrderService
Completed:
create_order
create_order_items
generate_order_number
save_address_snapshot
save_coupon_snapshot
get_cart
validate_cart
cancel_order (placeholder)

Flow:
Checkout -> calculate_checkout -> create_order -> create_order_items -> create_payment -> clear_cart

## PaymentService
Completed and integrated.

## AdminOrderService
Completed:
assign_vendor
assign_rider
confirm_order
change_order_status

Helpers:
_validate_vendor
_validate_rider
_validate_inventory
_deduct_inventory
_update_inventory_status
_create_status_history

Confirm Flow:
Assign Vendor
Assign Rider
Validate Inventory
Deduct Inventory
Update Inventory Status
CouponUsage
Status History
Order Confirmed

Business Rules:
Vendor assigned after placement.
Rider assigned before confirmation.
Inventory deducted only on confirmation.
CouponUsage created only on confirmation.
Payment.status is source of truth.
Order.payment_status mirrors Payment.status.

## Remaining
1. Admin Order API
2. Customer Order API
3. Rider APIs
4. Tracking APIs
5. Testing
6. Final documentation

## Next Chat
Start directly with Admin Order API:
- serializers
- views
- urls
- testing

Service layer is complete.

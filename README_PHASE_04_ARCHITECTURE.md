__#__Phase-04 : Order Module Design V1

Customer
    │
    ▼
Checkout
    │
    ▼
Order Created
(Status = PLACED)
    │
    ▼
Admin Review
    │
    ├── Assign Vendor(s)
    ├── Assign Rider
    ├── Verify Stock
    │
    ▼
Confirm Order
(Status = CONFIRMED)
    │
    ▼
Inventory Deduct
    │
    ▼
Processing
    │
    ▼
Packed
    │
    ▼
Out For Delivery
    │
    ▼
Delivered



__#__Database Design: আমি ৫টা Model করবো।

 - Order
 - OrderItem
 - Payment
 - OrderStatusHistory
 - CouponUsage
CouponUsage already planned আছে, তাই Phase-04 এ integrate হবে।


__#__1. Order: এটা শুধু Order-এর Header Information রাখবে।

Order (Model)

- id
- order_number
- customer
- address_snapshot
- coupon
- subtotal
- discount
- tax
- delivery_charge
- grand_total
- payment_method
- payment_status
- order_status
- assigned_rider
- placed_at
- confirmed_at
- delivered_at
- cancelled_at
- created_at
- updated_at

এখানে কিছু গুরুত্বপূর্ণ Decision
address_snapshot

ForeignKey রাখবো না।
JSONField রাখবো।

কারণ
Customer পরে Address edit করলে পুরানো Order change হওয়া যাবে না।

Example: 
{
    "name":"Rahim",

    "phone":"017xxxxxxxx",

    "division":"Dhaka",

    "district":"Gazipur",

    "address":"House 12"
}


coupon
Coupon FK রাখা যাবে।
কিন্তু Coupon delete হলে?

আমি বলবো:
on_delete=models.SET_NULL

আর:
Coupon Snapshot-ও রাখবো।
coupon_snapshot

JSONField: কারণ
Coupon future এ change হতে পারে।


Pricing Snapshot
আমি subtotal, discount, tax সব Order-এ save করবো।
Checkout থেকে calculate হয়ে আসবে।
Order আর calculate করবে না।

এটা immutable data।


__#__2. OrderItem: এটাই  সবচেয়ে  important।


OrderItem (Model)

- order
- product_varient
- vendor
- quantity
- unit_price
- total_price
- product_snapshot
- created_at

product_snapshot

JSONField: কারণ

Product Name change হতে পারে।
Image change হতে পারে।
SKU change হতে পারে।

Example:
{
    "name":"Napa Extra",

    "sku":"MED-001",

    "price":120,

    "strength":"500mg"
}

Vendor কেন OrderItem এ?
আজ: Medicine A -> Vendor A
আগামী বছর: Medicine A -> Medicine A | Medicine B -> Vendor C
একই Order-এ multiple vendor support করতে পারবে।

Architecture change লাগবে না।


__#__3. Payment: Payment আলাদা  Model হবে।

Payment (Model)

- order
- method
- status
- transaction_id
- gateway_response
- amount
- paid_at
- created_at


কেন আলাদা?

আজ
COD

আগামীকাল
SSLCommerz
bKash
Nagad
Stripe

সব add করা যাবে।

Order table clean থাকবে।


__#__4. OrderStatusHistory: এটা আমি  অবশ্যই  রাখবো।

OrderStatusHistory (Model)

- order
- status
- changed_by
- remarks
- created_at

Example:

Placed

↓

Confirmed

↓

Processing

↓

Packed

↓

Out for delivery

↓

Delivered


Customer timeline বানানো যাবে।
Admin audit থাকবে।
কে status change করেছে জানা যাবে।


__#__5. CouponUsage: এইটা  already planned (Order Success হলে)

CouponUsage (Model)

- user
- coupon
- order
- discount

__#__Status Design: Order Status


- PLACED
- CONFIRMED
- PROCESSING
- PACKED
- OUT_FOR_DELIVERY
- DELIVERED
- CANCELLED

__#__Payment Status


- PENDING
- PAID
- FAILED
- REFUNDED

 
__#__Business Rules: এটাই  সবচেয়ে  important।


1. Rule-1: Checkout ছাড়া Order Create হবে না।
2. Rule-2: Order Create হলে, Status হবে PLACED
3. Rule-3: Customer আর Order Edit করতে পারবে না। শুধু Cancel করতে পারবে (যদি Confirm না হয়)।
4. Rule-4: Admin Confirm না করলে, Inventory কমবে না।
5. Rule-5: Admin, Vendor Assign করবে।
6. Rule-6: Admin, Rider Assign করবে।
7. Rule-7: Vendor + Rider assign না করে, Order Confirm করা যাবে না।
8. Rule-8: Confirm করার সময়, Inventory Validate হবে আবার। কারণ Checkout-এর পরে Stock change হতে পারে।
9. Rule-9:

			Confirm Success

			↓

			Inventory Deduct

			↓

			Status = CONFIRMED

10. Rule-10: CouponUsage Create হবে, Confirm হওয়ার পর। আমি এটা Order Create-এর পরে নয়, Confirm-এর পরে করবো। কারণ যদি Admin order reject করে, তাহলে coupon usage অযথা consume হবে না।


__#__API Design:


Customer:

POST   /orders/
GET    /orders/
GET    /orders/{id}/
PATCH  /orders/{id}/cancel/

Admin:

GET    /admin/orders/
GET    /admin/orders/{id}/
PATCH  /admin/orders/{id}/assign-vendor/
PATCH  /admin/orders/{id}/assign-rider/
PATCH  /admin/orders/{id}/confirm/
PATCH  /admin/orders/{id}/status/


__#__Service Layer:

OrderService:

	├── create_order()

	├── create_order_items()

	├── generate_order_number()

	├── save_address_snapshot()

	├── save_coupon_snapshot()

	├── cancel_order()


AdminOrderService:

	├── assign_vendor()

	├── assign_rider()

	├── confirm_order()

	├── change_status()

	├── validate_inventory()

	├── deduct_inventory()

PaymentService:

	├── create_payment()

	├── complete_payment()

	├── fail_payment()

	├── refund()





Step-01 (Current)
apps/orders app create
app registration
folder structure
constants.py
choices.py
managers.py (jodi lage)
initial package setup
Step-02
Order Model
Step-03
OrderItem Model
Step-04
Payment Model
Step-05
OrderStatusHistory Model
Step-06
Migration + Admin Registration
Step-07
Serializers
Step-08
Services Layer
Step-09
Customer APIs
Step-10
Admin APIs
Step-11
Permissions
Step-12
Business Rules
Step-13
TestingStep-01 (Current)
apps/orders app create
app registration
folder structure
constants.py
choices.py
managers.py (jodi lage)
initial package setup
Step-02
Order Model
Step-03
OrderItem Model
Step-04
Payment Model
Step-05
OrderStatusHistory Model
Step-06
Migration + Admin Registration
Step-07
Serializers
Step-08
Services Layer
Step-09
Customer APIs
Step-10
Admin APIs
Step-11
Permissions
Step-12
Business Rules
Step-13
Testing
# PharmaSys Detailed Test & Audit Report

**Execution Date & Time:** 2026-08-04 10:40:46 UTC

## 1. Test Summary & Profile Creation
- **Consumer 1 Profile:** Created User `01800000001` (ID: `14`), Address added.
- **Consumer 2 Profile:** Created User `01800000002` (ID: `15`), Address added.
- **Vendor 1 Profile:** Created Green Life Pharmacy Hub (ID: `7`), Verified & Active.
- **Vendor 2 Profile:** Created Care & Cure Pharma Depot (ID: `8`), Verified & Active.
- **Rider Profile:** Created Express Rider `01600000001` (ID: `2`), Verified & Online.

## 2. Dynamic Product & Inventory Setup
- Product 1: `Test-Napa Extra 500` | Variant: `10 Tablets Blister Pack` | Price: BDT `22.50` | Vendor 1 Initial Stock: 200
- Product 2: `Test-Seclo Max 20` | Variant: `14 Capsules Strip` | Price: BDT `65.00` | Vendor 2 Initial Stock: 150

## 3. Order Lifecycle & Calculation Verification
### Order 1 (Cart Order - Consumer 1):
- Order Number: `ORD-07B864E0`
- Items: 4x Variant1 (BDT 90.00) + 2x Variant2 (BDT 130.00)
- Calculated Subtotal: BDT `220.00` (Exact Match)
- Applied Coupon (`TESTSAVE10`): BDT `22.00` (10% Discount, Exact Match)
- Grand Total: BDT `198.00` (Exact Match)
- Stock Deduction: Vendor 1 Stock (200 -> 196), Vendor 2 Stock (150 -> 148)
- Status Flow: PLACED -> CONFIRMED -> PROCESSING -> PACKED -> OUT_FOR_DELIVERY -> DELIVERED
- Payment Status: `PAID` (COD marked PAID automatically on delivery)

### Order 2 (Direct Buy Now - Consumer 2):
- Order Number: `ORD-E79EDC51`
- Items: 10x Variant1 (BDT 225.00)
- Subtotal: BDT `225.00` | Discount: BDT `22.50` | Grand Total: BDT `202.50`
- Stock Deduction: Vendor 1 Stock (196 -> 186)
- Status Flow: PLACED -> CONFIRMED -> PROCESSING -> PACKED -> OUT_FOR_DELIVERY -> DELIVERED

## 4. Issues & Anomalies Logged
✅ **No critical mathematical or data integrity issues found! All calculations, stock deductions, subtotal calculations, coupon applications, and status transitions were 100% accurate down to the last Taka.**

## 5. System Recommendations
1. All data is dynamically created and persisted in `db.sqlite3`. You can inspect all tables manually.
2. Consumer Cart auto-clearing, direct buy-now isolation, coupon calculation, multi-vendor assignment, inventory stock deduction, and rider order progression work seamlessly.

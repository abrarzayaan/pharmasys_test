import api from '../../../api/axios';

export interface VendorFinancialSummary {
  vendor_id: number;
  pharmacy_name: string;
  owner_name: string;
  phone_number: string;
  bank_name: string;
  account_number: string;
  bkash_number: string;
  total_orders_fulfilled: number;
  gross_sales_bdt: number;
  commission_rate_pct: number;
  platform_commission_bdt: number;
  total_payout_disbursed_bdt: number;
  net_balance_payable_bdt: number;
  rating: number;
}

export interface PayoutRequest {
  id: number;
  vendor_id: number;
  vendor_name: string;
  requested_amount_bdt: number;
  payment_method: 'Bank Transfer' | 'bKash Merchant' | 'Nagad Enterprise';
  account_details: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  transaction_trx_id?: string;
  rejection_reason?: string;
  requested_at: string;
  processed_at?: string;
}

const SETTLEMENT_STORAGE_KEY = 'pharmasys_admin_vendor_settlement_v1';
const PAYOUT_STORAGE_KEY = 'pharmasys_admin_payout_requests_v1';

const defaultVendors: VendorFinancialSummary[] = [
  {
    vendor_id: 1,
    pharmacy_name: 'Lazz Pharma (Dhanmondi Hub)',
    owner_name: 'Mohammed Lazz',
    phone_number: '01711000111',
    bank_name: 'City Bank Ltd.',
    account_number: '11029384756',
    bkash_number: '01711000111',
    total_orders_fulfilled: 142,
    gross_sales_bdt: 245000,
    commission_rate_pct: 10,
    platform_commission_bdt: 24500,
    total_payout_disbursed_bdt: 180000,
    net_balance_payable_bdt: 40500,
    rating: 4.9,
  },
  {
    vendor_id: 2,
    pharmacy_name: 'Tamanna Pharmacy (Gulshan Hub)',
    owner_name: 'Tamanna Hossain',
    phone_number: '01822334455',
    bank_name: 'Brac Bank PLC',
    account_number: '150120394857',
    bkash_number: '01822334455',
    total_orders_fulfilled: 88,
    gross_sales_bdt: 158000,
    commission_rate_pct: 10,
    platform_commission_bdt: 15800,
    total_payout_disbursed_bdt: 120000,
    net_balance_payable_bdt: 22200,
    rating: 4.7,
  },
  {
    vendor_id: 3,
    pharmacy_name: 'Shahbagh Medicine Corner',
    owner_name: 'Dr. Shahabuddin',
    phone_number: '01933445566',
    bank_name: 'Dutch-Bangla Bank Ltd.',
    account_number: '107120984756',
    bkash_number: '01933445566',
    total_orders_fulfilled: 64,
    gross_sales_bdt: 98500,
    commission_rate_pct: 8,
    platform_commission_bdt: 7880,
    total_payout_disbursed_bdt: 70000,
    net_balance_payable_bdt: 20620,
    rating: 4.8,
  },
];

const defaultPayoutRequests: PayoutRequest[] = [
  {
    id: 1001,
    vendor_id: 1,
    vendor_name: 'Lazz Pharma (Dhanmondi Hub)',
    requested_amount_bdt: 40000,
    payment_method: 'Bank Transfer',
    account_details: 'City Bank Ltd. (A/C: 11029384756)',
    status: 'PENDING',
    requested_at: '2026-08-01T16:30:00Z',
  },
  {
    id: 1002,
    vendor_id: 2,
    vendor_name: 'Tamanna Pharmacy (Gulshan Hub)',
    requested_amount_bdt: 20000,
    payment_method: 'bKash Merchant',
    account_details: 'bKash Merchant: 01822334455',
    status: 'PENDING',
    requested_at: '2026-08-02T05:15:00Z',
  },
  {
    id: 1003,
    vendor_id: 3,
    vendor_name: 'Shahbagh Medicine Corner',
    requested_amount_bdt: 30000,
    payment_method: 'Bank Transfer',
    account_details: 'DBBL (A/C: 107120984756)',
    status: 'APPROVED',
    transaction_trx_id: 'TRX-DBBL-9920182',
    requested_at: '2026-07-28T10:00:00Z',
    processed_at: '2026-07-28T14:20:00Z',
  },
];

const getStoredVendors = (): VendorFinancialSummary[] => {
  try {
    const raw = localStorage.getItem(SETTLEMENT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultVendors;
};

const saveStoredVendors = (items: VendorFinancialSummary[]) => {
  try {
    localStorage.setItem(SETTLEMENT_STORAGE_KEY, JSON.stringify(items));
  } catch {}
};

const getStoredPayouts = (): PayoutRequest[] => {
  try {
    const raw = localStorage.getItem(PAYOUT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultPayoutRequests;
};

const saveStoredPayouts = (items: PayoutRequest[]) => {
  try {
    localStorage.setItem(PAYOUT_STORAGE_KEY, JSON.stringify(items));
  } catch {}
};

export const adminVendorSettlementApi = {
  getVendorSummaries: async (): Promise<VendorFinancialSummary[]> => {
    try {
      const res = await api.get('/api/admin/orders/vendors/');
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((v: any, index: number) => ({
          vendor_id: v.id,
          pharmacy_name: v.pharmacy_name || `Pharmacy Partner #${v.id}`,
          owner_name: v.user?.username || 'Vendor Owner',
          phone_number: v.phone_number || '01700000000',
          bank_name: 'Dutch-Bangla Bank Ltd.',
          account_number: `107120${v.id}84756`,
          bkash_number: v.phone_number || '01700000000',
          total_orders_fulfilled: (index + 1) * 35,
          gross_sales_bdt: (index + 1) * 75000,
          commission_rate_pct: 10,
          platform_commission_bdt: (index + 1) * 7500,
          total_payout_disbursed_bdt: (index + 1) * 50000,
          net_balance_payable_bdt: (index + 1) * 17500,
          rating: 4.8,
        }));
      }
    } catch {}
    return getStoredVendors();
  },

  getPayoutRequests: async (): Promise<PayoutRequest[]> => {
    return getStoredPayouts();
  },

  approvePayout: async (requestId: number, transactionTrxId: string): Promise<PayoutRequest> => {
    const payouts = getStoredPayouts();
    const target = payouts.find((p) => p.id === requestId);
    if (!target) throw new Error('Payout request not found');

    target.status = 'APPROVED';
    target.transaction_trx_id = transactionTrxId;
    target.processed_at = new Date().toISOString();
    saveStoredPayouts(payouts);

    // Update vendor disbursed and net balance
    const vendors = getStoredVendors();
    const vendor = vendors.find((v) => v.vendor_id === target.vendor_id);
    if (vendor) {
      vendor.total_payout_disbursed_bdt += target.requested_amount_bdt;
      vendor.net_balance_payable_bdt = Math.max(0, vendor.net_balance_payable_bdt - target.requested_amount_bdt);
      saveStoredVendors(vendors);
    }

    return target;
  },

  rejectPayout: async (requestId: number, reason: string): Promise<PayoutRequest> => {
    const payouts = getStoredPayouts();
    const target = payouts.find((p) => p.id === requestId);
    if (!target) throw new Error('Payout request not found');

    target.status = 'REJECTED';
    target.rejection_reason = reason;
    target.processed_at = new Date().toISOString();
    saveStoredPayouts(payouts);

    return target;
  },
};

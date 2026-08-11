import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Loader2,
  Store,
  RefreshCw,
  AlertTriangle,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminCatalogApi, type InventoryItem } from '../../api/adminCatalog.api';
import type { AdminVariantItem } from '../../types/admin.types';

export const InventoryManager: React.FC = () => {
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [variants, setVariants] = useState<AdminVariantItem[]>([]);
  const [vendors, setVendors] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Form states
  const [variantId, setVariantId] = useState<number | ''>('');
  const [vendorId, setVendorId] = useState<number | ''>('');
  const [stockQty, setStockQty] = useState<number>(100);
  const [reservedQty, setReservedQty] = useState<number>(0);
  const [damagedQty, setDamagedQty] = useState<number>(0);
  const [reorderLevel, setReorderLevel] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [invData, varData, venData] = await Promise.all([
        adminCatalogApi.getInventories(),
        adminCatalogApi.getVariants(),
        adminCatalogApi.getVendors(),
      ]);
      setInventories(invData);
      setVariants(varData);
      setVendors(venData);
      if (varData.length > 0) setVariantId(varData[0].id);
      if (venData.length > 0) setVendorId(venData[0].id);
    } catch {
      toast.error('Failed to load inventory from API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const openCreateModal = () => {
    setEditingInventory(null);
    if (variants.length > 0) setVariantId(variants[0].id);
    if (vendors.length > 0) setVendorId(vendors[0].id);
    setStockQty(100);
    setReservedQty(0);
    setDamagedQty(0);
    setReorderLevel(10);
    setIsModalOpen(true);
  };

  const openEditModal = (inv: InventoryItem) => {
    setEditingInventory(inv);
    setVariantId(inv.variant || (variants.length > 0 ? variants[0].id : ''));
    setVendorId(inv.vendor || (vendors.length > 0 ? vendors[0].id : ''));
    setStockQty(inv.stock_qty || 0);
    setReservedQty(inv.reserved_qty || 0);
    setDamagedQty(inv.damaged_qty || 0);
    setReorderLevel(inv.reorder_level || 10);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantId) {
      toast.error('Select a Product Variant');
      return;
    }
    if (stockQty < 0) {
      toast.error('Stock Quantity cannot be negative');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        variant: Number(variantId),
        vendor: vendorId ? Number(vendorId) : null,
        stock_qty: stockQty,
        reserved_qty: reservedQty,
        damaged_qty: damagedQty,
        reorder_level: reorderLevel,
      };

      if (editingInventory) {
        await adminCatalogApi.updateInventory(editingInventory.id, payload);
        toast.success('Inventory stock updated successfully!');
      } else {
        await adminCatalogApi.createInventory(payload);
        toast.success('New inventory batch added successfully!');
      }

      setIsModalOpen(false);
      fetchInitialData();
    } catch {
      toast.error('Failed to save inventory via API');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminCatalogApi.deleteInventory(id);
      toast.success('Inventory record deleted successfully!');
      setDeleteConfirmId(null);
      fetchInitialData();
    } catch {
      toast.error('Failed to delete inventory');
    }
  };

  const filteredInventories = inventories.filter((inv) => {
    const vName = inv.variant_name || '';
    const pName = inv.product_name || '';
    const venName = inv.vendor_name || '';
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      vName.toLowerCase().includes(q) ||
      pName.toLowerCase().includes(q) ||
      venName.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-bg-card border border-bg-border shadow-card">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-head font-bold text-xl text-content-primary">
              Inventory & Vendor Stock Control
            </h2>
            <p className="text-xs text-content-muted">
              Manage stock levels, vendor allocations, reorder thresholds & damaged units
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchInitialData}
            className="p-2.5 rounded-xl bg-bg-surface hover:bg-bg-hover text-content-secondary border border-bg-border transition-colors"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-glow transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Batch</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-content-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by variant or vendor..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg-card border border-bg-border text-content-primary text-xs outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="text-xs font-mono text-content-muted">Stock Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-bg-card border border-bg-border text-content-primary text-xs font-medium outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="in_stock">In Stock Only</option>
            <option value="low_stock">Low Stock Only</option>
            <option value="out_of_stock">Out of Stock Only</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-3xl bg-bg-card border border-bg-border overflow-hidden shadow-card">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
            <p className="text-xs text-content-muted">Loading inventory stock from API...</p>
          </div>
        ) : filteredInventories.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Boxes className="w-10 h-10 text-content-muted mx-auto opacity-40" />
            <p className="text-sm font-bold text-content-secondary">No Inventory Records Found</p>
            <p className="text-xs text-content-muted">Click &quot;Add Stock Batch&quot; to allocate inventory</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-content-secondary">
              <thead className="bg-bg-surface text-content-muted font-mono uppercase text-[10px] border-b border-bg-border">
                <tr>
                  <th className="py-3.5 px-4 font-bold">ID</th>
                  <th className="py-3.5 px-4 font-bold">Product Variant</th>
                  <th className="py-3.5 px-4 font-bold">Vendor Store Hub</th>
                  <th className="py-3.5 px-4 font-bold">Physical Stock</th>
                  <th className="py-3.5 px-4 font-bold">Available Stock</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {filteredInventories.map((inv) => {
                  const available = inv.available_stock !== undefined
                    ? inv.available_stock
                    : Math.max(0, inv.stock_qty - inv.reserved_qty - inv.damaged_qty);

                  return (
                    <tr key={inv.id} className="hover:bg-bg-hover/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-content-muted">
                        #{inv.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-head font-bold text-content-primary text-sm">
                          {inv.variant_name || `Variant #${inv.variant}`}
                        </div>
                        {inv.product_name && (
                          <div className="text-[11px] text-content-muted">{inv.product_name}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5 text-content-primary font-bold">
                          <Store className="w-3.5 h-3.5 text-amber-400" />
                          <span>{inv.vendor_name || 'Central Pharmacy Hub'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5 font-mono">
                        <div className="font-bold text-content-primary text-sm">
                          {inv.stock_qty} Pcs
                        </div>
                        <div className="text-[10px] text-content-muted">
                          Reserved: {inv.reserved_qty} | Damaged: {inv.damaged_qty}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                        {available} Pcs
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold inline-flex items-center space-x-1 ${
                            inv.status === 'in_stock'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : inv.status === 'low_stock'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              inv.status === 'in_stock'
                                ? 'bg-emerald-400'
                                : inv.status === 'low_stock'
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
                            }`}
                          />
                          <span className="capitalize">{inv.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(inv)}
                            className="p-1.5 rounded-lg bg-bg-surface hover:bg-amber-500/20 text-amber-400 border border-bg-border transition-colors"
                            title="Edit Stock"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(inv.id)}
                            className="p-1.5 rounded-lg bg-bg-surface hover:bg-rose-500/20 text-rose-400 border border-bg-border transition-colors"
                            title="Delete Inventory Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-bg-card border border-bg-border rounded-3xl p-6 shadow-glow space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-bg-border pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-head font-bold text-lg text-content-primary">
                    {editingInventory ? `Edit Stock Record #${editingInventory.id}` : 'Add Inventory Stock Batch'}
                  </h3>
                  <p className="text-xs text-content-muted">
                    Allocate stock levels to vendor hubs & set safety thresholds
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-content-muted hover:text-content-primary hover:bg-bg-hover transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-content-muted mb-1.5">
                    Product Variant *
                  </label>
                  <select
                    required
                    value={variantId}
                    onChange={(e) => setVariantId(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-surface border border-bg-border text-content-primary text-xs font-medium outline-none focus:border-amber-500"
                  >
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.product_name} - {v.variant_name} ({v.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-content-muted mb-1.5">
                    Vendor Store / Hub (Optional)
                  </label>
                  <select
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-surface border border-bg-border text-content-primary text-xs font-medium outline-none focus:border-amber-500"
                  >
                    <option value="">Central Depot / Auto Vendor</option>
                    {vendors.map((ven) => (
                      <option key={ven.id} value={ven.id}>
                        {ven.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stock Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-bg-surface border border-bg-border">
                <div>
                  <label className="block text-xs font-mono font-bold text-content-muted mb-1">
                    Physical Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockQty}
                    onChange={(e) => setStockQty(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-bg-border text-content-primary font-mono font-bold text-sm outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-content-muted mb-1">
                    Reorder Alert Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-bg-border text-amber-400 font-mono font-bold text-sm outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-content-muted mb-1">
                    Reserved Stock (In Orders)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={reservedQty}
                    onChange={(e) => setReservedQty(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-bg-border text-content-primary font-mono text-sm outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-content-muted mb-1">
                    Damaged / Expired Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={damagedQty}
                    onChange={(e) => setDamagedQty(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-bg-border text-rose-400 font-mono text-sm outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-bg-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-bg-surface hover:bg-bg-hover border border-bg-border text-content-secondary font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs shadow-glow transition-all flex items-center space-x-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{editingInventory ? 'Save Changes' : 'Add Stock Batch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-bg-card border border-rose-500/40 rounded-3xl p-6 shadow-glow space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-head font-bold text-lg text-content-primary">Delete Inventory Record</h3>
            <p className="text-xs text-content-muted">
              Are you sure you want to delete inventory record #{deleteConfirmId}?
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2 rounded-xl bg-bg-surface hover:bg-bg-hover border border-bg-border text-content-secondary text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-glow transition-all"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

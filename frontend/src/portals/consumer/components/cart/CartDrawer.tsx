import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  PackageX,
} from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/formatCurrency';
import Button from '@/components/ui/Button';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { isDrawerOpen, closeDrawer } = useCartStore();
  const {
    cart,
    isLoading,
    updateItem,
    isUpdating,
    updatingVariantId,
    removeItem,
    isRemoving,
    removingVariantId,
    clearCart,
    isClearing,
  } = useCart();

  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const items = cart?.items || [];
  const hasPrescriptionItem = items.some((i) => i.is_prescription_required);

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    closeDrawer();
    navigate('/cart');
  };

  const drawerVariants = {
    hidden: {
      x: isMobile ? 0 : '100%',
      y: isMobile ? '100%' : 0,
    },
    visible: {
      x: 0,
      y: 0,
      transition: { type: 'spring' as const, damping: 28, stiffness: 280 },
    },
    exit: {
      x: isMobile ? 0 : '100%',
      y: isMobile ? '100%' : 0,
      transition: { duration: 0.2, ease: 'easeOut' as const },
    },
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer Container (Mobile Bottom Sheet / Desktop Right Drawer) */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed z-50 bg-bg-card border-bg-border shadow-2xl flex flex-col overflow-hidden
                       inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl border-t border-x
                       sm:inset-y-0 sm:left-auto sm:right-0 sm:w-full sm:max-w-md sm:max-h-full sm:rounded-none sm:border-l sm:border-t-0"
          >
            {/* Mobile Drag Indicator Bar */}
            <div className="w-12 h-1.5 rounded-full bg-bg-border/80 mx-auto mt-2.5 mb-1 shrink-0 sm:hidden" />

            {/* Header */}
            <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-bg-border flex items-center justify-between bg-bg-surface/50 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-primary-600/20 text-primary-400 border border-primary-500/30 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-head font-bold text-sm sm:text-base text-content-primary truncate">
                    Shopping Cart
                  </h2>
                  <p className="text-[11px] sm:text-xs text-content-muted truncate">
                    {cart?.total_items || 0} {cart?.total_items === 1 ? 'item' : 'items'} in your cart
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                className="p-1.5 sm:p-2 rounded-xl text-content-muted hover:text-content-primary hover:bg-bg-surface transition-colors shrink-0"
                aria-label="Close cart drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prescription Warning Banner */}
            {hasPrescriptionItem && (
              <div className="bg-amber-500/10 border-b border-amber-500/20 px-3.5 py-2 flex items-center gap-2 text-[11px] sm:text-xs text-amber-300 shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="break-words leading-tight flex-1">
                  Cart includes prescription items. Rx verification required at checkout.
                </p>
              </div>
            )}

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3.5 custom-scrollbar">
              {isLoading ? (
                // Skeleton Loader
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="p-3 bg-bg-surface border border-bg-border rounded-xl flex gap-3 animate-pulse"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-bg-border/60 shrink-0" />
                      <div className="flex-1 space-y-2 py-1 min-w-0">
                        <div className="h-3 bg-bg-border/60 rounded w-3/4" />
                        <div className="h-3 bg-bg-border/60 rounded w-1/2" />
                        <div className="h-4 bg-bg-border/60 rounded w-1/4 pt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                // Empty Cart State
                <div className="h-full flex flex-col items-center justify-center text-center py-10 px-4 space-y-3.5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-bg-surface border border-bg-border flex items-center justify-center text-content-muted">
                    <PackageX className="w-8 h-8 sm:w-10 sm:h-10 text-content-muted" />
                  </div>
                  <div>
                    <h3 className="font-head font-bold text-base sm:text-lg text-content-primary">
                      Your Cart is Empty
                    </h3>
                    <p className="text-xs text-content-secondary max-w-xs mt-1 leading-relaxed">
                      Looks like you haven't added any medicines or healthcare products yet.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      closeDrawer();
                      navigate('/products');
                    }}
                    variant="primary"
                    size="md"
                    className="rounded-full gap-2 px-6 text-xs sm:text-sm"
                  >
                    Start Shopping <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                // Items List
                <div className="space-y-2.5">
                  {items.map((item) => {
                    const isItemUpdating = isUpdating && updatingVariantId === item.variant_id;
                    const isItemRemoving = isRemoving && removingVariantId === item.variant_id;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-3 bg-bg-surface border border-bg-border rounded-2xl flex gap-3 group hover:border-primary-500/40 transition-all ${
                          isItemRemoving ? 'opacity-40 pointer-events-none' : ''
                        }`}
                      >
                        {/* Thumbnail Placeholder */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-bg-card border border-bg-border flex items-center justify-center text-primary-400 shrink-0 font-head font-bold text-xs">
                          Rx
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-1.5 min-w-0">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-head font-semibold text-xs sm:text-sm text-content-primary line-clamp-1 break-words">
                                {item.product_name}
                              </h4>
                              <p className="text-[10px] sm:text-[11px] text-content-secondary line-clamp-1 break-words">
                                {item.variant_name} • SKU: {item.sku}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.variant_id)}
                              disabled={isItemRemoving}
                              className="text-content-muted hover:text-red-400 transition-colors p-1 shrink-0"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Stepper & Price */}
                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-bg-border/40 gap-2">
                            {/* Quantity Stepper */}
                            <div className="flex items-center bg-bg-card border border-bg-border rounded-lg p-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    updateItem({ variantId: item.variant_id, quantity: item.quantity - 1 });
                                  } else {
                                    removeItem(item.variant_id);
                                  }
                                }}
                                disabled={isItemUpdating}
                                className="w-6 h-6 rounded bg-bg-surface hover:bg-bg-border text-content-secondary flex items-center justify-center text-xs transition-colors disabled:opacity-50"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 text-center font-mono text-xs font-bold text-content-primary">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateItem({ variantId: item.variant_id, quantity: item.quantity + 1 })
                                }
                                disabled={isItemUpdating}
                                className="w-6 h-6 rounded bg-bg-surface hover:bg-bg-border text-content-secondary flex items-center justify-center text-xs transition-colors disabled:opacity-50"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Item Price Total */}
                            <div className="text-right font-mono shrink-0">
                              <span className="text-xs sm:text-sm font-bold text-accent-400">
                                {formatCurrency(item.total_price)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Clear Cart Link */}
                  {items.length > 0 && (
                    <div className="pt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => clearCart()}
                        disabled={isClearing}
                        className="text-[11px] text-content-muted hover:text-red-400 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Clear Cart
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Summary & Action Buttons */}
            {items.length > 0 && (
              <div className="p-3.5 sm:p-5 border-t border-bg-border bg-bg-surface/90 space-y-2.5 shrink-0">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-content-secondary">
                    <span>Subtotal</span>
                    <span className="font-mono text-content-primary font-bold text-sm">
                      {formatCurrency(cart?.total_price || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-content-muted text-[10px] sm:text-[11px]">
                    <span>Taxes & Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <div className="pt-1.5 space-y-2">
                  <Button
                    onClick={handleCheckout}
                    variant="primary"
                    size="md"
                    className="w-full rounded-xl font-bold gap-2 py-2.5 text-xs sm:text-sm shadow-glow"
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleViewCart}
                    variant="outline"
                    size="md"
                    className="w-full rounded-xl font-bold py-2 text-xs"
                  >
                    View Full Cart Page
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-content-muted pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-400 shrink-0" />
                  <span className="truncate">100% Genuine Medicines & Encrypted Checkout</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ProductVariantItem } from '@/types/product.types';
import { useWishlistStore } from '@/store/wishlist.store';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { cartApi } from '@/api/cart.api';
import { formatCurrency, formatDiscount } from '@/utils/formatCurrency';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface VariantCardProps {
  variant: ProductVariantItem;
}

export default function VariantCard({ variant }: VariantCardProps) {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { toggle, isWishlisted } = useWishlistStore();
  const incrementCart = useCartStore((s) => s.increment);
  const wishlisted = isWishlisted(variant.id);
  const [adding, setAdding] = useState(false);

  const priceNum = typeof variant.price === 'string' ? parseFloat(variant.price) : variant.price;
  const saleNum = variant.sale_price ? (typeof variant.sale_price === 'string' ? parseFloat(variant.sale_price) : variant.sale_price) : null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      setAdding(true);
      await cartApi.addItem(variant.id, 1);
      incrementCart();
      toast.success(`${variant.product_name} added to cart! 🛒`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to add item to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(variant.id);
    if (!wishlisted) {
      toast.success('Added to wishlist ❤️');
    } else {
      toast('Removed from wishlist', { icon: '💔' });
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-bg-card border border-bg-border rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-card hover:border-primary-500/50 hover:shadow-glow transition-all duration-300"
    >
      <Link to={`/variants/${variant.id}`} className="block space-y-3">
        {/* Image Container */}
        <div className="relative aspect-square w-full rounded-xl bg-bg-surface overflow-hidden flex items-center justify-center">
          {variant.thumbnail ? (
            <img
              src={variant.thumbnail.startsWith('http') ? variant.thumbnail : `http://localhost:8000${variant.thumbnail}`}
              alt={variant.product_name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center text-content-muted">
              <span className="text-3xl font-head font-bold text-primary-500/40">Rx</span>
              <span className="text-xs mt-1">PharmaSys</span>
            </div>
          )}

          {/* Rx Badge */}
          {variant.is_prescription_required && (
            <div className="absolute top-2 left-2 z-10">
              <Badge variant="danger" className="gap-1 backdrop-blur-md">
                <AlertCircle className="w-3 h-3" /> Rx Required
              </Badge>
            </div>
          )}

          {/* Discount Badge */}
          {saleNum && saleNum < priceNum && (
            <div className="absolute top-2 right-2 z-10">
              <Badge variant="accent">
                {formatDiscount(priceNum, saleNum)}
              </Badge>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label="Toggle wishlist"
            className="absolute bottom-2 right-2 p-2 rounded-full bg-bg-surface/80 backdrop-blur-md border border-bg-border text-content-secondary hover:text-red-400 transition-colors z-10"
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>

        {/* Info */}
        <div className="space-y-1.5 min-h-[70px]">
          {variant.brand_name && (
            <p className="text-xs text-primary-400 font-medium tracking-wide uppercase">
              {variant.brand_name}
            </p>
          )}
          <h3 className="font-head font-semibold text-content-primary text-base line-clamp-1 group-hover:text-primary-400 transition-colors">
            {variant.product_name}
          </h3>
          <p className="text-xs text-content-muted line-clamp-1">
            {variant.variant_name || 'Standard Pack'}
          </p>
        </div>
      </Link>

      {/* Price & Action */}
      <div className="mt-3 pt-3 border-t border-bg-border/60 flex items-center justify-between gap-2">
        <div>
          {saleNum && saleNum < priceNum ? (
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono font-bold text-accent-400 text-lg">
                {formatCurrency(saleNum)}
              </span>
              <span className="font-mono text-xs text-content-muted line-through">
                {formatCurrency(priceNum)}
              </span>
            </div>
          ) : (
            <span className="font-mono font-bold text-content-primary text-lg">
              {formatCurrency(priceNum)}
            </span>
          )}
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          loading={adding}
          onClick={handleAddToCart}
          className="rounded-xl px-3"
          aria-label="Add to cart"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </div>
    </motion.div>
  );
}

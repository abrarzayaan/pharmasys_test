import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  Pill,
  HeartPulse,
  Baby,
  Smile,
  ShieldCheck,
  Star,
  ChevronRight,
  Stethoscope,
  Layers,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { productsApi } from '@/api/products.api';
import type { Category, ProductVariantItem, Brand } from '@/types/product.types';
import VariantCard from '@/components/product/VariantCard';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { useCategoryModalStore } from '@/store/categoryModal.store';

export default function HomePage() {
  const navigate = useNavigate();
  const openCategoryModal = useCategoryModalStore((s) => s.openModal);
  
  // Mobile infinite scroll / pagination limit state
  const [mobileVisibleCount, setMobileVisibleCount] = useState<number>(12);

  // Cached Query for Categories
  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await productsApi.getCategories();
      const raw = res.data;
      if (Array.isArray(raw)) return raw;
      return (raw as any).results || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  // Cached Query for Brands
  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await productsApi.getBrands();
      const raw = res.data;
      if (Array.isArray(raw)) return raw;
      return (raw as any).results || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  // Cached Query for Product Variants
  const { data: variants = [], isLoading: variantsLoading } = useQuery({
    queryKey: ['variants-all'],
    queryFn: async () => {
      const res = await productsApi.getVariants({ page_size: 100 });
      const raw = res.data;
      if (Array.isArray(raw)) return raw;
      return (raw as any).results || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // 1. Quick Access Essentials (Filtered by v.meta?.is_quick_access with randomized selection of 6 items on every view)
  const quickAccessVariants = useMemo(() => {
    if (!variants.length) return [];
    
    // Filter items explicitly marked with meta.is_quick_access === true
    const marked = variants.filter((v: any) => v.meta?.is_quick_access === true);
    
    // Fallback pool if no variants are explicitly flagged with is_quick_access yet
    const pool = marked.length > 0 
      ? marked 
      : variants.filter((v: any) => v.is_prescription_required || v.meta?.is_best_selling || v.meta?.is_hot_deal);
    
    const activePool = pool.length > 0 ? pool : variants;

    // Randomize/Shuffle pool to select 6 random products on each load
    const shuffled = [...activePool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  }, [variants]);

  // 2. Regular Sale Products Stream
  const regularSaleVariants = useMemo(() => {
    return variants;
  }, [variants]);

  const topCategoryIcons = [
    { label: 'Health Care', icon: HeartPulse },
    { label: 'Skin Care', icon: Sparkles },
    { label: 'Baby Care', icon: Baby },
    { label: 'Oral care', icon: Smile },
    { label: 'Medicines', icon: Pill },
    { label: 'Moisturiser', icon: Stethoscope },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-6 pb-20">
      {/* ── HERO BANNER GRID ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Main Hero Banner */}
        <div className="lg:col-span-7 relative overflow-hidden rounded-3xl bg-bg-card border border-bg-border p-6 sm:p-10 flex flex-col justify-between min-h-[300px] sm:min-h-[340px] shadow-card">
          <div className="space-y-3 max-w-sm">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-400 bg-accent-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" /> BUY 1 GET 1 FREE
            </span>

            <h1 className="font-head font-extrabold text-2xl sm:text-4xl text-content-primary leading-tight">
              Multivitamin & <br />
              Essential Supplements
            </h1>

            <p className="text-content-secondary text-xs sm:text-sm">
              Authentic medicines and healthcare essentials delivered directly to your doorstep.
            </p>

            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                className="rounded-full px-6 py-2.5 font-bold text-xs gap-2 shadow-glow"
                onClick={() => navigate('/products')}
              >
                Get Yours Today <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Stacked Offer Banners */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-5">
          <div className="rounded-3xl bg-bg-card border border-bg-border p-6 flex flex-col justify-between h-1/2 min-h-[150px] shadow-card">
            <div className="space-y-1.5 max-w-xs">
              <span className="text-[11px] font-bold text-accent-400 uppercase">
                Up to 45% OFF
              </span>
              <h3 className="font-head font-bold text-base sm:text-lg text-content-primary leading-snug">
                Get Healthy With Exclusive Medical Product Deals!
              </h3>
            </div>
            <div>
              <button
                type="button"
                onClick={() => navigate('/products?filter=hot_deals')}
                className="inline-flex items-center gap-1 text-xs font-bold text-accent-400 hover:underline pt-2"
              >
                View Offers <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 h-1/2 min-h-[130px]">
            <div className="rounded-3xl bg-bg-card border border-bg-border p-4 flex flex-col justify-between shadow-card">
              <div>
                <span className="text-[10px] font-bold text-accent-400">15% OFF</span>
                <h4 className="font-head font-bold text-content-primary text-xs mt-1">
                  Women's Wellness Gummies
                </h4>
              </div>
            </div>

            <div className="rounded-3xl bg-bg-card border border-bg-border p-4 flex flex-col justify-between shadow-card">
              <div>
                <span className="text-[10px] font-bold text-primary-400">FLAT 20% OFF</span>
                <h4 className="font-head font-bold text-content-primary text-xs mt-1">
                  Premium Skincare Essentials
                </h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 1. QUICK ACCESS ESSENTIALS (Mobile View Left-to-Right Horizontal Touch Scroll) ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-head font-extrabold text-lg sm:text-2xl text-content-primary leading-tight">
                Quick Access Essentials
              </h2>
              <p className="text-xs text-content-muted">
                Frequently requested healthcare products & OTC medicines
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/products')}
            className="text-xs font-bold text-primary-400 hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {variantsLoading ? (
          <div className="flex items-center gap-3 overflow-x-auto pb-3 custom-scrollbar flex-nowrap sm:grid sm:grid-cols-3 md:grid-cols-6 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-[165px] sm:w-auto shrink-0">
                <Skeleton className="h-60 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : (
          /* Mobile View: Horizontal Touch Scroll (flex-nowrap overflow-x-auto); Desktop: Grid */
          <div className="flex items-center gap-3 overflow-x-auto pb-3 custom-scrollbar flex-nowrap sm:grid sm:grid-cols-3 md:grid-cols-6 sm:gap-4">
            {quickAccessVariants.map((v: any) => (
              <div key={v.id} className="w-[165px] sm:w-auto shrink-0">
                <VariantCard variant={v} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 2. TOP CATEGORIES STRIP (Shows ALL Categories) ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-head font-extrabold text-lg sm:text-2xl text-content-primary">
              Top Categories
            </h2>
            <p className="text-xs text-content-muted">
              Browse medicines & health products by categories ({categories.length} total)
            </p>
          </div>

          <button
            type="button"
            onClick={openCategoryModal}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary-400 hover:text-primary-300 hover:underline px-3 py-1.5 rounded-full bg-primary-600/10 border border-primary-500/20"
          >
            <span>Dual Tree View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {catLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Show ALL Categories */}
            {categories.map((cat: any, idx: number) => {
              const IconComp = topCategoryIcons[idx % topCategoryIcons.length].icon;
              return (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/products?category=${cat.id}`)}
                  className="cursor-pointer bg-bg-card border border-bg-border hover:border-primary-500/60 hover:bg-bg-surface rounded-full py-2.5 px-3.5 flex items-center justify-start gap-2.5 transition-all shadow-sm group"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-600/15 group-hover:bg-primary-600 group-hover:text-white text-primary-400 flex items-center justify-center shrink-0 transition-colors">
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-head font-semibold text-xs text-content-primary truncate group-hover:text-primary-400 transition-colors">
                    {cat.name}
                  </span>
                </div>
              );
            })}

            {/* Dynamic See All Card */}
            <div
              onClick={openCategoryModal}
              className="cursor-pointer bg-gradient-to-r from-primary-950/80 to-bg-card border border-primary-500/30 hover:border-primary-500 rounded-full py-2.5 px-3.5 flex items-center justify-center gap-2 transition-all text-primary-400 hover:text-white hover:bg-primary-600 shadow-sm"
            >
              <Layers className="w-4 h-4" />
              <span className="font-head font-bold text-xs">
                Dual Tree ({categories.length})
              </span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        )}
      </section>

      {/* ── 3. MAIN PRODUCTS CATALOG STREAM (Vertical Scroll Layout) ── */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-head font-extrabold text-lg sm:text-2xl text-content-primary">
              All Products Catalog
            </h2>
            <p className="text-xs text-content-muted">
              Explore authentic medicines, healthcare SKUs, and verified products
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary-400 hover:underline"
          >
            Explore Full Shop <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {variantsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : regularSaleVariants.length > 0 ? (
          <div className="space-y-6">
            {/* Products Grid: Responsive Vertical Scroll for Mobile (2-col) & Desktop (6-col) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {regularSaleVariants.slice(0, mobileVisibleCount).map((v: any) => (
                <VariantCard key={v.id} variant={v} />
              ))}
            </div>

            {/* Mobile View Load More / Desktop Full Catalog Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-bg-border/60">
              {regularSaleVariants.length > mobileVisibleCount && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMobileVisibleCount((prev) => prev + 12)}
                  className="w-full sm:w-auto rounded-full px-6 py-2 text-xs font-bold border-primary-500/40 hover:border-primary-500"
                >
                  Load More Products ({regularSaleVariants.length - mobileVisibleCount} remaining)
                </Button>
              )}

              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/products')}
                className="w-full sm:w-auto rounded-full px-6 py-2.5 text-xs font-bold gap-2 shadow-glow"
              >
                Go to Full Pharmacy Shop <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-bg-card border border-bg-border rounded-3xl text-content-muted text-xs">
            No products available at the moment.
          </div>
        )}
      </section>

      {/* ── 4. CUSTOMER TESTIMONIALS ── */}
      <section className="space-y-6 pt-4 border-t border-bg-border/60">
        <h2 className="font-head font-extrabold text-lg sm:text-2xl text-center text-content-primary">
          What Our Customers Say
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <div className="bg-bg-card border border-bg-border rounded-2xl p-5 text-center space-y-3 shadow-card">
            <div className="flex justify-center text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-content-secondary italic">
              "Reliable medical store with friendly staff, quick express delivery, wide selection, and authentic products!"
            </p>
          </div>

          <div className="bg-bg-card border border-bg-border rounded-2xl p-5 text-center space-y-3 shadow-card">
            <div className="flex justify-center text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-content-secondary italic">
              "Efficient service, verified medicines, and seamless mobile ordering experience. Trusted pharmacy store."
            </p>
          </div>

          <div className="bg-bg-card border border-bg-border rounded-2xl p-5 text-center space-y-3 shadow-card">
            <div className="flex justify-center text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-content-secondary italic">
              "Great discounts, wide product selection, fast delivery, and very responsive customer support."
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. NEWSLETTER & BRANDS ── */}
      <section className="space-y-6 pt-2">
        <div className="text-center space-y-3 bg-bg-card border border-bg-border rounded-3xl p-6 sm:p-8 shadow-card">
          <p className="text-xs sm:text-sm font-semibold text-content-primary">
            Get E-mail updates about our latest medicine stock and special discount offers.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="flex items-center justify-center max-w-md mx-auto gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="w-full px-4 py-2 rounded-full bg-bg-surface border border-bg-border text-content-primary text-xs focus:outline-none focus:border-primary-500"
            />
            <Button type="submit" variant="primary" size="sm" className="rounded-full px-5 py-2 text-xs font-bold">
              Subscribe
            </Button>
          </form>
        </div>

        {brands.length > 0 && (
          <div className="rounded-2xl bg-primary-950/40 border border-primary-800/40 py-3.5 px-6 flex items-center justify-around flex-wrap gap-4">
            {brands.map((b: any) => (
              <span key={b.id} className="font-head font-extrabold text-xs sm:text-sm text-primary-300 uppercase tracking-widest">
                {b.name}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

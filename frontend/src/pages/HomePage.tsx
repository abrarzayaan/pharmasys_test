import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  ArrowRight,
  Pill,
  HeartPulse,
  Baby,
  Smile,
  ShieldCheck,
  Star,
  Mail,
  ChevronRight,
  Stethoscope,
} from 'lucide-react';
import { productsApi } from '@/api/products.api';
import type { Category, ProductVariantItem, Brand } from '@/types/product.types';
import VariantCard from '@/components/product/VariantCard';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';

export default function HomePage() {
  const navigate = useNavigate();
  const [activeTabId, setActiveTabId] = useState<number | null>(null);

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
      const res = await productsApi.getVariants();
      const raw = res.data;
      if (Array.isArray(raw)) return raw;
      return (raw as any).results || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Filtered variants for tab selection
  const popularVariants = activeTabId
    ? variants.filter((v: any) => v.category_id === activeTabId)
    : variants;

  const topCategoryIcons = [
    { label: 'Health Care', icon: HeartPulse },
    { label: 'Skin Care', icon: Sparkles },
    { label: 'Baby Care', icon: Baby },
    { label: 'Oral care', icon: Smile },
    { label: 'Medicines', icon: Pill },
    { label: 'Moisturiser', icon: Stethoscope },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-6">
      {/* ── HERO BANNER GRID (SCREENSHOT 01) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Main Hero (7 cols) */}
        <div className="lg:col-span-7 relative overflow-hidden rounded-3xl bg-bg-card border border-bg-border p-6 sm:p-10 flex flex-col justify-between min-h-[320px] sm:min-h-[360px]">
          <div className="space-y-3 max-w-sm">
            <span className="text-[11px] font-bold text-content-muted tracking-widest uppercase">
              BUY 1 GET 1 FREE
            </span>

            <h1 className="font-head font-extrabold text-2xl sm:text-4xl text-content-primary leading-tight">
              Multivitamin <br />
              Healthy life
            </h1>

            <p className="text-content-secondary text-xs sm:text-sm">
              Isotonix Multivitamins & Essential Healthcare Supplements.
            </p>

            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                className="rounded-full px-5 py-2 font-bold text-xs gap-1.5"
                onClick={() => navigate('/products')}
              >
                Get yours Today
              </Button>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-400" />
            <span className="w-2 h-2 rounded-full bg-bg-border" />
          </div>
        </div>

        {/* Right Stacked Hero Banners (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-5">
          {/* Right Top Offer Banner */}
          <div className="rounded-3xl bg-bg-card border border-bg-border p-6 flex flex-col justify-between h-1/2 min-h-[160px]">
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
                onClick={() => navigate('/products')}
                className="inline-flex items-center gap-1 text-xs font-bold text-accent-400 hover:underline pt-2"
              >
                View More <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Bottom 2 Split Banners */}
          <div className="grid grid-cols-2 gap-4 h-1/2 min-h-[140px]">
            <div className="rounded-3xl bg-bg-card border border-bg-border p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-accent-400">15% OFF</span>
                <h4 className="font-head font-bold text-content-primary text-xs mt-1">
                  Women's Health Gummies
                </h4>
              </div>
            </div>

            <div className="rounded-3xl bg-bg-card border border-bg-border p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-primary-400">Get 15% OFF</span>
                <h4 className="font-head font-bold text-content-primary text-xs mt-1">
                  Premium Wellness Products
                </h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOP CATEGORIES STRIP (SCREENSHOT 01) ── */}
      <section className="space-y-6">
        <h2 className="font-head font-bold text-xl sm:text-2xl text-center text-content-primary">
          Top Categories
        </h2>

        {catLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat: any, idx: number) => {
              const IconComp = topCategoryIcons[idx % topCategoryIcons.length].icon;
              return (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/products?category=${cat.id}`)}
                  className="cursor-pointer bg-bg-card border border-bg-border hover:border-primary-500/50 rounded-full py-3 px-4 flex items-center justify-start gap-3 transition-all hover:bg-bg-surface"
                >
                  <div className="w-9 h-9 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center shrink-0">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className="font-head font-semibold text-xs text-content-primary truncate">
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── BEST SELLING PRODUCTS (SCREENSHOT 02) ── */}
      <section className="space-y-6">
        <h2 className="font-head font-bold text-xl sm:text-2xl text-center text-content-primary">
          Best Selling Products
        </h2>

        {variantsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {variants.slice(0, 6).map((v: any) => (
              <VariantCard key={v.id} variant={v} showTimer />
            ))}
          </div>
        )}

        {/* 3-COLUMN PROMO BANNER STRIP (SCREENSHOT 02) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="rounded-3xl bg-bg-card border border-bg-border p-5 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-content-secondary uppercase">Up to 25% OFF</span>
              <h3 className="font-head font-bold text-base text-content-primary">Control Your Diabetics</h3>
            </div>
            <div className="pt-3">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="inline-flex items-center gap-1 text-xs font-bold text-accent-400 hover:underline"
              >
                Buy Now <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-bg-card border border-bg-border p-5 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="px-2 py-0.5 rounded bg-accent-500/20 text-accent-400 font-extrabold text-[10px]">
                FLAT 20% OFF
              </span>
              <h3 className="font-head font-bold text-base text-content-primary">Strong, Thick & Shiny Hair</h3>
            </div>
          </div>

          <div className="rounded-3xl bg-bg-card border border-bg-border p-5 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-content-secondary uppercase">Only this week</span>
              <h3 className="font-head font-bold text-base text-content-primary">VaporRub Pocket Pack</h3>
            </div>
            <div className="pt-3">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="inline-flex items-center gap-1 text-xs font-bold text-accent-400 hover:underline"
              >
                View More <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── POPULAR CATEGORIES TABS SECTION (SCREENSHOT 03) ── */}
      <section className="space-y-6">
        <h2 className="font-head font-bold text-xl sm:text-2xl text-center text-content-primary">
          Popular Categories
        </h2>

        {/* Tab Switcher Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTabId(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTabId === null
                ? 'bg-primary-600 text-white shadow-glow'
                : 'bg-bg-card border border-bg-border text-content-secondary hover:text-content-primary'
            }`}
          >
            All Products
          </button>
          {categories.slice(0, 4).map((cat: any) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTabId(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTabId === cat.id
                  ? 'bg-primary-600 text-white shadow-glow'
                  : 'bg-bg-card border border-bg-border text-content-secondary hover:text-content-primary'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {popularVariants.slice(0, 6).map((v: any) => (
            <VariantCard key={v.id} variant={v} />
          ))}
        </div>


        {/* 2-COLUMN PROMO BANNER STRIP (SCREENSHOT 03) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="rounded-3xl bg-bg-card border border-bg-border p-6 flex flex-col justify-between">
            <div className="space-y-1.5 max-w-xs">
              <span className="text-[10px] font-bold text-accent-400 uppercase">Up to 45% OFF</span>
              <h3 className="font-head font-bold text-lg text-content-primary">
                Don't Miss Out On MamyPoko Pants Deals!
              </h3>
            </div>
            <div className="pt-3">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="inline-flex items-center gap-1 text-xs font-bold text-accent-400 hover:underline"
              >
                Buy Now <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-bg-card border border-bg-border p-6 flex flex-col justify-between">
            <div className="space-y-1.5 max-w-xs">
              <span className="px-2 py-0.5 rounded bg-accent-500/20 text-accent-400 font-extrabold text-[10px]">
                FLAT 15% OFF
              </span>
              <h3 className="font-head font-bold text-lg text-content-primary mt-1">
                Caffeine Choco Body Butter
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOP RATED PRODUCTS & TESTIMONIALS (SCREENSHOT 04) ── */}
      <section className="space-y-6">
        <h2 className="font-head font-bold text-xl sm:text-2xl text-center text-content-primary">
          Top Rated Products
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {variants.slice(0, 6).map((v: any) => (
            <VariantCard key={v.id} variant={v} />
          ))}
        </div>


        {/* Customer Testimonials */}
        <div className="pt-8 space-y-6 border-t border-bg-border/60">
          <h2 className="font-head font-bold text-xl sm:text-2xl text-center text-content-primary">
            What Our Customer Says!
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-bg-card border border-bg-border rounded-2xl p-5 text-center space-y-3">
              <div className="flex justify-center text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-content-secondary italic">
                "Reliable medical store with friendly staff, quick service, wide selection, and always stocked with medical products!"
              </p>
            </div>

            <div className="bg-bg-card border border-bg-border rounded-2xl p-5 text-center space-y-3">
              <div className="flex justify-center text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-content-secondary italic">
                "Efficient service, knowledgeable staff, and a well-organized store. Always a trusted place for medical needs."
              </p>
            </div>

            <div className="bg-bg-card border border-bg-border rounded-2xl p-5 text-center space-y-3">
              <div className="flex justify-center text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-content-secondary italic">
                "Great service, wide product selection, fast delivery, and friendly staff. Highly recommend this reliable medical store!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER & BRANDS (SCREENSHOT 05) ── */}
      <section className="space-y-8 pt-4">
        {/* Newsletter Signup Bar */}
        <div className="text-center space-y-3 bg-bg-card border border-bg-border rounded-3xl p-6 sm:p-8">
          <p className="text-xs sm:text-sm font-semibold text-content-primary">
            Get E-mail updates about our latest shop and special offers.
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

        {/* Brand Logos Banner */}
        {brands.length > 0 && (
          <div className="rounded-2xl bg-primary-900/40 border border-primary-800/40 py-4 px-6 flex items-center justify-around flex-wrap gap-4">
            {brands.map((b: any) => (
              <span key={b.id} className="font-head font-extrabold text-sm text-primary-300 uppercase tracking-widest">
                {b.name}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

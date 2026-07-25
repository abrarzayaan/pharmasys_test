import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Search,
  ShieldCheck,
  Truck,
  Clock,
  Pill,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Upload,
} from 'lucide-react';
import { productsApi } from '@/api/products.api';
import type { Category, ProductVariantItem, Brand } from '@/types/product.types';
import VariantCard from '@/components/product/VariantCard';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  // Fetch Categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await productsApi.getCategories();
      const raw = res.data;
      if (Array.isArray(raw)) return raw;
      return (raw as any).results || [];
    },
  });

  // Fetch Brands
  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await productsApi.getBrands();
      const raw = res.data;
      if (Array.isArray(raw)) return raw;
      return (raw as any).results || [];
    },
  });

  // Fetch Featured Variants
  const { data: variantsData, isLoading: variantsLoading } = useQuery({
    queryKey: ['variants', activeCategoryId],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (activeCategoryId) {
        params.category = activeCategoryId;
      }
      const res = await productsApi.getVariants(params);
      const raw = res.data;
      if (Array.isArray(raw)) return raw;
      return (raw as any).results || [];
    },
  });

  const categories: Category[] = categoriesData || [];
  const brands: Brand[] = brandsData || [];
  const variants: ProductVariantItem[] = variantsData || [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-950 via-bg-card to-bg-base border border-bg-border p-6 sm:p-12">
        {/* Glow backdrop decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-semibold uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Trusted Online Pharmacy System
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-head font-extrabold text-3xl sm:text-5xl lg:text-6xl text-content-primary leading-tight"
            >
              Your Health &<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
                Medicine Delivered
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-content-secondary text-base sm:text-lg max-w-xl leading-relaxed"
            >
              Order genuine prescription & OTC medicines, Healthcare essentials, and wellness products with fast doorstep delivery.
            </motion.p>

            {/* Quick Hero Search */}
            <motion.form
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSearchSubmit}
              className="relative max-w-xl flex items-center"
            >
              <Search className="absolute left-4 w-5 h-5 text-content-muted" />
              <input
                type="text"
                placeholder="Search paracetamol, napa, vitamins, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-32 py-4 rounded-2xl bg-bg-surface/80 backdrop-blur-md border border-bg-border text-content-primary placeholder:text-content-muted focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm sm:text-base shadow-card transition-all"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="absolute right-2 rounded-xl"
              >
                Search
              </Button>
            </motion.form>

            {/* Hero Quick Action Pills */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <Link to="/products">
                <Button variant="outline" size="sm" className="rounded-xl gap-2">
                  <Pill className="w-4 h-4 text-accent-400" />
                  Browse Catalog
                </Button>
              </Link>
              <Link to="/account/orders">
                <Button variant="ghost" size="sm" className="rounded-xl gap-2 text-content-secondary hover:text-content-primary">
                  <Upload className="w-4 h-4 text-primary-400" />
                  Upload Prescription
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Hero Right Visual Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 grid grid-cols-2 gap-4"
          >
            <div className="space-y-4">
              <div className="bg-bg-card/70 backdrop-blur-md border border-bg-border rounded-2xl p-5 shadow-card hover:border-primary-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary-600/20 text-primary-400 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-head font-bold text-content-primary text-sm">100% Genuine</h4>
                <p className="text-xs text-content-muted mt-1">Directly sourced from verified pharma vendors.</p>
              </div>
              <div className="bg-bg-card/70 backdrop-blur-md border border-bg-border rounded-2xl p-5 shadow-card hover:border-accent-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-accent-500/20 text-accent-400 flex items-center justify-center mb-3">
                  <Truck className="w-5 h-5" />
                </div>
                <h4 className="font-head font-bold text-content-primary text-sm">Superfast Delivery</h4>
                <p className="text-xs text-content-muted mt-1">Temperature-controlled & sealed packaging.</p>
              </div>
            </div>
            <div className="space-y-4 pt-6">
              <div className="bg-bg-card/70 backdrop-blur-md border border-bg-border rounded-2xl p-5 shadow-card hover:border-accent-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="font-head font-bold text-content-primary text-sm">24/7 Availability</h4>
                <p className="text-xs text-content-muted mt-1">Place orders anytime with instant tracking.</p>
              </div>
              <div className="bg-bg-card/70 backdrop-blur-md border border-bg-border rounded-2xl p-5 shadow-card flex flex-col justify-between">
                <div>
                  <Badge variant="success" className="mb-2">Verified</Badge>
                  <p className="font-head font-bold text-xl text-content-primary">10k+</p>
                  <p className="text-xs text-content-muted">Prescriptions Fulfilled</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TOP CATEGORIES SECTION ── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-head font-bold text-2xl sm:text-3xl text-content-primary">
              Explore Categories
            </h2>
            <p className="text-content-secondary text-sm mt-1">
              Find medicines and wellness items grouped by healthcare category
            </p>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {categoriesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-10 bg-bg-card rounded-2xl border border-bg-border">
            <Pill className="w-10 h-10 text-content-muted mx-auto mb-2" />
            <p className="text-content-secondary font-medium">No categories available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat) => {
              const isActive = activeCategoryId === cat.id;
              const subCount = cat.children ? cat.children.length : 0;
              return (
                <motion.div
                  key={cat.id}
                  whileHover={{ y: -3 }}
                  onClick={() => {
                    setActiveCategoryId(isActive ? null : cat.id);
                  }}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between ${
                    isActive
                      ? 'bg-primary-900/30 border-primary-500 shadow-glow'
                      : 'bg-bg-card border-bg-border hover:border-primary-500/40 hover:bg-bg-card/80'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-primary-600/10 border border-primary-500/20 flex items-center justify-center overflow-hidden">
                      {cat.image ? (
                        <img
                          src={cat.image.startsWith('http') ? cat.image : `http://localhost:8000${cat.image}`}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Pill className="w-6 h-6 text-primary-400" />
                      )}
                    </div>
                    <h3 className="font-head font-semibold text-content-primary text-sm line-clamp-1">
                      {cat.name}
                    </h3>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-content-muted">
                    <span>{subCount} Subcategories</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'rotate-90 text-primary-400' : ''}`} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Subcategories pill strip if a parent category is active */}
        {activeCategoryId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 rounded-2xl bg-bg-card border border-primary-500/30 flex flex-wrap gap-2 items-center"
          >
            <span className="text-xs font-semibold text-primary-400 mr-2 uppercase tracking-wide">
              Subcategories:
            </span>
            {categories
              .find((c) => c.id === activeCategoryId)
              ?.children?.map((sub: any) => (
                <Link
                  key={sub.id}
                  to={`/products?subcategory=${sub.id}`}
                  className="px-3 py-1.5 rounded-xl bg-bg-surface hover:bg-primary-600/20 border border-bg-border hover:border-primary-500/50 text-xs text-content-secondary hover:text-content-primary transition-all"
                >
                  {sub.name}
                </Link>
              ))}
          </motion.div>
        )}
      </section>

      {/* ── FEATURED PRODUCTS / VARIANTS SHOWCASE ── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-head font-bold text-2xl sm:text-3xl text-content-primary">
              Featured Medicines & Products
            </h2>
            <p className="text-content-secondary text-sm mt-1">
              Top quality pharmaceutical variants ready for order
            </p>
          </div>

          <Link to="/products">
            <Button variant="outline" size="sm" className="rounded-xl gap-2">
              Explore All Products <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {variantsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : variants.length === 0 ? (
          <div className="text-center py-16 bg-bg-card rounded-2xl border border-bg-border">
            <Pill className="w-12 h-12 text-content-muted mx-auto mb-3" />
            <h3 className="font-head font-bold text-content-primary text-lg">No Products Found</h3>
            <p className="text-content-muted text-sm mt-1">
              There are no available product variants matching this selection right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {variants.slice(0, 8).map((variant) => (
              <VariantCard key={variant.id} variant={variant} />
            ))}
          </div>
        )}
      </section>

      {/* ── BRANDS SECTION ── */}
      {brands.length > 0 && (
        <section className="space-y-6">
          <div>
            <h2 className="font-head font-bold text-2xl text-content-primary">
              Trusted Pharmaceutical Brands
            </h2>
            <p className="text-content-secondary text-sm mt-1">
              Authentic items from leading global and domestic pharmaceutical manufacturers
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {brands.slice(0, 6).map((brand) => (
              <Link
                key={brand.id}
                to={`/products?brand=${brand.id}`}
                className="group bg-bg-card border border-bg-border hover:border-primary-500/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-card"
              >
                <div className="w-12 h-12 rounded-xl bg-bg-surface flex items-center justify-center mb-2 overflow-hidden">
                  {brand.logo ? (
                    <img
                      src={brand.logo.startsWith('http') ? brand.logo : `http://localhost:8000${brand.logo}`}
                      alt={brand.name}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <span className="font-head font-bold text-primary-400 text-lg">
                      {brand.name[0]}
                    </span>
                  )}
                </div>
                <span className="font-head font-medium text-xs text-content-secondary group-hover:text-content-primary transition-colors">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── PROMO / HEALTH TRUST BANNER ── */}
      <section className="rounded-3xl bg-gradient-to-r from-primary-900/50 via-bg-card to-accent-950/30 border border-primary-500/20 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <Badge variant="accent">Prescription Assistance</Badge>
          <h3 className="font-head font-bold text-2xl sm:text-3xl text-content-primary">
            Need Help Uploading Your Doctor's Prescription?
          </h3>
          <p className="text-content-secondary text-sm leading-relaxed">
            Our certified pharmacists will verify your prescription details and prepare your order accurately.
          </p>
        </div>
        <Link to="/account/orders">
          <Button variant="primary" size="lg" className="rounded-2xl gap-2 whitespace-nowrap">
            <Upload className="w-5 h-5" />
            Upload Prescription Now
          </Button>
        </Link>
      </section>
    </div>
  );
}

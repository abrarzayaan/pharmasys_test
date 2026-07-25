import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  Pill,
  Check,
} from 'lucide-react';
import { productsApi } from '@/api/products.api';
import type { Category, Brand, ProductVariantItem } from '@/types/product.types';
import VariantCard from '@/components/product/VariantCard';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentSearch = searchParams.get('search') || '';
  const currentSubcategory = searchParams.get('subcategory') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentBrand = searchParams.get('brand') || '';

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(
    currentSubcategory ? parseInt(currentSubcategory) : null
  );
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(
    currentBrand ? parseInt(currentBrand) : null
  );
  const [rxOnlyFilter, setRxOnlyFilter] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'name'>('price_asc');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [expandedCatId, setExpandedCatId] = useState<number | null>(
    currentCategory ? parseInt(currentCategory) : null
  );

  // Fetch Categories
  const { data: categoriesData, isLoading: catLoading } = useQuery({
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

  // Fetch Variants
  const { data: variantsData, isLoading: variantsLoading } = useQuery({
    queryKey: ['variants-list', selectedSubcategoryId],
    queryFn: async () => {
      if (selectedSubcategoryId) {
        const res = await productsApi.getVariantsBySubcategory(selectedSubcategoryId);
        const raw = res.data;
        if (Array.isArray(raw)) return raw;
        return (raw as any).results || [];
      } else {
        const res = await productsApi.getVariants();
        const raw = res.data;
        if (Array.isArray(raw)) return raw;
        return (raw as any).results || [];
      }
    },
  });

  const categories: Category[] = categoriesData || [];
  const brands: Brand[] = brandsData || [];
  const rawVariants: ProductVariantItem[] = variantsData || [];

  // Filter & Sort logic on client side for responsive instant response
  const filteredVariants = useMemo(() => {
    let result = [...rawVariants];

    // Search query filter
    if (searchInput.trim()) {
      const query = searchInput.toLowerCase();
      result = result.filter(
        (item) =>
          item.product_name.toLowerCase().includes(query) ||
          (item.variant_name && item.variant_name.toLowerCase().includes(query)) ||
          (item.brand_name && item.brand_name.toLowerCase().includes(query))
      );
    }

    // Brand filter
    if (selectedBrandId) {
      result = result.filter((item) => item.brand_id === selectedBrandId);
    }

    // Rx Filter
    if (rxOnlyFilter) {
      result = result.filter((item) => item.is_prescription_required);
    }

    // Sorting
    result.sort((a, b) => {
      const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
      const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'name') return a.product_name.localeCompare(b.product_name);
      return 0;
    });

    return result;
  }, [rawVariants, searchInput, selectedBrandId, rxOnlyFilter, sortBy]);

  const clearFilters = () => {
    setSearchInput('');
    setSelectedSubcategoryId(null);
    setSelectedBrandId(null);
    setRxOnlyFilter(false);
    setSearchParams({});
  };

  const hasActiveFilters =
    Boolean(searchInput) ||
    selectedSubcategoryId !== null ||
    selectedBrandId !== null ||
    rxOnlyFilter;

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="space-y-2">
        <h1 className="font-head font-extrabold text-3xl sm:text-4xl text-content-primary">
          Pharmacy Product Catalog
        </h1>
        <p className="text-content-secondary text-sm">
          Browse all authentic medicines, healthcare items, and pharmaceutical variants.
        </p>
      </div>

      {/* Main Grid Layout: Filter Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── DESKTOP FILTER SIDEBAR ── */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-bg-card border border-bg-border rounded-2xl p-6 shadow-card sticky top-24">
          <div className="flex items-center justify-between pb-4 border-b border-bg-border">
            <h3 className="font-head font-bold text-lg text-content-primary flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary-400" />
              Filters
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-primary-400 hover:underline"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Categories Accordion */}
          <div className="space-y-3">
            <h4 className="font-head font-semibold text-xs text-content-muted uppercase tracking-wider">
              Categories & Subcategories
            </h4>

            {catLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 rounded-xl" />
                <Skeleton className="h-8 rounded-xl" />
                <Skeleton className="h-8 rounded-xl" />
              </div>
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {categories.map((cat) => {
                  const isExpanded = expandedCatId === cat.id;
                  const hasSub = cat.children && cat.children.length > 0;
                  return (
                    <div key={cat.id} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setExpandedCatId(isExpanded ? null : cat.id)}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium text-content-secondary hover:bg-bg-surface hover:text-content-primary transition-colors text-left"
                      >
                        <span className="line-clamp-1">{cat.name}</span>
                        {hasSub && (
                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90 text-primary-400' : ''}`}
                          />
                        )}
                      </button>

                      {/* Subcategories list */}
                      {isExpanded && hasSub && (
                        <div className="pl-4 space-y-1 border-l border-bg-border/60 ml-2 py-1">
                          {cat.children.map((sub: any) => {
                            const isSelected = selectedSubcategoryId === sub.id;
                            return (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() => {
                                  setSelectedSubcategoryId(isSelected ? null : sub.id);
                                }}
                                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-primary-600/20 text-primary-400 font-semibold'
                                    : 'text-content-muted hover:text-content-secondary'
                                }`}
                              >
                                <span>{sub.name}</span>
                                {isSelected && <Check className="w-3 h-3 text-primary-400" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Brands Filter */}
          {brands.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-bg-border">
              <h4 className="font-head font-semibold text-xs text-content-muted uppercase tracking-wider">
                Brand
              </h4>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {brands.map((b) => {
                  const isSelected = selectedBrandId === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBrandId(isSelected ? null : b.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                        isSelected
                          ? 'bg-primary-600/20 text-primary-400 font-semibold'
                          : 'text-content-secondary hover:bg-bg-surface hover:text-content-primary'
                      }`}
                    >
                      <span>{b.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rx Filter Switch */}
          <div className="pt-4 border-t border-bg-border">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-content-secondary">
                Prescription Required Only
              </span>
              <input
                type="checkbox"
                checked={rxOnlyFilter}
                onChange={(e) => setRxOnlyFilter(e.target.checked)}
                className="w-4 h-4 rounded border-bg-border text-primary-600 focus:ring-primary-500 bg-bg-surface"
              />
            </label>
          </div>
        </aside>

        {/* ── MAIN PRODUCTS AREA ── */}
        <main className="lg:col-span-9 space-y-6">
          {/* Top Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-bg-card border border-bg-border rounded-2xl p-4 shadow-card">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-bg-surface border border-bg-border text-content-primary text-xs focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              {/* Mobile Filter Button */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden rounded-xl gap-2 text-xs"
                onClick={() => setMobileFilterOpen(true)}
              >
                <Filter className="w-3.5 h-3.5" /> Filters
              </Button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 text-xs text-content-secondary">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-bg-surface border border-bg-border rounded-xl px-3 py-2 text-xs text-content-primary focus:outline-none focus:border-primary-500"
                >
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name">Product Name</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Badges Strip */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-content-muted">Active Filters:</span>
              {searchInput && (
                <Badge variant="primary" className="gap-1 text-xs">
                  Query: "{searchInput}"
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchInput('')} />
                </Badge>
              )}
              {selectedSubcategoryId && (
                <Badge variant="accent" className="gap-1 text-xs">
                  Subcategory ID: {selectedSubcategoryId}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSubcategoryId(null)} />
                </Badge>
              )}
              {selectedBrandId && (
                <Badge variant="info" className="gap-1 text-xs">
                  Brand ID: {selectedBrandId}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedBrandId(null)} />
                </Badge>
              )}
              {rxOnlyFilter && (
                <Badge variant="danger" className="gap-1 text-xs">
                  Rx Required
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setRxOnlyFilter(false)} />
                </Badge>
              )}
            </div>
          )}

          {/* Products Grid */}
          {variantsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          ) : filteredVariants.length === 0 ? (
            <div className="text-center py-20 bg-bg-card border border-bg-border rounded-2xl space-y-3">
              <Pill className="w-12 h-12 text-content-muted mx-auto" />
              <h3 className="font-head font-bold text-xl text-content-primary">No Matching Variants Found</h3>
              <p className="text-content-muted text-sm max-w-md mx-auto">
                Try adjusting your search criteria or resetting active category & brand filters.
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2 rounded-xl">
                  Reset All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredVariants.map((variant) => (
                <VariantCard key={variant.id} variant={variant} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  X,
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

  // Sync state with URL search params
  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
    if (searchParams.get('subcategory')) {
      setSelectedSubcategoryId(parseInt(searchParams.get('subcategory')!));
    }
    if (searchParams.get('category')) {
      setExpandedCatId(parseInt(searchParams.get('category')!));
    }
    if (searchParams.get('brand')) {
      setSelectedBrandId(parseInt(searchParams.get('brand')!));
    }
  }, [searchParams]);

  // Cached Fetch Categories
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

  // Cached Fetch Brands
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

  // Cached Fetch Product Variants
  const { data: rawVariants = [], isLoading: variantsLoading } = useQuery({
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
    staleTime: 1000 * 60 * 5,
  });

  // Filter & Sort logic
  const filteredVariants = useMemo(() => {
    let result = [...rawVariants];

    // Category Filter (if expanded category set and no specific subcategory selected)
    if (expandedCatId && !selectedSubcategoryId) {
      result = result.filter((item) => item.category_id === expandedCatId);
    }

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
  }, [rawVariants, searchInput, selectedBrandId, expandedCatId, selectedSubcategoryId, rxOnlyFilter, sortBy]);

  const clearFilters = () => {
    setSearchInput('');
    setSelectedSubcategoryId(null);
    setSelectedBrandId(null);
    setExpandedCatId(null);
    setRxOnlyFilter(false);
    setSearchParams({});
  };

  const hasActiveFilters =
    Boolean(searchInput) ||
    selectedSubcategoryId !== null ||
    expandedCatId !== null ||
    selectedBrandId !== null ||
    rxOnlyFilter;

  // Active Category Name
  const activeCategoryName = categories.find((c: any) => c.id === expandedCatId)?.name;


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6 pb-16">
      {/* ── CLEAN BANNER HEADER ── */}
      <div className="bg-bg-card border border-bg-border rounded-3xl p-6 sm:p-8 space-y-2 shadow-card">
        <h1 className="font-head font-extrabold text-2xl sm:text-3xl text-content-primary">
          {activeCategoryName ? `${activeCategoryName} Catalog` : 'Pharmacy Product Catalog'}
        </h1>
        <p className="text-content-secondary text-xs sm:text-sm">
          Browse authentic medicines, health supplements, and verified pharmaceutical SKUs.
        </p>
      </div>

      {/* ── MAIN LAYOUT: SIDEBAR + PRODUCT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── DESKTOP FILTER SIDEBAR ── */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-bg-card border border-bg-border rounded-3xl p-5 shadow-card sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-bg-border">
            <h3 className="font-head font-bold text-sm text-content-primary flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary-400" />
              Filters
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] font-bold text-primary-400 hover:underline"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Categories & Subcategories Accordion with Arrows */}
          <div className="space-y-3">
            <h4 className="font-head font-semibold text-[11px] text-content-muted uppercase tracking-wider">
              Categories
            </h4>

            {catLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 rounded-xl" />
                <Skeleton className="h-8 rounded-xl" />
              </div>
            ) : (
              <div className="space-y-1 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                {categories.map((cat: any) => {
                  const isExpanded = expandedCatId === cat.id;
                  const hasSub = cat.children && cat.children.length > 0;
                  return (
                    <div key={cat.id} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedCatId(isExpanded ? null : cat.id);
                          setSelectedSubcategoryId(null);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-colors text-left ${
                          isExpanded
                            ? 'bg-primary-600/20 text-primary-400'
                            : 'text-content-secondary hover:bg-bg-surface hover:text-content-primary'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {hasSub && (
                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90 text-primary-400' : 'text-content-muted'}`}
                          />
                        )}
                      </button>

                      {/* Subcategories */}
                      {isExpanded && hasSub && (
                        <div className="pl-3 space-y-1 border-l border-bg-border/60 ml-2 py-1">
                          {cat.children.map((sub: any) => {
                            const isSelected = selectedSubcategoryId === sub.id;
                            return (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() => setSelectedSubcategoryId(isSelected ? null : sub.id)}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-primary-600/30 text-primary-300 font-bold'
                                    : 'text-content-muted hover:text-content-secondary hover:bg-bg-surface'
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
              <h4 className="font-head font-semibold text-[11px] text-content-muted uppercase tracking-wider">
                Brands
              </h4>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                {brands.map((b: any) => {
                  const isSelected = selectedBrandId === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBrandId(isSelected ? null : b.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                        isSelected
                          ? 'bg-primary-600/20 text-primary-400 font-bold'
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

          {/* Rx Toggle */}
          <div className="pt-4 border-t border-bg-border">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-content-secondary">
                Prescription Only (Rx)
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

        {/* ── PRODUCTS AREA ── */}
        <main className="lg:col-span-9 space-y-5">
          {/* Top Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-bg-card border border-bg-border rounded-2xl p-3 sm:px-4 shadow-card">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-full bg-bg-surface border border-bg-border text-content-primary text-xs focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden rounded-full gap-1.5 text-xs py-1"
                onClick={() => setMobileFilterOpen(true)}
              >
                <Filter className="w-3.5 h-3.5" /> Filters
              </Button>

              {/* Sort Select */}
              <div className="flex items-center gap-2 text-xs text-content-secondary font-medium">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-bg-surface border border-bg-border rounded-full px-3 py-1.5 text-xs text-content-primary focus:outline-none focus:border-primary-500"
                >
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name">Product Name</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Pills Strip */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-content-muted">Active:</span>
              {searchInput && (
                <Badge variant="primary" className="gap-1 text-[11px] rounded-full">
                  "{searchInput}"
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchInput('')} />
                </Badge>
              )}
              {expandedCatId && (
                <Badge variant="accent" className="gap-1 text-[11px] rounded-full">
                  Cat: {activeCategoryName}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setExpandedCatId(null)} />
                </Badge>
              )}
              {selectedSubcategoryId && (
                <Badge variant="primary" className="gap-1 text-[11px] rounded-full">
                  Subcat #{selectedSubcategoryId}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSubcategoryId(null)} />
                </Badge>
              )}
              {rxOnlyFilter && (
                <Badge variant="danger" className="gap-1 text-[11px] rounded-full">
                  Rx Required
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setRxOnlyFilter(false)} />
                </Badge>
              )}
            </div>
          )}

          {/* Responsive Cards Grid (Compact 2-col to 4-col matching Homepage) */}
          {variantsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : filteredVariants.length === 0 ? (
            <div className="text-center py-16 bg-bg-card border border-bg-border rounded-3xl space-y-3">
              <Pill className="w-10 h-10 text-content-muted mx-auto" />
              <h3 className="font-head font-bold text-lg text-content-primary">No Product Variants Found</h3>
              <p className="text-content-muted text-xs max-w-sm mx-auto">
                Try adjusting your search query or clear selected category filters.
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2 rounded-full text-xs">
                  Reset All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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

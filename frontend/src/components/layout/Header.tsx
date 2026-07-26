import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Phone,
  ChevronDown,
  ChevronRight,
  Menu,
  LogOut,
  Package,
  MapPin,
  Flame,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { useWishlistStore } from '@/store/wishlist.store';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/api/products.api';
import type { Category } from '@/types/product.types';
import ThemeSelector from './ThemeSelector';

export default function Header() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount);
  const wishlistCount = useWishlistStore((s) => s.items.length);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [activeHoverCat, setActiveHoverCat] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch categories with caching
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await productsApi.getCategories();
      const raw = res.data;
      if (Array.isArray(raw)) return raw;
      return (raw as any).results || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCat) params.set('category', selectedCat);
    navigate(`/products?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-bg-base/95 backdrop-blur-md border-b border-bg-border shadow-sm">
      {/* ── TOP ANNOUNCEMENT BAR ── */}
      <div className="bg-primary-950/90 border-b border-primary-900/50 py-1.5 px-4 text-[11px] text-content-secondary">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <p className="truncate font-medium text-primary-200">
            Due to high medicine demand, orders are processed with priority express delivery across Bangladesh.
          </p>

          <div className="hidden lg:flex items-center gap-4 shrink-0 font-medium">
            <Link to="/products" className="hover:text-content-primary transition-colors">About Us</Link>
            <span>|</span>
            <Link to="/products" className="hover:text-content-primary transition-colors">FAQs</Link>
            <span>|</span>
            <Link to="/account/orders" className="hover:text-content-primary transition-colors">Track Order</Link>
            <span>|</span>
            {isLoggedIn ? (
              <span className="text-accent-400 font-bold">Hello, {user?.phone}</span>
            ) : (
              <Link to="/login" className="hover:text-content-primary transition-colors">My Account</Link>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN HEADER ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Mobile Menu Hamburger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="md:hidden p-2 rounded-xl bg-bg-card border border-bg-border text-content-secondary"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-glow">
            <span className="text-white font-head font-bold text-base sm:text-lg">Rx</span>
          </div>
          <div>
            <span className="font-head font-extrabold text-xl sm:text-2xl text-content-primary tracking-tight">
              Health<span className="text-primary-400">Mart</span>
            </span>
            <span className="block text-[9px] text-content-muted -mt-1 font-semibold tracking-wider uppercase">
              PharmaSYS
            </span>
          </div>
        </Link>

        {/* Search Bar with Category Selector */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center flex-1 max-w-xl bg-bg-card border border-bg-border rounded-full p-1 shadow-sm focus-within:border-primary-500 transition-all"
        >
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-transparent text-content-secondary text-xs font-medium px-4 py-2 border-r border-bg-border focus:outline-none cursor-pointer max-w-[130px] truncate"
          >
            <option value="" className="bg-bg-card text-content-primary">All Categories</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id} className="bg-bg-card text-content-primary">
                {c.name}
              </option>
            ))}

          </select>

          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent px-4 py-1.5 text-xs text-content-primary placeholder:text-content-muted focus:outline-none"
          />

          <button
            type="submit"
            aria-label="Search"
            className="w-8 h-8 rounded-full bg-primary-600 hover:bg-primary-500 text-white flex items-center justify-center transition-colors mr-1"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Right Section Icons */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="hidden xl:flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-accent-500/10 text-accent-400 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div className="text-left leading-tight">
              <span className="text-[9px] text-content-muted uppercase font-semibold">Need Help?</span>
              <p className="text-xs font-extrabold text-content-primary">+880 1700-000000</p>
            </div>
          </div>

          <Link
            to="/account/wishlist"
            className="relative p-2 text-content-secondary hover:text-content-primary transition-colors"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            className="flex items-center gap-2 bg-bg-card border border-bg-border hover:border-primary-500/50 px-3 py-1.5 rounded-full text-content-primary transition-all"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-primary-400" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-accent-500 text-bg-base text-[9px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
            <div className="text-left leading-none hidden sm:block">
              <span className="text-[9px] text-content-muted font-medium">Cart</span>
              <p className="text-xs font-extrabold text-primary-400 mt-0.5">{itemCount}</p>
            </div>
          </Link>

          {/* Theme Selector Dropdown */}
          <ThemeSelector />

          {isLoggedIn ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="w-8 h-8 rounded-full bg-primary-600/30 border border-primary-500/50 text-primary-300 font-bold text-xs flex items-center justify-center uppercase hover:ring-2 hover:ring-primary-500/50 transition-all"
              >
                {user?.phone?.[0] ?? 'U'}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-bg-card border border-bg-border rounded-2xl shadow-card py-2 z-50">
                  <div className="px-3 py-2 border-b border-bg-border">
                    <p className="text-xs font-bold text-content-primary truncate">{user?.phone}</p>
                  </div>
                  <Link
                    to="/account/orders"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-content-secondary hover:text-content-primary hover:bg-bg-surface transition-colors"
                  >
                    <Package className="w-4 h-4" /> My Orders
                  </Link>
                  <Link
                    to="/account/addresses"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-content-secondary hover:text-content-primary hover:bg-bg-surface transition-colors"
                  >
                    <MapPin className="w-4 h-4" /> Addresses
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-bg-surface transition-colors border-t border-bg-border"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <div className="w-8 h-8 rounded-full bg-bg-card border border-bg-border text-content-secondary hover:text-content-primary flex items-center justify-center transition-colors">
                <UserIcon className="w-4 h-4" />
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* ── SECONDARY NAVIGATION BAR (SHOP BY CATEGORIES HOVER FLYOUT) ── */}
      <div className="border-t border-bg-border/60 bg-bg-card/40 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-11">
          {/* Shop By Categories Dropdown triggering on HOVER & CLICK */}
          <div
            className="relative"
            onMouseEnter={() => setCatMenuOpen(true)}
            onMouseLeave={() => {
              setCatMenuOpen(false);
              setActiveHoverCat(null);
            }}
          >
            <button
              type="button"
              onClick={() => setCatMenuOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-600 hover:bg-primary-500 text-white font-head font-bold text-xs transition-colors shadow-glow"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>Shop By Categories</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${catMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Hover Mega Category & Subcategory Flyout Menu */}
            {catMenuOpen && (
              <div className="absolute left-0 mt-1 flex z-50">
                {/* Main Categories Panel */}
                <div className="w-64 bg-bg-card border border-bg-border rounded-2xl shadow-card p-2 space-y-1">
                  {categories.map((cat: any) => {
                    const hasChildren = cat.children && cat.children.length > 0;
                    const isHovered = activeHoverCat === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onMouseEnter={() => setActiveHoverCat(cat.id)}
                        className="relative"
                      >
                        <Link
                          to={`/products?category=${cat.id}`}
                          onClick={() => setCatMenuOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                            isHovered
                              ? 'bg-primary-600/20 text-primary-400 font-semibold'
                              : 'text-content-secondary hover:text-content-primary hover:bg-bg-surface'
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          {hasChildren && <ChevronRight className="w-3.5 h-3.5 text-primary-400" />}
                        </Link>
                      </div>
                    );
                  })}
                </div>

                {/* Nested Subcategories Sub-Panel */}
                {activeHoverCat && (
                  <div className="w-60 bg-bg-card border border-bg-border rounded-2xl shadow-card p-2 space-y-1 ml-1 self-start max-h-80 overflow-y-auto custom-scrollbar">
                    {categories
                      .find((c: any) => c.id === activeHoverCat)
                      ?.children?.map((sub: any) => (
                        <Link
                          key={sub.id}
                          to={`/products?subcategory=${sub.id}`}
                          onClick={() => {
                            setCatMenuOpen(false);
                            setActiveHoverCat(null);
                          }}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-content-secondary hover:text-primary-400 hover:bg-bg-surface transition-colors"
                        >
                          <span>{sub.name}</span>
                          <ChevronRight className="w-3 h-3 text-content-muted" />
                        </Link>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6 text-xs font-semibold text-content-secondary">
            <Link to="/" className="text-primary-400 hover:text-primary-300 transition-colors">
              Home
            </Link>
            <Link to="/products" className="hover:text-content-primary transition-colors">
              Shop
            </Link>
            <Link to="/products" className="hover:text-content-primary transition-colors flex items-center gap-1">
              Categories
              <span className="px-1.5 py-0.2 rounded bg-accent-500/20 text-accent-400 text-[9px] font-bold">
                SALE
              </span>
            </Link>
            <Link to="/products" className="hover:text-content-primary transition-colors flex items-center gap-1">
              Products
              <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[9px] font-bold flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5" /> HOT
              </span>
            </Link>
            <Link to="/products" className="hover:text-content-primary transition-colors">
              Top deals
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

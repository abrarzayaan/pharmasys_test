import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, LogOut, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { useWishlistStore } from '@/store/wishlist.store';

export default function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const [search, setSearch] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-bg-surface/90 backdrop-blur-md border-b border-bg-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center glow-primary">
              <span className="text-white font-head font-bold text-sm">Rx</span>
            </div>
            <span className="font-head font-bold text-lg text-content-primary hidden sm:block">
              Pharma<span className="text-primary-400">SYS</span>
            </span>
          </Link>

          {/* ── Search bar ── */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-muted" />
              <input
                id="header-search"
                type="search"
                placeholder="Search medicines, products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg-card border border-bg-border text-sm
                           text-content-primary placeholder:text-content-muted
                           focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500
                           transition-colors"
              />
            </div>
          </form>

          {/* ── Actions ── */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative p-2 rounded-xl text-content-secondary hover:text-content-primary hover:bg-bg-hover transition-colors"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-accent-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              aria-label="Shopping cart"
              className="relative p-2 rounded-xl text-content-secondary hover:text-content-primary hover:bg-bg-hover transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-primary-600 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </motion.span>
              )}
            </Link>

            {/* User menu */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  id="user-menu-btn"
                  aria-label="User menu"
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="flex items-center gap-2 p-2 rounded-xl text-content-secondary hover:text-content-primary hover:bg-bg-hover transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-600/30 border border-primary-600/50 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-400 uppercase">
                      {user?.phone?.[0] ?? 'U'}
                    </span>
                  </div>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0,  scale: 1 }}
                      exit={{  opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-bg-card border border-bg-border rounded-2xl shadow-card py-1 z-50"
                    >
                      <div className="px-3 py-2 border-b border-bg-border">
                        <p className="text-sm font-medium text-content-primary truncate">{user?.phone}</p>
                        <p className="text-xs text-content-muted truncate">{user?.email ?? 'Consumer'}</p>
                      </div>
                      {[
                        { to: '/account/orders',    icon: Package, label: 'My Orders' },
                        { to: '/account/profile',   icon: User,    label: 'Profile' },
                      ].map(({ to, icon: Icon, label }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-content-secondary hover:text-content-primary hover:bg-bg-hover transition-colors"
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl transition-colors shadow-glow"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

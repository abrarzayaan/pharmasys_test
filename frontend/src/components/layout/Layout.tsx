import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import MobileNav from './MobileNav';
import CartDrawer from '@/components/cart/CartDrawer';

import { useThemeStore } from '@/store/theme.store';
import { useCart } from '@/hooks/useCart';

export default function Layout() {
  const { pathname } = useLocation();
  const initTheme = useThemeStore((s) => s.initTheme);
  
  // Initialize cart hook to automatically fetch & sync cart count on mount
  useCart();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      <Header />

      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0  }}
          exit={{    opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex-1"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <Footer />

      {/* Cart Drawer Overlay */}
      <CartDrawer />

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3x3, ShoppingCart, Package, User } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { motion } from 'framer-motion';

const tabs = [
  { to: '/',                 icon: Home,         label: 'Home'     },
  { to: '/products',         icon: Grid3x3,      label: 'Shop'     },
  { to: '/cart',             icon: ShoppingCart, label: 'Cart',  badge: true },
  { to: '/account/orders',   icon: Package,      label: 'Orders'   },
  { to: '/account/profile',  icon: User,         label: 'Profile'  },
];

export default function MobileNav() {
  const { pathname } = useLocation();
  const itemCount = useCartStore((s) => s.itemCount);

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 inset-x-0 z-50 bg-bg-surface/95 backdrop-blur-md border-t border-bg-border md:hidden"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map(({ to, icon: Icon, label, badge }) => {
          const active = pathname === to || (to !== '/' && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors"
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    active ? 'text-primary-400' : 'text-content-muted'
                  }`}
                />
                {badge && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  active ? 'text-primary-400' : 'text-content-muted'
                }`}
              >
                {label}
              </span>
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary-500 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-bg-surface border-t border-bg-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-white font-head font-bold text-sm">Rx</span>
              </div>
              <span className="font-head font-bold text-lg text-content-primary">
                Pharma<span className="text-primary-400">SYS</span>
              </span>
            </div>
            <p className="text-sm text-content-muted leading-relaxed">
              Your trusted online pharmacy. Delivering medicines and health products with care.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h3 className="font-head font-semibold text-content-primary text-sm">Shop</h3>
            <ul className="space-y-2">
              {[
                { to: '/products', label: 'All Products' },
                { to: '/products?category=medicines', label: 'Medicines' },
                { to: '/products?category=vitamins',  label: 'Vitamins' },
                { to: '/wishlist', label: 'Wishlist' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-content-muted hover:text-content-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-3">
            <h3 className="font-head font-semibold text-content-primary text-sm">Account</h3>
            <ul className="space-y-2">
              {[
                { to: '/account/profile',   label: 'My Profile' },
                { to: '/account/orders',    label: 'My Orders' },
                { to: '/account/addresses', label: 'Addresses' },
                { to: '/cart',              label: 'Cart' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-content-muted hover:text-content-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h3 className="font-head font-semibold text-content-primary text-sm">Support</h3>
            <ul className="space-y-2 text-sm text-content-muted">
              <li>📞 +880 1700-000000</li>
              <li>✉️ support@pharmasys.com</li>
              <li>🕐 Mon–Sat, 9am–9pm</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-bg-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-content-muted">
            © {new Date().getFullYear()} PharmaSys. All rights reserved.
          </p>
          <p className="text-xs text-content-muted">
            Built with ❤️ for better healthcare access
          </p>
        </div>
      </div>
    </footer>
  );
}

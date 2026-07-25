import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'accent' | 'ghost' | 'danger' | 'outline';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary-600 hover:bg-primary-500 text-white shadow-glow hover:shadow-glow-lg',
  accent:  'bg-accent-500  hover:bg-accent-400  text-white shadow-glow-teal',
  ghost:   'bg-transparent hover:bg-bg-hover text-content-secondary hover:text-content-primary',
  danger:  'bg-red-600 hover:bg-red-500 text-white',
  outline: 'border border-bg-border hover:border-primary-500 bg-transparent text-content-primary',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3   text-base rounded-xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, children, disabled, className = '', ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center justify-center gap-2 font-sans font-medium',
          'transition-all duration-200 cursor-pointer select-none',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? 'w-full' : '',
          className,
        ].join(' ')}
        {...(props as any)}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;

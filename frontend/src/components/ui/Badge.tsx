type BadgeVariant = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'muted';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-600/20 text-primary-400 border border-primary-600/30',
  accent:  'bg-accent-500/20  text-accent-400  border border-accent-500/30',
  success: 'bg-green-500/20   text-green-400   border border-green-500/30',
  warning: 'bg-yellow-500/20  text-yellow-400  border border-yellow-500/30',
  danger:  'bg-red-500/20     text-red-400     border border-red-500/30',
  muted:   'bg-bg-card        text-content-muted border border-bg-border',
};

export default function Badge({ children, variant = 'primary', className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}

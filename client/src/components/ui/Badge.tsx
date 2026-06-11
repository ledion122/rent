import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'primary' | 'accent' | 'warning' | 'danger';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variants = {
    default: 'bg-secondary-100 text-secondary-700',
    primary: 'badge-primary',
    accent: 'badge-accent',
    warning: 'badge-warning',
    danger: 'badge-danger',
  };

  return (
    <span className={cn('badge', variants[variant], className)}>
      {children}
    </span>
  );
}

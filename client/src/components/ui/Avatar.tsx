import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, alt = '', size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  if (!src) {
    return (
      <div className={cn('rounded-full bg-primary-100 flex items-center justify-center', sizes[size], className)}>
        <User className={cn('text-primary-600', size === 'sm' ? 'w-4 h-4' : 'w-6 h-6')} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn('rounded-full object-cover', sizes[size], className)}
    />
  );
}

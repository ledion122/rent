import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({ rating, maxRating = 5, size = 'sm', interactive = false, onChange }: StarRatingProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(i + 1)}
          className={cn(interactive && 'cursor-pointer hover:scale-110 transition-transform')}
        >
          <Star
            className={cn(
              sizes[size],
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : i < rating
                ? 'fill-yellow-400/50 text-yellow-400'
                : 'fill-secondary-200 text-secondary-200'
            )}
          />
        </button>
      ))}
    </div>
  );
}

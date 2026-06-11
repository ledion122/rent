import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('sq', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat('sq', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date));
}

export function calculateDays(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}

export function getVehicleCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    economy: 'Car',
    compact: 'Car',
    'mid-size': 'Car',
    suv: 'Caravan',
    luxury: 'Car',
    van: 'Truck',
    truck: 'Truck',
  };
  return icons[category] || 'Car';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

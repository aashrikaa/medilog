import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(date: Date, language: 'en' | 'np' = 'en'): string {
  if (language === 'np') {
    // Convert to Bikram Sambat (Nepali calendar)
    // This is a simplified conversion - in production you'd use a proper library
    const bsYear = date.getFullYear() + 57; // Approximate conversion
    return `${bsYear} BS`;
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'normal':
      return 'text-green-600 bg-green-100';
    case 'high':
      return 'text-red-600 bg-red-100';
    case 'low':
      return 'text-yellow-600 bg-yellow-100';
    case 'critical':
      return 'text-red-800 bg-red-200';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'Lab Reports':
      return 'bg-blue-100 text-blue-800';
    case 'Prescriptions':
      return 'bg-green-100 text-green-800';
    case 'Imaging':
      return 'bg-purple-100 text-purple-800';
    case 'Other':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

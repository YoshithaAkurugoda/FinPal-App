import { useAuthStore } from '@/stores/authStore';

const localeForCurrency: Record<string, string> = {
  LKR: 'en-LK',
  USD: 'en-US',
  EUR: 'en-DE',
  GBP: 'en-GB',
  INR: 'en-IN',
};

const symbolForCurrency: Record<string, string> = {
  LKR: 'Rs',
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
};

export function useCurrency(): string {
  return useAuthStore((s) => s.user?.currency ?? 'LKR');
}

export function currencySymbol(currency: string): string {
  return symbolForCurrency[currency] ?? currency;
}

export function formatAmount(amount: number, currency: string): string {
  const locale = localeForCurrency[currency] ?? 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currencySymbol(currency)} ${Math.round(amount).toLocaleString(locale)}`;
  }
}

export function formatNumber(amount: number, currency: string): string {
  const locale = localeForCurrency[currency] ?? 'en-US';
  return Math.round(amount).toLocaleString(locale);
}

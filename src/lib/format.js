import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/**
 * Format money based on currency.
 * Hard rule: KHR without decimals (e.g. 100,000 ៛), USD with 2 decimals (e.g. $25.00).
 * Never sum or combine different currencies!
 */
export function formatMoney(amount, currency = 'USD') {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return currency === 'KHR' ? '0 ៛' : '$0.00';
  }

  const num = Number(amount);

  if (currency === 'KHR') {
    // Khmer Riel: integer with commas, trailing symbol
    const rounded = Math.round(num);
    return `${rounded.toLocaleString('en-US')} ៛`;
  }

  // Default USD: 2 decimal places, leading symbol
  return `$${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format date strings using dayjs
 */
export function formatDate(date, formatStr = 'DD MMM YYYY') {
  if (!date) return '-';
  return dayjs(date).format(formatStr);
}

/**
 * Format date and time
 */
export function formatDateTime(date, formatStr = 'DD MMM YYYY, HH:mm') {
  if (!date) return '-';
  return dayjs(date).format(formatStr);
}

/**
 * Format relative time (e.g., "3 hours ago")
 */
export function formatRelativeTime(date) {
  if (!date) return '-';
  return dayjs(date).fromNow();
}

/**
 * Format numbers with comma separation
 */
export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(Number(num))) return '0';
  return Number(num).toLocaleString('en-US');
}

/**
 * Mask phone numbers for privacy protection:
 * e.g., "012345678" -> "012 *** 678"
 */
export function maskPhone(phone) {
  if (!phone) return '-';
  const clean = String(phone).replace(/\s+/g, '');
  if (clean.length < 6) return '***';
  const start = clean.slice(0, 3);
  const end = clean.slice(-3);
  return `${start} *** ${end}`;
}

/**
 * Mask secrets and API tokens:
 * e.g., "sk_live_12345678" -> "••••••••••••••••"
 */
export function maskSecret(secret) {
  if (!secret) return '';
  return '••••••••••••••••';
}

/**
 * Format file size in bytes to human readable string (KB, MB, GB)
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

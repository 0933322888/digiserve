import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes
 * @param {...string} inputs - Class names to merge
 * @returns {string} Merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format price to currency string
 * @param {number} price - Price value
 * @returns {string} Formatted price string
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

/**
 * Parse a date string as a local date (not UTC)
 * Handles date-only strings like "2025-11-30" by parsing them as local dates
 * This prevents timezone issues where "2025-11-30" would be interpreted as UTC midnight
 * and shift to the previous day in timezones behind UTC
 * @param {string} dateString - ISO date string or date-only string (YYYY-MM-DD)
 * @returns {Date} Date object representing the date in local timezone
 */
export function parseLocalDate(dateString) {
  // If it's a date-only string (YYYY-MM-DD format), parse it as local date
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number)
    // month is 0-indexed in Date constructor
    return new Date(year, month - 1, day)
  }
  // Otherwise, use standard Date parsing (handles ISO strings with time)
  return new Date(dateString)
}

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string or date-only string (YYYY-MM-DD)
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
  const date = parseLocalDate(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

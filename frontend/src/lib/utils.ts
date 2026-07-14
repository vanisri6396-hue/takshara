import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS classes with proper conflict resolution.
 * Combines clsx for conditional classes and tailwind-merge for deduplication.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime())
}

function toDate(value: string | Date | undefined | null): Date | null {
  if (!value) return null
  const d = typeof value === 'string' ? new Date(value) : value
  return isValidDate(d) ? d : null
}

/**
 * Format a date string to a human-readable format.
 *
 * Requirement-safe: never throws, never uses toLocaleDateString/toLocaleTimeString.
 */
export function formatDate(date: string | Date | undefined | null): string {
  const d = toDate(date)
  if (!d) return 'No due date'


  const monthIndex = d.getMonth()
  const day = d.getDate()
  const year = d.getFullYear()

  // Keep output stable and locale-independent.
  const monthShort = [
    'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',
  ][monthIndex] ?? '—'

  return `${monthShort} ${day}, ${year}`
}

/**
 * Format time from a date string.
 * Requirement-safe: never throws, never uses toLocaleTimeString.
 */
export function formatTime(date: string | Date | undefined | null): string {
  const d = toDate(date)
  if (!d) return '—'

  const hours = d.getHours()
  const minutes = d.getMinutes()
  const hh = String(hours).padStart(2, '0')
  const mm = String(minutes).padStart(2, '0')
  return `${hh}:${mm}`
}


/**
 * Calculate percentage safely.
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Truncate text to a specified length.
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trimEnd() + '…'
}

/**
 * Get initials from a name (e.g., "John Doe" → "JD").
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
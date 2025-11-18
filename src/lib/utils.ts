import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Strips HTML tags from a string.
 * @param html The HTML string to strip.
 * @returns The plain text string.
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  if (typeof window === 'undefined') {
    // Basic stripping for server-side rendering if needed, though this is a client component feature.
    return html.replace(/<[^>]*>?/gm, '');
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
}

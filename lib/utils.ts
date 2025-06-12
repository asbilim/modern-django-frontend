import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names into a single string, merging Tailwind CSS classes
 * Uses clsx for conditional classes and tailwind-merge for proper class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names into a single string, merging Tailwind CSS classes
 * Uses clsx for conditional classes and tailwind-merge for proper class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the admin model URL path
 *
 * @param modelKey The model key identifier
 * @param id Optional model item ID for editing a specific item
 * @returns The URL path for the model
 */
export function getModelUrl(modelKey: string, id?: string | number) {
  if (id) {
    return `/admin/models/${modelKey}/${id}`;
  }
  return `/admin/models/${modelKey}`;
}

/**
 * Format a date string to a human-readable format
 *
 * @param dateString The date string to format
 * @param locale The locale to use for formatting
 * @returns The formatted date string
 */
export function formatDate(dateString: string, locale = "en-US") {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return dateString;
  }
}

/**
 * Truncate a string to a maximum length
 *
 * @param str The string to truncate
 * @param maxLength The maximum length of the string
 * @returns The truncated string
 */
export function truncateString(str: string, maxLength = 50) {
  if (!str) return "";
  if (str.length <= maxLength) return str;

  return `${str.substring(0, maxLength)}...`;
}

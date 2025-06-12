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
 * Get the URL for a model or model item
 */
export function getModelUrl(modelKey: string, id?: string | number): string {
  if (id) {
    // If ID is "create", this is a create new item URL
    return `/models/${modelKey}/${id}`;
  }
  // Otherwise, it's a model list URL
  return `/models/${modelKey}`;
}

/**
 * Format a date string consistently
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
}

/**
 * Format a number with commas
 */
export function formatNumber(number?: number | null): string {
  if (number === undefined || number === null) return "-";
  return number.toLocaleString();
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Format file size
 */
export function formatFileSize(bytes?: number | null): string {
  if (bytes === undefined || bytes === null) return "-";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

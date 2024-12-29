// lib/utils/index.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export { cn };

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates an article ID in the format `YYYY-MM-DD-slug`.
 * @param {string} datePublished - The date the article was published (in ISO format).
 * @param {string} slug - The article's slug.
 * @returns {string} The formatted article ID.
 */
// export function generateArticleId(datePublished: string, slug: string): string {
//   const datePart = datePublished.slice(0, 10); // Extract YYYY-MM-DD from ISO date.
//   return `${datePart}-${slug}`; // Combine date and slug with a hyphen.
// }

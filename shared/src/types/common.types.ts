/**
 * Common types used across the application
 */

/**
 * Supported languages in the application
 */
export type Language = "it" | "en" | "es" | "ar";

/**
 * Text that can be localized in multiple languages
 */
export interface LocalizedText {
  it?: string;
  en?: string;
  es?: string;
  ar?: string;
  [key: string]: string | undefined;
}

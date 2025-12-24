/**
 * Security utility functions for sanitizing sensitive data
 */

/**
 * Sanitizes error messages to prevent potential leakage of sensitive information
 * @param error - The error object to sanitize
 * @param fallbackMessage - The generic message to return when error exists
 * @returns A safe, non-sensitive error message
 */
export function sanitizeError(error: unknown, fallbackMessage: string): string {
  // Always return the generic fallback message, never expose actual error details
  return fallbackMessage;
}

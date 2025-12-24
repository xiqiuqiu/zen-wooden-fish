/**
 * Security utility functions for sanitizing sensitive data
 */

/**
 * Sanitizes error messages to prevent potential leakage of sensitive information
 * @param error - The error object to sanitize
 * @param fallbackMessage - The generic message to return
 * @returns A safe, non-sensitive error message
 */
export function sanitizeError(error: unknown, fallbackMessage: string): string {
  // Always return a generic message, never expose actual error details
  return error instanceof Error && error.message ? fallbackMessage : 'Unknown error';
}

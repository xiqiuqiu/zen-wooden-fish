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
  // In development, log the actual error to console for debugging
  // but still return the generic message to avoid leaking it to users
  if (import.meta.env.DEV && error instanceof Error) {
    console.debug('Debug error details:', error.message);
  }
  
  // Always return the generic fallback message, never expose actual error details
  return fallbackMessage;
}

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
  // In development mode only, log sanitized error details for debugging
  if (import.meta.env.DEV) {
    if (error instanceof Error) {
      // Log only generic error type, never the actual error name which could be sensitive
      console.debug('Debug: Error occurred - check network/API configuration');
    } else if (typeof error === 'string') {
      // For string errors, log only that a string error occurred
      console.debug('Debug: String error occurred');
    } else {
      // For other error types, log only the type
      console.debug('Debug:', typeof error, 'error occurred');
    }
  }
  
  // Always return the generic fallback message, never expose actual error details
  return fallbackMessage;
}

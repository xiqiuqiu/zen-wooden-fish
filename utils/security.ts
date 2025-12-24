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
      // For Error objects, log only the error name and a generic indicator
      console.debug('Debug error details:', error.name, '- check network/API configuration');
    } else if (typeof error === 'string') {
      // For string errors, log only that a string error occurred
      console.debug('Debug error details: String error occurred');
    } else {
      // For other error types, log only the type
      console.debug('Debug error details:', typeof error, 'error occurred');
    }
  }
  
  // Always return the generic fallback message, never expose actual error details
  return fallbackMessage;
}

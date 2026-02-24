import { WhisperlyApiError } from '@sudobility/whisperly_client';

/**
 * Format an error for storage in a Zustand store.
 *
 * Extracts a human-readable error message string from an Error object.
 * If the error is a {@link WhisperlyApiError}, includes the HTTP status code
 * to enable more specific error handling in the UI (e.g., distinguishing
 * 404 "Not Found" from 500 "Server Error").
 *
 * @param error - The error to format. Handles `Error`, `WhisperlyApiError`, and unknown types.
 * @returns A formatted error message string
 *
 * @example
 * ```ts
 * // Standard error
 * formatStoreError(new Error('Network failed')) // => 'Network failed'
 *
 * // WhisperlyApiError with status code
 * formatStoreError(new WhisperlyApiError('Not Found', 404)) // => '[404] Not Found'
 *
 * // Unknown error
 * formatStoreError('something') // => 'An unknown error occurred'
 * ```
 */
export function formatStoreError(error: unknown): string {
  if (error instanceof WhisperlyApiError) {
    return `[${error.statusCode}] ${error.message}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

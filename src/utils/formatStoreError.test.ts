import { describe, it, expect } from 'vitest';
import { WhisperlyApiError } from '@sudobility/whisperly_client';
import { formatStoreError } from './formatStoreError';

describe('formatStoreError', () => {
  it('formats a standard Error with its message', () => {
    const error = new Error('Network failed');
    expect(formatStoreError(error)).toBe('Network failed');
  });

  it('formats a WhisperlyApiError with status code prefix', () => {
    const error = new WhisperlyApiError('Not Found', 404);
    expect(formatStoreError(error)).toBe('[404] Not Found');
  });

  it('formats a WhisperlyApiError with 500 status', () => {
    const error = new WhisperlyApiError('Internal Server Error', 500);
    expect(formatStoreError(error)).toBe('[500] Internal Server Error');
  });

  it('formats a WhisperlyApiError with 401 status', () => {
    const error = new WhisperlyApiError('Unauthorized', 401);
    expect(formatStoreError(error)).toBe('[401] Unauthorized');
  });

  it('returns fallback message for unknown error types', () => {
    expect(formatStoreError('string error')).toBe('An unknown error occurred');
    expect(formatStoreError(42)).toBe('An unknown error occurred');
    expect(formatStoreError(null)).toBe('An unknown error occurred');
    expect(formatStoreError(undefined)).toBe('An unknown error occurred');
  });

  it('handles TypeError correctly', () => {
    const error = new TypeError('Cannot read properties of undefined');
    expect(formatStoreError(error)).toBe('Cannot read properties of undefined');
  });
});

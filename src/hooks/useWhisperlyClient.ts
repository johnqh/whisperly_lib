import { useMemo } from 'react';
import { WhisperlyClient } from '@sudobility/whisperly_client';
import type { NetworkClient } from '@sudobility/types';

/**
 * Options for the {@link useWhisperlyClient} hook.
 */
export interface UseWhisperlyClientOptions {
  /** Base URL for the Whisperly API (e.g., "https://api.whisperly.dev") */
  baseUrl: string;
  /** Platform-agnostic network client for making HTTP requests */
  networkClient: NetworkClient;
}

/**
 * Hook that creates a memoized WhisperlyClient instance.
 *
 * The client is recreated only when `baseUrl` or `networkClient` changes,
 * ensuring a stable reference across renders.
 *
 * @param options - Client configuration with base URL and network client
 * @returns A memoized WhisperlyClient instance
 *
 * @example
 * ```ts
 * const client = useWhisperlyClient({ baseUrl: 'https://api.whisperly.dev', networkClient });
 * ```
 */
export function useWhisperlyClient(
  options: UseWhisperlyClientOptions
): WhisperlyClient {
  const { baseUrl, networkClient } = options;

  const client = useMemo(() => {
    return new WhisperlyClient({
      baseUrl,
      networkClient,
    });
  }, [baseUrl, networkClient]);

  return client;
}

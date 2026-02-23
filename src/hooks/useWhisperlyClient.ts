import { useMemo } from 'react';
import { WhisperlyClient } from '@sudobility/whisperly_client';
import type { NetworkClient } from '@sudobility/types';

export interface UseWhisperlyClientOptions {
  baseUrl: string;
  networkClient: NetworkClient;
}

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

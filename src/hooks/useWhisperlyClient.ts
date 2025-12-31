import { useMemo } from 'react';
import { WhisperlyClient } from '@sudobility/whisperly_client';
import type { UseFirebaseAuthResult } from './useFirebaseAuth';

export interface UseWhisperlyClientOptions {
  baseUrl: string;
  auth: UseFirebaseAuthResult;
}

export function useWhisperlyClient(
  options: UseWhisperlyClientOptions
): WhisperlyClient {
  const { baseUrl, auth } = options;

  const client = useMemo(() => {
    return new WhisperlyClient({
      baseUrl,
      getIdToken: auth.getIdToken,
    });
  }, [baseUrl, auth.getIdToken]);

  return client;
}

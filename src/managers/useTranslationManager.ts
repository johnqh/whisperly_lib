import { useCallback, useState, useMemo } from 'react';
import { useTranslate, WhisperlyClient } from '@sudobility/whisperly_client';
import type {
  TranslationRequest,
  TranslationResponse,
} from '@sudobility/whisperly_types';

/**
 * Configuration for useTranslationManager
 */
export interface UseTranslationManagerConfig {
  baseUrl: string;
}

export interface TranslateParams {
  orgPath: string;
  projectName: string;
  request: TranslationRequest;
}

export function useTranslationManager(config: UseTranslationManagerConfig) {
  const { baseUrl } = config;

  // Create client internally - translation doesn't need auth
  const client = useMemo(
    () => new WhisperlyClient({
      baseUrl,
      getIdToken: async () => undefined,
    }),
    [baseUrl]
  );

  const translateMutation = useTranslate(client);
  const [lastResponse, setLastResponse] = useState<TranslationResponse | null>(
    null
  );

  const translate = useCallback(
    async (params: TranslateParams) => {
      const { orgPath, projectName, request } = params;
      const result = await translateMutation.mutateAsync({
        orgPath,
        projectName,
        request,
      });
      setLastResponse(result);
      return result;
    },
    [translateMutation]
  );

  const clearLastResponse = useCallback(() => {
    setLastResponse(null);
  }, []);

  return {
    // Data
    lastResponse,

    // State
    isTranslating: translateMutation.isPending,
    error: translateMutation.error?.message ?? null,

    // Actions
    translate,
    clearLastResponse,
  };
}

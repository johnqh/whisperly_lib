import { useCallback, useState } from 'react';
import { useTranslate, WhisperlyClient } from '@sudobility/whisperly_client';
import type {
  TranslationRequest,
  TranslationResponse,
} from '@sudobility/whisperly_types';

export function useTranslationManager(client: WhisperlyClient) {
  const translateMutation = useTranslate(client);
  const [lastResponse, setLastResponse] = useState<TranslationResponse | null>(
    null
  );

  const translate = useCallback(
    async (projectId: string, request: TranslationRequest) => {
      const result = await translateMutation.mutateAsync({
        projectId,
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

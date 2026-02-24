import { useCallback, useState, useMemo } from 'react';
import { useTranslate, WhisperlyClient } from '@sudobility/whisperly_client';
import type {
  TranslationRequest,
  TranslationResponse,
} from '@sudobility/whisperly_types';
import type { NetworkClient } from '@sudobility/types';

/**
 * Configuration for the {@link useTranslationManager} hook.
 *
 * Public manager that performs translations without authentication.
 * Uses the public `/translate` endpoint.
 */
export interface UseTranslationManagerConfig {
  /** Base URL for the Whisperly API (e.g., "https://api.whisperly.dev") */
  baseUrl: string;
  /** Platform-agnostic network client for making HTTP requests */
  networkClient: NetworkClient;
  /** Whether to use test mode, which bypasses rate limits and uses mock data. Defaults to `false`. */
  testMode?: boolean;
}

/**
 * Parameters for a translation request.
 *
 * Identifies the target organization and project, plus the translation payload.
 */
export interface TranslateParams {
  /** The organization's URL-safe path (e.g., "my-org") */
  orgPath: string;
  /** The project name within the organization */
  projectName: string;
  /** The translation request payload containing strings and target languages */
  request: TranslationRequest;
  /** Optional API key for authenticated access. If omitted, uses public rate limits. */
  apiKey?: string;
}

export function useTranslationManager(config: UseTranslationManagerConfig) {
  const { baseUrl, networkClient, testMode = false } = config;

  // Create client internally
  const client = useMemo(
    () => new WhisperlyClient({ baseUrl, networkClient }),
    [baseUrl, networkClient]
  );

  const translateMutation = useTranslate(client, testMode);
  const [lastResponse, setLastResponse] = useState<TranslationResponse | null>(
    null
  );

  const translate = useCallback(
    async (params: TranslateParams) => {
      const { orgPath, projectName, request, apiKey } = params;
      const result = await translateMutation.mutateAsync({
        orgPath,
        projectName,
        request,
        apiKey,
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

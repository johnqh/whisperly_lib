import {
  WhisperlyClient,
  useProjectLanguages,
  useAvailableLanguages,
} from '@sudobility/whisperly_client';
import type {
  ProjectLanguagesResponse,
  AvailableLanguage,
} from '@sudobility/whisperly_types';
import type { NetworkClient } from '@sudobility/types';
import { useMemo } from 'react';

/**
 * Configuration for the {@link useLanguagesManager} hook.
 *
 * Entity and project-scoped manager that fetches the project's
 * configured languages and the full list of available languages.
 */
export interface UseLanguagesManagerConfig {
  /** Base URL for the Whisperly API (e.g., "https://api.whisperly.dev") */
  baseUrl: string;
  /** Platform-agnostic network client for making HTTP requests */
  networkClient: NetworkClient;
  /** URL-safe slug identifying the entity/organization (e.g., "my-org") */
  entitySlug: string;
  /** The project ID whose languages to manage */
  projectId: string;
}

export interface UseLanguagesManagerResult {
  /** Project's selected languages as comma-separated string (e.g., "en,zh,ja") */
  projectLanguages: string | null;
  /** List of all available languages with code, name, and flag */
  availableLanguages: AvailableLanguage[];
  /** Loading state for initial fetch */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Update project languages */
  updateLanguages: (languages: string) => Promise<ProjectLanguagesResponse>;
  /** Loading state for update mutation */
  isUpdating: boolean;
  /** Refetch project languages */
  refetch: () => void;
}

export function useLanguagesManager(
  config: UseLanguagesManagerConfig
): UseLanguagesManagerResult {
  const { baseUrl, networkClient, entitySlug, projectId } = config;

  // Create client internally
  const client = useMemo(
    () => new WhisperlyClient({ baseUrl, networkClient }),
    [baseUrl, networkClient]
  );

  // Fetch project languages
  const projectLanguagesQuery = useProjectLanguages(client, entitySlug, projectId);

  // Fetch available languages
  const availableLanguagesQuery = useAvailableLanguages(client);

  return {
    // Data
    projectLanguages: projectLanguagesQuery.data?.languages ?? null,
    availableLanguages: availableLanguagesQuery.data ?? [],

    // State
    isLoading:
      projectLanguagesQuery.isLoading || availableLanguagesQuery.isLoading,
    error:
      projectLanguagesQuery.error?.message ??
      availableLanguagesQuery.error?.message ??
      null,

    // Actions
    updateLanguages: projectLanguagesQuery.updateProjectLanguages.mutateAsync,
    refetch: () => projectLanguagesQuery.refetch(),

    // Mutation state
    isUpdating: projectLanguagesQuery.updateProjectLanguages.isPending,
  };
}

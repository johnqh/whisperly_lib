import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WhisperlyClient } from '@sudobility/whisperly_client';
import type {
  ProjectLanguagesResponse,
  AvailableLanguage,
} from '@sudobility/whisperly_types';

/**
 * Configuration for useLanguagesManager
 */
export interface UseLanguagesManagerConfig {
  baseUrl: string;
  getIdToken: () => Promise<string | undefined>;
  entitySlug: string;
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

const QUERY_KEYS = {
  projectLanguages: 'whisperly-project-languages',
  availableLanguages: 'whisperly-available-languages',
};

export function useLanguagesManager(
  config: UseLanguagesManagerConfig
): UseLanguagesManagerResult {
  const { baseUrl, getIdToken, entitySlug, projectId } = config;
  const queryClient = useQueryClient();

  // Create client internally
  const client = useMemo(
    () => new WhisperlyClient({ baseUrl, getIdToken }),
    [baseUrl, getIdToken]
  );

  // Fetch project languages
  const projectLanguagesQuery = useQuery({
    queryKey: [QUERY_KEYS.projectLanguages, entitySlug, projectId],
    queryFn: () => client.getProjectLanguages(entitySlug, projectId),
    enabled: !!entitySlug && !!projectId,
  });

  // Fetch available languages
  const availableLanguagesQuery = useQuery({
    queryKey: [QUERY_KEYS.availableLanguages],
    queryFn: () => client.getAvailableLanguages(),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour since this rarely changes
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (languages: string) =>
      client.updateProjectLanguages(entitySlug, projectId, languages),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.projectLanguages, entitySlug, projectId],
      });
    },
  });

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
    updateLanguages: updateMutation.mutateAsync,
    refetch: () => projectLanguagesQuery.refetch(),

    // Mutation state
    isUpdating: updateMutation.isPending,
  };
}

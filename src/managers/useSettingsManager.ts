import { useEffect, useCallback, useMemo } from 'react';
import {
  useSettings,
  useUpdateSettings,
  WhisperlyClient,
} from '@sudobility/whisperly_client';
import type { UserSettings, UserSettingsUpdateRequest } from '@sudobility/whisperly_types';
import { useSettingsStore } from '../stores/settingsStore';

/**
 * Configuration for useSettingsManager
 */
export interface UseSettingsManagerConfig {
  baseUrl: string;
  getIdToken: () => Promise<string | undefined>;
  userId: string;
}

export interface UseSettingsManagerResult {
  settings: UserSettings | null;
  organizationName: string | null;
  organizationPath: string | null;
  isLoading: boolean;
  error: string | null;
  updateSettings: (data: UserSettingsUpdateRequest) => Promise<UserSettings>;
  refetch: () => void;
  isUpdating: boolean;
}

export function useSettingsManager(config: UseSettingsManagerConfig): UseSettingsManagerResult {
  const { baseUrl, getIdToken, userId } = config;

  // Create client internally
  const client = useMemo(
    () => new WhisperlyClient({ baseUrl, getIdToken }),
    [baseUrl, getIdToken]
  );

  const store = useSettingsStore();
  const { setSettings, setLoading, setError } = store;
  const settingsQuery = useSettings(client, userId);
  const updateMutation = useUpdateSettings(client, userId);

  // Sync query data to store
  useEffect(() => {
    if (settingsQuery.data) {
      setSettings(settingsQuery.data);
    }
  }, [settingsQuery.data, setSettings]);

  useEffect(() => {
    setLoading(settingsQuery.isLoading);
  }, [settingsQuery.isLoading, setLoading]);

  useEffect(() => {
    if (settingsQuery.error) {
      setError(settingsQuery.error.message);
    }
  }, [settingsQuery.error, setError]);

  const updateSettings = useCallback(
    async (data: UserSettingsUpdateRequest) => {
      const result = await updateMutation.mutateAsync(data);
      setSettings(result);
      return result;
    },
    [updateMutation, setSettings]
  );

  const refetch = useCallback(() => {
    return settingsQuery.refetch();
  }, [settingsQuery]);

  return {
    // Data
    settings: store.settings,
    organizationName: store.settings?.organization_name ?? null,
    organizationPath: store.settings?.organization_path ?? null,

    // State
    isLoading: store.isLoading || updateMutation.isPending,
    error: store.error,

    // Actions
    updateSettings,
    refetch,

    // Mutation states
    isUpdating: updateMutation.isPending,
  };
}

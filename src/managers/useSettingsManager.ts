import { useEffect, useCallback } from 'react';
import {
  useSettings,
  useUpdateSettings,
  WhisperlyClient,
} from '@sudobility/whisperly_client';
import type { UserSettings, UserSettingsUpdateRequest } from '@sudobility/whisperly_types';
import { useSettingsStore } from '../stores/settingsStore';

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

export function useSettingsManager(client: WhisperlyClient): UseSettingsManagerResult {
  const store = useSettingsStore();
  const settingsQuery = useSettings(client);
  const updateMutation = useUpdateSettings(client);

  // Sync query data to store
  useEffect(() => {
    if (settingsQuery.data) {
      store.setSettings(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  useEffect(() => {
    store.setLoading(settingsQuery.isLoading);
  }, [settingsQuery.isLoading]);

  useEffect(() => {
    if (settingsQuery.error) {
      store.setError(settingsQuery.error.message);
    }
  }, [settingsQuery.error]);

  const updateSettings = useCallback(
    async (data: UserSettingsUpdateRequest) => {
      const result = await updateMutation.mutateAsync(data);
      store.setSettings(result);
      return result;
    },
    [updateMutation, store]
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

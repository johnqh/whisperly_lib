import { useEffect, useCallback, useMemo } from 'react';
import {
  useSettings,
  WhisperlyClient,
} from '@sudobility/whisperly_client';
import type { UserSettings, UserSettingsUpdateRequest } from '@sudobility/whisperly_types';
import type { NetworkClient } from '@sudobility/types';
import { useSettingsStore } from '../stores/settingsStore';
import { formatStoreError } from '../utils/formatStoreError';

/**
 * Configuration for the {@link useSettingsManager} hook.
 *
 * User-scoped manager that fetches and updates settings for a specific user.
 */
export interface UseSettingsManagerConfig {
  /** Base URL for the Whisperly API (e.g., "https://api.whisperly.dev") */
  baseUrl: string;
  /** Platform-agnostic network client for making HTTP requests */
  networkClient: NetworkClient;
  /** The user's unique identifier (Firebase UID) */
  userId: string;
}

/**
 * Return type of the {@link useSettingsManager} hook.
 *
 * Provides user settings data, convenience accessors for organization info,
 * and an update action.
 */
export interface UseSettingsManagerResult {
  /** The user's settings object, or `null` if not yet loaded */
  settings: UserSettings | null;
  /** The user's organization display name, or `null` if settings not loaded */
  organizationName: string | null;
  /** The user's organization URL-safe path/slug, or `null` if settings not loaded */
  organizationPath: string | null;
  /** `true` when the initial fetch or update mutation is in progress */
  isLoading: boolean;
  /** Error message from the most recent failed operation, or `null` */
  error: string | null;
  /** Update user settings. Syncs the result to the local store on success. */
  updateSettings: (data: UserSettingsUpdateRequest) => Promise<UserSettings>;
  /** Refetch settings from the API */
  refetch: () => void;
  /** `true` when an update mutation is in progress */
  isUpdating: boolean;
}

export function useSettingsManager(config: UseSettingsManagerConfig): UseSettingsManagerResult {
  const { baseUrl, networkClient, userId } = config;

  // Create client internally
  const client = useMemo(
    () => new WhisperlyClient({ baseUrl, networkClient }),
    [baseUrl, networkClient]
  );

  const store = useSettingsStore();
  const { setSettings, setLoading, setError } = store;
  const settingsQuery = useSettings(client, userId);

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
      setError(formatStoreError(settingsQuery.error));
    }
  }, [settingsQuery.error, setError]);

  const updateSettings = useCallback(
    async (data: UserSettingsUpdateRequest) => {
      const result = await settingsQuery.updateSettings.mutateAsync(data);
      setSettings(result);
      return result;
    },
    [settingsQuery.updateSettings, setSettings]
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
    isLoading: store.isLoading || settingsQuery.updateSettings.isPending,
    error: store.error,

    // Actions
    updateSettings,
    refetch,

    // Mutation states
    isUpdating: settingsQuery.updateSettings.isPending,
  };
}

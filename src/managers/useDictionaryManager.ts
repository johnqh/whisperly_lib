import { useCallback, useMemo, useEffect } from 'react';
import {
  useDictionaries,
  WhisperlyClient,
} from '@sudobility/whisperly_client';
import type {
  DictionaryCreateRequest,
  DictionaryUpdateRequest,
  DictionarySearchResponse,
} from '@sudobility/whisperly_types';
import type { NetworkClient } from '@sudobility/types';
import { useDictionaryStore } from '../stores/dictionaryStore';
import { formatStoreError } from '../utils/formatStoreError';

/**
 * Configuration for the {@link useDictionaryManager} hook.
 *
 * Requires entity and project scope to manage dictionary entries
 * for a specific project.
 */
export interface UseDictionaryManagerConfig {
  /** Base URL for the Whisperly API (e.g., "https://api.whisperly.dev") */
  baseUrl: string;
  /** Platform-agnostic network client for making HTTP requests */
  networkClient: NetworkClient;
  /** URL-safe slug identifying the entity/organization (e.g., "my-org") */
  entitySlug: string;
  /** The project ID whose dictionaries to manage */
  projectId: string;
}

/**
 * Return type of the {@link useDictionaryManager} hook.
 *
 * Provides dictionary data scoped to a project, CRUD actions,
 * selection state, and individual mutation states.
 * Dictionary entries are keyed by `projectId` in the store to prevent
 * cross-project data contamination.
 */
export interface UseDictionaryManagerResult {
  /** List of dictionary entries for the current project. Always an array. */
  dictionaries: DictionarySearchResponse[];
  /** ID of the currently selected dictionary, or `null` */
  selectedDictionaryId: string | null;
  /** The currently selected dictionary object, or `null` if none selected */
  selectedDictionary: DictionarySearchResponse | null;
  /** `true` when the initial fetch or any mutation is in progress */
  isLoading: boolean;
  /** Error message from the most recent failed operation, or `null` */
  error: string | null;
  /** Create a new dictionary entry. Adds it to the local store on success. */
  createDictionary: (data: DictionaryCreateRequest) => Promise<DictionarySearchResponse>;
  /** Update an existing dictionary entry by ID. Updates the local store on success. */
  updateDictionary: (dictionaryId: string, data: DictionaryUpdateRequest) => Promise<DictionarySearchResponse>;
  /** Delete a dictionary entry by ID. Removes it from the local store on success. */
  deleteDictionary: (dictionaryId: string) => Promise<void>;
  /** Set the selected dictionary ID. Pass `null` to deselect. */
  selectDictionary: (dictionaryId: string | null) => void;
  /** `true` when a create mutation is in progress */
  isCreating: boolean;
  /** `true` when an update mutation is in progress */
  isUpdating: boolean;
  /** `true` when a delete mutation is in progress */
  isDeleting: boolean;
}

export function useDictionaryManager(config: UseDictionaryManagerConfig): UseDictionaryManagerResult {
  const { baseUrl, networkClient, entitySlug, projectId } = config;

  // Create client internally
  const client = useMemo(
    () => new WhisperlyClient({ baseUrl, networkClient }),
    [baseUrl, networkClient]
  );

  const store = useDictionaryStore();
  const {
    setDictionaries,
    addDictionary,
    updateDictionary: storeUpdateDictionary,
    removeDictionary,
    selectDictionary: storeSelectDictionary,
    setLoading,
    setError,
  } = store;

  // Fetch dictionaries on load
  const dictionariesQuery = useDictionaries(client, entitySlug, projectId);

  // Sync fetched data to store
  useEffect(() => {
    if (dictionariesQuery.data) {
      setDictionaries(projectId, dictionariesQuery.data);
    }
  }, [dictionariesQuery.data, projectId, setDictionaries]);

  // Sync loading state
  useEffect(() => {
    setLoading(dictionariesQuery.isLoading);
  }, [dictionariesQuery.isLoading, setLoading]);

  // Sync error state
  useEffect(() => {
    if (dictionariesQuery.error) {
      setError(formatStoreError(dictionariesQuery.error));
    }
  }, [dictionariesQuery.error, setError]);

  const createDictionary = useCallback(
    async (data: DictionaryCreateRequest) => {
      const result = await dictionariesQuery.createDictionary.mutateAsync(data);
      addDictionary(projectId, result);
      return result;
    },
    [dictionariesQuery.createDictionary, projectId, addDictionary]
  );

  const updateDictionary = useCallback(
    async (dictionaryId: string, data: DictionaryUpdateRequest) => {
      const result = await dictionariesQuery.updateDictionary.mutateAsync({
        dictionaryId,
        data,
      });
      storeUpdateDictionary(projectId, result);
      return result;
    },
    [dictionariesQuery.updateDictionary, projectId, storeUpdateDictionary]
  );

  const deleteDictionary = useCallback(
    async (dictionaryId: string) => {
      await dictionariesQuery.deleteDictionary.mutateAsync(dictionaryId);
      removeDictionary(projectId, dictionaryId);
    },
    [dictionariesQuery.deleteDictionary, projectId, removeDictionary]
  );

  const selectDictionary = useCallback(
    (dictionaryId: string | null) => {
      storeSelectDictionary(dictionaryId);
    },
    [storeSelectDictionary]
  );

  const dictionaries = store.dictionaries[projectId] ?? [];

  return {
    // Data
    dictionaries,
    selectedDictionaryId: store.selectedDictionaryId,
    selectedDictionary:
      dictionaries.find(d => d.dictionary_id === store.selectedDictionaryId) ?? null,

    // State
    isLoading:
      store.isLoading ||
      dictionariesQuery.createDictionary.isPending ||
      dictionariesQuery.updateDictionary.isPending ||
      dictionariesQuery.deleteDictionary.isPending,
    error: store.error,

    // Actions
    createDictionary,
    updateDictionary,
    deleteDictionary,
    selectDictionary,

    // Mutation states
    isCreating: dictionariesQuery.createDictionary.isPending,
    isUpdating: dictionariesQuery.updateDictionary.isPending,
    isDeleting: dictionariesQuery.deleteDictionary.isPending,
  };
}

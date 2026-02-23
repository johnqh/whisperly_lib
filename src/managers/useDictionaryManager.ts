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

/**
 * Configuration for useDictionaryManager
 */
export interface UseDictionaryManagerConfig {
  baseUrl: string;
  networkClient: NetworkClient;
  entitySlug: string;
  projectId: string;
}

export interface UseDictionaryManagerResult {
  dictionaries: DictionarySearchResponse[];
  selectedDictionaryId: string | null;
  selectedDictionary: DictionarySearchResponse | null;
  isLoading: boolean;
  error: string | null;
  createDictionary: (data: DictionaryCreateRequest) => Promise<DictionarySearchResponse>;
  updateDictionary: (dictionaryId: string, data: DictionaryUpdateRequest) => Promise<DictionarySearchResponse>;
  deleteDictionary: (dictionaryId: string) => Promise<void>;
  selectDictionary: (dictionaryId: string | null) => void;
  isCreating: boolean;
  isUpdating: boolean;
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
      setError(dictionariesQuery.error instanceof Error ? dictionariesQuery.error.message : 'Failed to load dictionaries');
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

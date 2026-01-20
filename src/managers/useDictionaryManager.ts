import { useCallback, useMemo } from 'react';
import {
  useCreateDictionary,
  useUpdateDictionary,
  useDeleteDictionary,
  WhisperlyClient,
} from '@sudobility/whisperly_client';
import type {
  DictionaryCreateRequest,
  DictionaryUpdateRequest,
  DictionarySearchResponse,
} from '@sudobility/whisperly_types';
import { useDictionaryStore } from '../stores/dictionaryStore';

/**
 * Configuration for useDictionaryManager
 */
export interface UseDictionaryManagerConfig {
  baseUrl: string;
  getIdToken: () => Promise<string | undefined>;
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
  const { baseUrl, getIdToken, entitySlug, projectId } = config;

  // Create client internally
  const client = useMemo(
    () => new WhisperlyClient({ baseUrl, getIdToken }),
    [baseUrl, getIdToken]
  );

  const store = useDictionaryStore();
  const {
    addDictionary,
    updateDictionary: storeUpdateDictionary,
    removeDictionary,
    selectDictionary: storeSelectDictionary,
  } = store;

  const createMutation = useCreateDictionary(client, entitySlug);
  const updateMutation = useUpdateDictionary(client, entitySlug);
  const deleteMutation = useDeleteDictionary(client, entitySlug);

  const createDictionary = useCallback(
    async (data: DictionaryCreateRequest) => {
      const result = await createMutation.mutateAsync({ projectId, data });
      addDictionary(projectId, result);
      return result;
    },
    [createMutation, projectId, addDictionary]
  );

  const updateDictionary = useCallback(
    async (dictionaryId: string, data: DictionaryUpdateRequest) => {
      const result = await updateMutation.mutateAsync({
        projectId,
        dictionaryId,
        data,
      });
      storeUpdateDictionary(projectId, result);
      return result;
    },
    [updateMutation, projectId, storeUpdateDictionary]
  );

  const deleteDictionary = useCallback(
    async (dictionaryId: string) => {
      await deleteMutation.mutateAsync({ projectId, dictionaryId });
      removeDictionary(projectId, dictionaryId);
    },
    [deleteMutation, projectId, removeDictionary]
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
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
    error: store.error,

    // Actions
    createDictionary,
    updateDictionary,
    deleteDictionary,
    selectDictionary,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

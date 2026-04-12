import { create } from 'zustand';
import type { DictionarySearchResponse } from '@sudobility/whisperly_types';

interface DictionaryState {
  dictionaries: Record<string, DictionarySearchResponse[]>; // Keyed by projectId
  selectedDictionaryId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setDictionaries: (
    projectId: string,
    dictionaries: DictionarySearchResponse[]
  ) => void;
  addDictionary: (
    projectId: string,
    dictionary: DictionarySearchResponse
  ) => void;
  updateDictionary: (
    projectId: string,
    dictionary: DictionarySearchResponse
  ) => void;
  removeDictionary: (projectId: string, dictionaryId: string) => void;
  selectDictionary: (dictionaryId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearProjectDictionaries: (projectId: string) => void;
  reset: () => void;
}

const initialState = {
  dictionaries: {},
  selectedDictionaryId: null,
  isLoading: false,
  error: null,
};

export const useDictionaryStore = create<DictionaryState>(set => ({
  ...initialState,

  setDictionaries: (projectId, dictionaries) =>
    set(state => ({
      dictionaries: {
        ...state.dictionaries,
        [projectId]: dictionaries,
      },
    })),

  addDictionary: (projectId, dictionary) =>
    set(state => ({
      dictionaries: {
        ...state.dictionaries,
        [projectId]: [...(state.dictionaries[projectId] ?? []), dictionary],
      },
    })),

  updateDictionary: (projectId, dictionary) =>
    set(state => ({
      dictionaries: {
        ...state.dictionaries,
        [projectId]: (state.dictionaries[projectId] ?? []).map(d =>
          d.dictionary_id === dictionary.dictionary_id ? dictionary : d
        ),
      },
    })),

  removeDictionary: (projectId, dictionaryId) =>
    set(state => ({
      dictionaries: {
        ...state.dictionaries,
        [projectId]: (state.dictionaries[projectId] ?? []).filter(
          d => d.dictionary_id !== dictionaryId
        ),
      },
      selectedDictionaryId:
        state.selectedDictionaryId === dictionaryId
          ? null
          : state.selectedDictionaryId,
    })),

  selectDictionary: dictionaryId => set({ selectedDictionaryId: dictionaryId }),

  setLoading: isLoading => set({ isLoading }),

  setError: error => set({ error }),

  clearProjectDictionaries: projectId =>
    set(state => {
      const { [projectId]: _, ...rest } = state.dictionaries;
      return { dictionaries: rest };
    }),

  reset: () => set(initialState),
}));

// Selectors

/**
 * Selector factory that returns dictionaries for a specific project.
 *
 * Returns an empty array if no dictionaries exist for the given project ID.
 *
 * @param projectId - The project ID to select dictionaries for
 * @returns A selector function compatible with `useDictionaryStore(selector)`
 *
 * @example
 * ```ts
 * const dictionaries = useDictionaryStore(selectDictionariesForProject('proj-123'));
 * ```
 */
export const selectDictionariesForProject =
  (projectId: string) => (state: DictionaryState) =>
    state.dictionaries[projectId] ?? [];

/** Select the ID of the currently selected dictionary, or `null` */
export const selectSelectedDictionaryId = (state: DictionaryState) =>
  state.selectedDictionaryId;

/** Select the loading state for the dictionary store */
export const selectIsLoading = (state: DictionaryState) => state.isLoading;

/** Select the error message from the dictionary store, or `null` */
export const selectError = (state: DictionaryState) => state.error;

import { create } from 'zustand';
import type { Glossary } from '@sudobility/whisperly_types';

interface GlossaryState {
  glossaries: Record<string, Glossary[]>; // Keyed by projectId
  selectedGlossaryId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setGlossaries: (projectId: string, glossaries: Glossary[]) => void;
  addGlossary: (projectId: string, glossary: Glossary) => void;
  updateGlossary: (projectId: string, glossary: Glossary) => void;
  removeGlossary: (projectId: string, glossaryId: string) => void;
  selectGlossary: (glossaryId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearProjectGlossaries: (projectId: string) => void;
  reset: () => void;
}

const initialState = {
  glossaries: {},
  selectedGlossaryId: null,
  isLoading: false,
  error: null,
};

export const useGlossaryStore = create<GlossaryState>(set => ({
  ...initialState,

  setGlossaries: (projectId, glossaries) =>
    set(state => ({
      glossaries: {
        ...state.glossaries,
        [projectId]: glossaries,
      },
    })),

  addGlossary: (projectId, glossary) =>
    set(state => ({
      glossaries: {
        ...state.glossaries,
        [projectId]: [...(state.glossaries[projectId] ?? []), glossary],
      },
    })),

  updateGlossary: (projectId, glossary) =>
    set(state => ({
      glossaries: {
        ...state.glossaries,
        [projectId]: (state.glossaries[projectId] ?? []).map(g =>
          g.id === glossary.id ? glossary : g
        ),
      },
    })),

  removeGlossary: (projectId, glossaryId) =>
    set(state => ({
      glossaries: {
        ...state.glossaries,
        [projectId]: (state.glossaries[projectId] ?? []).filter(
          g => g.id !== glossaryId
        ),
      },
      selectedGlossaryId:
        state.selectedGlossaryId === glossaryId
          ? null
          : state.selectedGlossaryId,
    })),

  selectGlossary: glossaryId => set({ selectedGlossaryId: glossaryId }),

  setLoading: isLoading => set({ isLoading }),

  setError: error => set({ error }),

  clearProjectGlossaries: projectId =>
    set(state => {
      const { [projectId]: _, ...rest } = state.glossaries;
      return { glossaries: rest };
    }),

  reset: () => set(initialState),
}));

// Selectors
export const selectGlossariesForProject =
  (projectId: string) => (state: GlossaryState) =>
    state.glossaries[projectId] ?? [];
export const selectSelectedGlossaryId = (state: GlossaryState) =>
  state.selectedGlossaryId;
export const selectIsLoading = (state: GlossaryState) => state.isLoading;
export const selectError = (state: GlossaryState) => state.error;

import { useEffect, useCallback } from 'react';
import {
  useGlossaries,
  useCreateGlossary,
  useUpdateGlossary,
  useDeleteGlossary,
  useImportGlossaries,
  useExportGlossaries,
  WhisperlyClient,
} from '@sudobility/whisperly_client';
import type {
  Glossary,
  GlossaryCreateRequest,
  GlossaryUpdateRequest,
} from '@sudobility/whisperly_types';
import { useGlossaryStore } from '../stores/glossaryStore';

export interface UseGlossaryManagerResult {
  glossaries: Glossary[];
  selectedGlossaryId: string | null;
  selectedGlossary: Glossary | null;
  isLoading: boolean;
  error: string | null;
  createGlossary: (data: GlossaryCreateRequest) => Promise<Glossary>;
  updateGlossary: (glossaryId: string, data: GlossaryUpdateRequest) => Promise<Glossary>;
  deleteGlossary: (glossaryId: string) => Promise<void>;
  importGlossaries: (glossaries: GlossaryCreateRequest[]) => Promise<Glossary[]>;
  exportGlossaries: (format?: 'json' | 'csv') => Promise<string>;
  selectGlossary: (glossaryId: string | null) => void;
  refetch: () => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isImporting: boolean;
  isExporting: boolean;
}

export function useGlossaryManager(client: WhisperlyClient, projectId: string): UseGlossaryManagerResult {
  const store = useGlossaryStore();
  const {
    setGlossaries,
    setLoading,
    setError,
    addGlossary,
    updateGlossary: storeUpdateGlossary,
    removeGlossary,
    selectGlossary: storeSelectGlossary,
  } = store;
  const glossariesQuery = useGlossaries(client, projectId);
  const createMutation = useCreateGlossary(client);
  const updateMutation = useUpdateGlossary(client);
  const deleteMutation = useDeleteGlossary(client);
  const importMutation = useImportGlossaries(client);
  const exportMutation = useExportGlossaries(client);

  // Sync query data to store
  useEffect(() => {
    if (glossariesQuery.data && projectId) {
      setGlossaries(projectId, glossariesQuery.data);
    }
  }, [glossariesQuery.data, projectId, setGlossaries]);

  useEffect(() => {
    setLoading(glossariesQuery.isLoading);
  }, [glossariesQuery.isLoading, setLoading]);

  useEffect(() => {
    if (glossariesQuery.error) {
      setError(glossariesQuery.error.message);
    }
  }, [glossariesQuery.error, setError]);

  const createGlossary = useCallback(
    async (data: GlossaryCreateRequest) => {
      const result = await createMutation.mutateAsync({ projectId, data });
      addGlossary(projectId, result);
      return result;
    },
    [createMutation, projectId, addGlossary]
  );

  const updateGlossary = useCallback(
    async (glossaryId: string, data: GlossaryUpdateRequest) => {
      const result = await updateMutation.mutateAsync({
        projectId,
        glossaryId,
        data,
      });
      storeUpdateGlossary(projectId, result);
      return result;
    },
    [updateMutation, projectId, storeUpdateGlossary]
  );

  const deleteGlossary = useCallback(
    async (glossaryId: string) => {
      await deleteMutation.mutateAsync({ projectId, glossaryId });
      removeGlossary(projectId, glossaryId);
    },
    [deleteMutation, projectId, removeGlossary]
  );

  const importGlossaries = useCallback(
    async (glossaries: GlossaryCreateRequest[]) => {
      const results = await importMutation.mutateAsync({ projectId, glossaries });
      results.forEach(g => addGlossary(projectId, g));
      return results;
    },
    [importMutation, projectId, addGlossary]
  );

  const exportGlossaries = useCallback(
    async (format: 'json' | 'csv' = 'json') => {
      return exportMutation.mutateAsync({ projectId, format });
    },
    [exportMutation, projectId]
  );

  const selectGlossary = useCallback(
    (glossaryId: string | null) => {
      storeSelectGlossary(glossaryId);
    },
    [storeSelectGlossary]
  );

  const refetch = useCallback(() => {
    return glossariesQuery.refetch();
  }, [glossariesQuery]);

  const glossaries = store.glossaries[projectId] ?? [];

  return {
    // Data
    glossaries,
    selectedGlossaryId: store.selectedGlossaryId,
    selectedGlossary:
      glossaries.find(g => g.id === store.selectedGlossaryId) ?? null,

    // State
    isLoading:
      store.isLoading ||
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      importMutation.isPending,
    error: store.error,

    // Actions
    createGlossary,
    updateGlossary,
    deleteGlossary,
    importGlossaries,
    exportGlossaries,
    selectGlossary,
    refetch,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isImporting: importMutation.isPending,
    isExporting: exportMutation.isPending,
  };
}

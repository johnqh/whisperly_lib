import { useEffect, useCallback } from 'react';
import {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  WhisperlyClient,
} from '@sudobility/whisperly_client';
import type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from '@sudobility/whisperly_types';
import { useProjectStore } from '../stores/projectStore';

export interface UseProjectManagerResult {
  projects: Project[];
  selectedProjectId: string | null;
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
  createProject: (data: ProjectCreateRequest) => Promise<Project>;
  updateProject: (projectId: string, data: ProjectUpdateRequest) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  selectProject: (projectId: string | null) => void;
  refetch: () => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useProjectManager(client: WhisperlyClient): UseProjectManagerResult {
  const store = useProjectStore();
  const {
    setProjects,
    setLoading,
    setError,
    addProject,
    updateProject: storeUpdateProject,
    removeProject,
    selectProject: storeSelectProject,
  } = store;
  const projectsQuery = useProjects(client);
  const createMutation = useCreateProject(client);
  const updateMutation = useUpdateProject(client);
  const deleteMutation = useDeleteProject(client);

  // Sync query data to store
  useEffect(() => {
    if (projectsQuery.data) {
      setProjects(projectsQuery.data);
    }
  }, [projectsQuery.data, setProjects]);

  useEffect(() => {
    setLoading(projectsQuery.isLoading);
  }, [projectsQuery.isLoading, setLoading]);

  useEffect(() => {
    if (projectsQuery.error) {
      setError(projectsQuery.error.message);
    }
  }, [projectsQuery.error, setError]);

  const createProject = useCallback(
    async (data: ProjectCreateRequest) => {
      const result = await createMutation.mutateAsync(data);
      addProject(result);
      return result;
    },
    [createMutation, addProject]
  );

  const updateProject = useCallback(
    async (projectId: string, data: ProjectUpdateRequest) => {
      const result = await updateMutation.mutateAsync({ projectId, data });
      storeUpdateProject(result);
      return result;
    },
    [updateMutation, storeUpdateProject]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      await deleteMutation.mutateAsync(projectId);
      removeProject(projectId);
    },
    [deleteMutation, removeProject]
  );

  const selectProject = useCallback(
    (projectId: string | null) => {
      storeSelectProject(projectId);
    },
    [storeSelectProject]
  );

  const refetch = useCallback(() => {
    return projectsQuery.refetch();
  }, [projectsQuery]);

  return {
    // Data
    projects: store.projects,
    selectedProjectId: store.selectedProjectId,
    selectedProject:
      store.projects.find(p => p.id === store.selectedProjectId) ?? null,

    // State
    isLoading: store.isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error: store.error,

    // Actions
    createProject,
    updateProject,
    deleteProject,
    selectProject,
    refetch,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export interface UseProjectDetailResult {
  project: Project | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProjectDetail(client: WhisperlyClient, projectId: string): UseProjectDetailResult {
  const projectQuery = useProject(client, projectId);
  const { updateProject } = useProjectStore();

  useEffect(() => {
    if (projectQuery.data) {
      updateProject(projectQuery.data);
    }
  }, [projectQuery.data, updateProject]);

  return {
    project: projectQuery.data ?? null,
    isLoading: projectQuery.isLoading,
    error: projectQuery.error?.message ?? null,
    refetch: projectQuery.refetch,
  };
}

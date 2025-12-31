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
  const projectsQuery = useProjects(client);
  const createMutation = useCreateProject(client);
  const updateMutation = useUpdateProject(client);
  const deleteMutation = useDeleteProject(client);

  // Sync query data to store
  useEffect(() => {
    if (projectsQuery.data) {
      store.setProjects(projectsQuery.data);
    }
  }, [projectsQuery.data]);

  useEffect(() => {
    store.setLoading(projectsQuery.isLoading);
  }, [projectsQuery.isLoading]);

  useEffect(() => {
    if (projectsQuery.error) {
      store.setError(projectsQuery.error.message);
    }
  }, [projectsQuery.error]);

  const createProject = useCallback(
    async (data: ProjectCreateRequest) => {
      const result = await createMutation.mutateAsync(data);
      store.addProject(result);
      return result;
    },
    [createMutation, store]
  );

  const updateProject = useCallback(
    async (projectId: string, data: ProjectUpdateRequest) => {
      const result = await updateMutation.mutateAsync({ projectId, data });
      store.updateProject(result);
      return result;
    },
    [updateMutation, store]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      await deleteMutation.mutateAsync(projectId);
      store.removeProject(projectId);
    },
    [deleteMutation, store]
  );

  const selectProject = useCallback(
    (projectId: string | null) => {
      store.selectProject(projectId);
    },
    [store]
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
  const store = useProjectStore();

  useEffect(() => {
    if (projectQuery.data) {
      store.updateProject(projectQuery.data);
    }
  }, [projectQuery.data]);

  return {
    project: projectQuery.data ?? null,
    isLoading: projectQuery.isLoading,
    error: projectQuery.error?.message ?? null,
    refetch: projectQuery.refetch,
  };
}

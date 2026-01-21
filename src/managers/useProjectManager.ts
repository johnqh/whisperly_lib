import { useEffect, useCallback, useMemo } from 'react';
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

/**
 * Configuration for useProjectManager
 */
export interface UseProjectManagerConfig {
  baseUrl: string;
  getIdToken: () => Promise<string | undefined>;
  entitySlug: string;
  /** Auto-fetch on mount when enabled (default: true) */
  autoFetch?: boolean;
}

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

export function useProjectManager(config: UseProjectManagerConfig): UseProjectManagerResult {
  const { baseUrl, getIdToken, entitySlug } = config;

  // Create client internally
  const client = useMemo(
    () => new WhisperlyClient({ baseUrl, getIdToken }),
    [baseUrl, getIdToken]
  );

  // Use selectors for state to avoid stale closure issues
  // Defensive: ensure projects is always an array even if store has issues
  const projectsFromStore = useProjectStore(state => state.projects);
  const projects = Array.isArray(projectsFromStore) ? projectsFromStore : [];
  const selectedProjectId = useProjectStore(state => state.selectedProjectId);
  const isLoadingFromStore = useProjectStore(state => state.isLoading);
  const errorFromStore = useProjectStore(state => state.error);
  const setProjects = useProjectStore(state => state.setProjects);
  const setLoading = useProjectStore(state => state.setLoading);
  const setError = useProjectStore(state => state.setError);
  const addProject = useProjectStore(state => state.addProject);
  const storeUpdateProject = useProjectStore(state => state.updateProject);
  const removeProject = useProjectStore(state => state.removeProject);
  const storeSelectProject = useProjectStore(state => state.selectProject);

  const projectsQuery = useProjects(client, entitySlug);
  const createMutation = useCreateProject(client, entitySlug);
  const updateMutation = useUpdateProject(client, entitySlug);
  const deleteMutation = useDeleteProject(client, entitySlug);

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

  // Ensure projects is array before returning (defensive)
  const safeProjects = Array.isArray(projects) ? projects : [];

  return {
    // Data
    projects: safeProjects,
    selectedProjectId,
    selectedProject: safeProjects.find(p => p.id === selectedProjectId) ?? null,

    // State
    isLoading: isLoadingFromStore || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error: errorFromStore,

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

/**
 * Configuration for useProjectDetail
 */
export interface UseProjectDetailConfig {
  baseUrl: string;
  getIdToken: () => Promise<string | undefined>;
  entitySlug: string;
  projectId: string;
}

export interface UseProjectDetailResult {
  project: Project | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProjectDetail(config: UseProjectDetailConfig): UseProjectDetailResult {
  const { baseUrl, getIdToken, entitySlug, projectId } = config;

  // Create client internally
  const client = useMemo(
    () => new WhisperlyClient({ baseUrl, getIdToken }),
    [baseUrl, getIdToken]
  );

  const projectQuery = useProject(client, entitySlug, projectId);
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

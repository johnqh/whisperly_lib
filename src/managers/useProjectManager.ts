import { useEffect, useCallback, useMemo } from 'react';
import {
  useProjects,
  useProject,
  WhisperlyClient,
} from '@sudobility/whisperly_client';
import type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from '@sudobility/whisperly_types';
import type { NetworkClient } from '@sudobility/types';
import { useProjectStore } from '../stores/projectStore';
import { formatStoreError } from '../utils/formatStoreError';

/**
 * Configuration for the {@link useProjectManager} hook.
 *
 * Requires entity-scoped identifiers to fetch and manage projects
 * belonging to a specific organization.
 */
export interface UseProjectManagerConfig {
  /** Base URL for the Whisperly API (e.g., "https://api.whisperly.dev") */
  baseUrl: string;
  /** Platform-agnostic network client for making HTTP requests */
  networkClient: NetworkClient;
  /** URL-safe slug identifying the entity/organization (e.g., "my-org") */
  entitySlug: string;
  /** Whether to auto-fetch projects on mount. Defaults to `true`. Set to `false` for lazy loading. */
  autoFetch?: boolean;
}

/**
 * Return type of the {@link useProjectManager} hook.
 *
 * Provides project data, loading/error state, CRUD actions,
 * API key management, and individual mutation states.
 */
export interface UseProjectManagerResult {
  /** List of all projects for the entity. Always an array (never null/undefined). */
  projects: Project[];
  /** ID of the currently selected project, or `null` if none selected */
  selectedProjectId: string | null;
  /** The currently selected project object, or `null` if none selected or not found */
  selectedProject: Project | null;
  /** `true` when the initial fetch or any mutation is in progress */
  isLoading: boolean;
  /** Error message from the most recent failed operation, or `null` */
  error: string | null;
  /** Create a new project. Adds the result to the local store on success. */
  createProject: (data: ProjectCreateRequest) => Promise<Project>;
  /** Update an existing project by ID. Updates the local store on success. */
  updateProject: (projectId: string, data: ProjectUpdateRequest) => Promise<Project>;
  /** Delete a project by ID. Removes it from the local store on success. */
  deleteProject: (projectId: string) => Promise<void>;
  /** Generate a new API key for a project. Updates the project in the local store. */
  generateApiKey: (projectId: string) => Promise<Project>;
  /** Delete the API key for a project. Updates the project in the local store. */
  deleteApiKey: (projectId: string) => Promise<Project>;
  /** Set the selected project ID in the store. Pass `null` to deselect. */
  selectProject: (projectId: string | null) => void;
  /** Refetch the projects list from the API */
  refetch: () => void;
  /** `true` when a create mutation is in progress */
  isCreating: boolean;
  /** `true` when an update mutation is in progress */
  isUpdating: boolean;
  /** `true` when a delete mutation is in progress */
  isDeleting: boolean;
}

export function useProjectManager(config: UseProjectManagerConfig): UseProjectManagerResult {
  const { baseUrl, networkClient, entitySlug } = config;

  // Create client internally
  const client = useMemo(
    () => new WhisperlyClient({ baseUrl, networkClient }),
    [baseUrl, networkClient]
  );

  // Use selectors for state to avoid stale closure issues
  const projects = useProjectStore(state => state.projects);
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
      setError(formatStoreError(projectsQuery.error));
    }
  }, [projectsQuery.error, setError]);

  const createProject = useCallback(
    async (data: ProjectCreateRequest) => {
      const result = await projectsQuery.createProject.mutateAsync(data);
      addProject(result);
      return result;
    },
    [projectsQuery.createProject, addProject]
  );

  const updateProject = useCallback(
    async (projectId: string, data: ProjectUpdateRequest) => {
      const result = await projectsQuery.updateProject.mutateAsync({ projectId, data });
      storeUpdateProject(result);
      return result;
    },
    [projectsQuery.updateProject, storeUpdateProject]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      await projectsQuery.deleteProject.mutateAsync(projectId);
      removeProject(projectId);
    },
    [projectsQuery.deleteProject, removeProject]
  );

  const generateApiKey = useCallback(
    async (projectId: string) => {
      const result = await client.generateProjectApiKey(entitySlug, projectId);
      storeUpdateProject(result);
      return result;
    },
    [client, entitySlug, storeUpdateProject]
  );

  const deleteApiKey = useCallback(
    async (projectId: string) => {
      const result = await client.deleteProjectApiKey(entitySlug, projectId);
      storeUpdateProject(result);
      return result;
    },
    [client, entitySlug, storeUpdateProject]
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
    projects,
    selectedProjectId,
    selectedProject: projects.find(p => p.id === selectedProjectId) ?? null,

    // State
    isLoading: isLoadingFromStore || projectsQuery.createProject.isPending || projectsQuery.updateProject.isPending || projectsQuery.deleteProject.isPending,
    error: errorFromStore,

    // Actions
    createProject,
    updateProject,
    deleteProject,
    generateApiKey,
    deleteApiKey,
    selectProject,
    refetch,

    // Mutation states
    isCreating: projectsQuery.createProject.isPending,
    isUpdating: projectsQuery.updateProject.isPending,
    isDeleting: projectsQuery.deleteProject.isPending,
  };
}

/**
 * Configuration for the {@link useProjectDetail} hook.
 *
 * Fetches a single project by ID and syncs it to the project store.
 */
export interface UseProjectDetailConfig {
  /** Base URL for the Whisperly API (e.g., "https://api.whisperly.dev") */
  baseUrl: string;
  /** Platform-agnostic network client for making HTTP requests */
  networkClient: NetworkClient;
  /** URL-safe slug identifying the entity/organization (e.g., "my-org") */
  entitySlug: string;
  /** The unique project ID to fetch */
  projectId: string;
}

/**
 * Return type of the {@link useProjectDetail} hook.
 *
 * Provides a single project's data, loading state, and error state.
 */
export interface UseProjectDetailResult {
  /** The fetched project, or `null` if not yet loaded */
  project: Project | null;
  /** `true` while the project is being fetched */
  isLoading: boolean;
  /** Error message if the fetch failed, or `null` */
  error: string | null;
  /** Refetch the project from the API */
  refetch: () => void;
}

export function useProjectDetail(config: UseProjectDetailConfig): UseProjectDetailResult {
  const { baseUrl, networkClient, entitySlug, projectId } = config;

  // Create client internally
  const client = useMemo(
    () => new WhisperlyClient({ baseUrl, networkClient }),
    [baseUrl, networkClient]
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

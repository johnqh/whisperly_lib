// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProjectStore } from '../stores/projectStore';
import type { Project } from '@sudobility/whisperly_types';

const mockProjects: Project[] = [
  {
    id: 'proj-1',
    entity_id: 'entity-1',
    project_name: 'test-project',
    display_name: 'Test Project',
    description: 'A test project',
    instructions: null,
    default_source_language: 'en',
    default_target_languages: ['es', 'fr'],
    ip_allowlist: null,
    is_active: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  },
  {
    id: 'proj-2',
    entity_id: 'entity-1',
    project_name: 'another-project',
    display_name: 'Another Project',
    description: null,
    instructions: null,
    default_source_language: 'en',
    default_target_languages: ['de'],
    ip_allowlist: null,
    is_active: true,
    created_at: new Date('2024-01-02'),
    updated_at: new Date('2024-01-02'),
  },
];

const newProject: Project = {
  id: 'proj-new',
  entity_id: 'entity-1',
  project_name: 'new-project',
  display_name: 'New Project',
  description: null,
  instructions: null,
  default_source_language: 'en',
  default_target_languages: [],
  ip_allowlist: null,
  is_active: true,
  created_at: new Date(),
  updated_at: new Date(),
};

// Create mock mutation objects that mimic TanStack Query useMutation return
function createMockMutation<TData>(resolveTo: TData) {
  return {
    mutateAsync: vi.fn().mockResolvedValue(resolveTo),
    mutate: vi.fn(),
    isPending: false,
    isIdle: true,
    isSuccess: false,
    isError: false,
    error: null,
    data: undefined,
    reset: vi.fn(),
  };
}

const mockCreateMutation = createMockMutation(newProject);
const mockUpdateMutation = createMockMutation({
  ...mockProjects[0],
  display_name: 'Updated Project',
});
const mockDeleteMutation = createMockMutation(undefined);

// Mock whisperly_client
vi.mock('@sudobility/whisperly_client', () => {
  class MockWhisperlyClient {
    constructor(_config: { baseUrl: string; networkClient: unknown }) {
      // no-op
    }
    getProjects() {
      return Promise.resolve(mockProjects);
    }
    getProject(_slug: string, projectId: string) {
      return Promise.resolve(mockProjects.find(p => p.id === projectId) ?? null);
    }
    generateProjectApiKey(_slug: string, projectId: string) {
      return Promise.resolve({
        ...mockProjects.find(p => p.id === projectId),
        api_key: 'new-api-key',
      });
    }
    deleteProjectApiKey(_slug: string, projectId: string) {
      return Promise.resolve({
        ...mockProjects.find(p => p.id === projectId),
        api_key: null,
      });
    }
  }

  return {
    WhisperlyClient: MockWhisperlyClient,
    useProjects: vi.fn().mockReturnValue({
      data: mockProjects,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      createProject: mockCreateMutation,
      updateProject: mockUpdateMutation,
      deleteProject: mockDeleteMutation,
    }),
    useProject: vi.fn().mockReturnValue({
      data: mockProjects[0],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    }),
  };
});

const mockNetworkClient = {
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

// Import after mocks are set up
const { useProjectManager, useProjectDetail } = await import('./useProjectManager');

describe('useProjectManager', () => {
  beforeEach(() => {
    useProjectStore.getState().reset();
  });

  it('returns initial state and syncs data from query', async () => {
    const { result } = renderHook(
      () =>
        useProjectManager({
          baseUrl: 'https://api.test.com',
          networkClient: mockNetworkClient,
          entitySlug: 'test-entity',
        }),
      { wrapper: createWrapper() }
    );

    // Wait for useEffect sync to propagate
    await waitFor(() => {
      expect(result.current.projects.length).toBeGreaterThan(0);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.projects).toHaveLength(2);
    expect(result.current.projects[0]!.id).toBe('proj-1');
    expect(result.current.projects[1]!.id).toBe('proj-2');
    expect(result.current.selectedProjectId).toBeNull();
    expect(result.current.selectedProject).toBeNull();
    expect(result.current.isCreating).toBe(false);
    expect(result.current.isUpdating).toBe(false);
    expect(result.current.isDeleting).toBe(false);
  });

  it('allows selecting and deselecting a project', async () => {
    const { result } = renderHook(
      () =>
        useProjectManager({
          baseUrl: 'https://api.test.com',
          networkClient: mockNetworkClient,
          entitySlug: 'test-entity',
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.projects.length).toBeGreaterThan(0);
    });

    // Select a project
    act(() => {
      result.current.selectProject('proj-1');
    });

    expect(result.current.selectedProjectId).toBe('proj-1');
    expect(result.current.selectedProject).toBeDefined();
    expect(result.current.selectedProject?.id).toBe('proj-1');

    // Deselect
    act(() => {
      result.current.selectProject(null);
    });

    expect(result.current.selectedProjectId).toBeNull();
    expect(result.current.selectedProject).toBeNull();
  });

  it('returns null selectedProject when no project is selected', async () => {
    const { result } = renderHook(
      () =>
        useProjectManager({
          baseUrl: 'https://api.test.com',
          networkClient: mockNetworkClient,
          entitySlug: 'test-entity',
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.projects.length).toBeGreaterThan(0);
    });

    expect(result.current.selectedProject).toBeNull();
  });

  it('creates a project and adds to store', async () => {
    const { result } = renderHook(
      () =>
        useProjectManager({
          baseUrl: 'https://api.test.com',
          networkClient: mockNetworkClient,
          entitySlug: 'test-entity',
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.projects.length).toBeGreaterThan(0);
    });

    let created: Project | undefined;
    await act(async () => {
      created = await result.current.createProject({
        project_name: 'new-project',
        display_name: 'New Project',
      });
    });

    expect(created).toBeDefined();
    expect(created?.id).toBe('proj-new');
    expect(mockCreateMutation.mutateAsync).toHaveBeenCalledWith({
      project_name: 'new-project',
      display_name: 'New Project',
    });

    // The new project should be in the store
    const storeProjects = useProjectStore.getState().projects;
    expect(storeProjects.find(p => p.id === 'proj-new')).toBeDefined();
  });

  it('syncs loading state from query', async () => {
    const { result } = renderHook(
      () =>
        useProjectManager({
          baseUrl: 'https://api.test.com',
          networkClient: mockNetworkClient,
          entitySlug: 'test-entity',
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('computes composite isLoading from store and mutations', async () => {
    const { result } = renderHook(
      () =>
        useProjectManager({
          baseUrl: 'https://api.test.com',
          networkClient: mockNetworkClient,
          entitySlug: 'test-entity',
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.projects.length).toBeGreaterThan(0);
    });

    // Since all mutations are idle, isLoading should only reflect store loading
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useProjectDetail', () => {
  beforeEach(() => {
    useProjectStore.getState().reset();
  });

  it('returns project data from the query', async () => {
    const { result } = renderHook(
      () =>
        useProjectDetail({
          baseUrl: 'https://api.test.com',
          networkClient: mockNetworkClient,
          entitySlug: 'test-entity',
          projectId: 'proj-1',
        }),
      { wrapper: createWrapper() }
    );

    // The mock returns data immediately
    expect(result.current.project?.id).toBe('proj-1');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('syncs fetched project to the project store via updateProject', async () => {
    // Pre-populate the store with an older version of the project
    // so that updateProject (which uses map) can find and update it
    useProjectStore.getState().setProjects([
      {
        ...mockProjects[0]!,
        display_name: 'Old Name',
      },
    ]);

    renderHook(
      () =>
        useProjectDetail({
          baseUrl: 'https://api.test.com',
          networkClient: mockNetworkClient,
          entitySlug: 'test-entity',
          projectId: 'proj-1',
        }),
      { wrapper: createWrapper() }
    );

    // Wait for the useEffect to sync the updated project
    await waitFor(() => {
      const storeState = useProjectStore.getState();
      const storedProject = storeState.projects.find(p => p.id === 'proj-1');
      expect(storedProject).toBeDefined();
      expect(storedProject?.display_name).toBe('Test Project');
    });
  });
});

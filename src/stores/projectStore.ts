import { create } from 'zustand';
import type { Project } from '@sudobility/whisperly_types';

interface ProjectState {
  projects: Project[];
  selectedProjectId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  removeProject: (projectId: string) => void;
  selectProject: (projectId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  projects: [],
  selectedProjectId: null,
  isLoading: false,
  error: null,
};

export const useProjectStore = create<ProjectState>(set => ({
  ...initialState,

  setProjects: projects => set({ projects }),

  addProject: project =>
    set(state => ({
      projects: [...state.projects, project],
    })),

  updateProject: project =>
    set(state => ({
      projects: state.projects.map(p => (p.id === project.id ? project : p)),
    })),

  removeProject: projectId =>
    set(state => ({
      projects: state.projects.filter(p => p.id !== projectId),
      selectedProjectId:
        state.selectedProjectId === projectId
          ? null
          : state.selectedProjectId,
    })),

  selectProject: projectId => set({ selectedProjectId: projectId }),

  setLoading: isLoading => set({ isLoading }),

  setError: error => set({ error }),

  reset: () => set(initialState),
}));

// Selectors
export const selectProjects = (state: ProjectState) => state.projects;
export const selectSelectedProjectId = (state: ProjectState) =>
  state.selectedProjectId;
export const selectSelectedProject = (state: ProjectState) =>
  state.projects.find(p => p.id === state.selectedProjectId) ?? null;
export const selectIsLoading = (state: ProjectState) => state.isLoading;
export const selectError = (state: ProjectState) => state.error;

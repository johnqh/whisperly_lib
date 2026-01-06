import { describe, it, expect, beforeEach } from 'vitest';
import {
  useProjectStore,
  selectProjects,
  selectSelectedProjectId,
  selectSelectedProject,
  selectIsLoading,
  selectError,
} from './projectStore';
import type { Project } from '@sudobility/whisperly_types';

const mockProject: Project = {
  id: 'proj-1',
  userId: 'user-1',
  name: 'Test Project',
  description: 'A test project',
  sourceLanguage: 'en',
  targetLanguages: ['es', 'fr'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockProject2: Project = {
  id: 'proj-2',
  userId: 'user-1',
  name: 'Another Project',
  description: 'Another test project',
  sourceLanguage: 'en',
  targetLanguages: ['de'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('projectStore', () => {
  beforeEach(() => {
    useProjectStore.getState().reset();
  });

  describe('initial state', () => {
    it('should have empty projects array', () => {
      const state = useProjectStore.getState();
      expect(selectProjects(state)).toEqual([]);
    });

    it('should have null selectedProjectId', () => {
      const state = useProjectStore.getState();
      expect(selectSelectedProjectId(state)).toBeNull();
    });

    it('should not be loading', () => {
      const state = useProjectStore.getState();
      expect(selectIsLoading(state)).toBe(false);
    });

    it('should have no error', () => {
      const state = useProjectStore.getState();
      expect(selectError(state)).toBeNull();
    });
  });

  describe('setProjects', () => {
    it('should set projects array', () => {
      useProjectStore.getState().setProjects([mockProject, mockProject2]);
      const state = useProjectStore.getState();
      expect(selectProjects(state)).toHaveLength(2);
      expect(selectProjects(state)).toContainEqual(mockProject);
    });
  });

  describe('addProject', () => {
    it('should add a project to the array', () => {
      useProjectStore.getState().addProject(mockProject);
      const state = useProjectStore.getState();
      expect(selectProjects(state)).toHaveLength(1);
      expect(selectProjects(state)[0]).toEqual(mockProject);
    });

    it('should append to existing projects', () => {
      useProjectStore.getState().addProject(mockProject);
      useProjectStore.getState().addProject(mockProject2);
      const state = useProjectStore.getState();
      expect(selectProjects(state)).toHaveLength(2);
    });
  });

  describe('updateProject', () => {
    it('should update an existing project', () => {
      useProjectStore.getState().setProjects([mockProject]);
      const updated = { ...mockProject, name: 'Updated Name' };
      useProjectStore.getState().updateProject(updated);
      const state = useProjectStore.getState();
      expect(selectProjects(state)[0].name).toBe('Updated Name');
    });

    it('should not affect other projects', () => {
      useProjectStore.getState().setProjects([mockProject, mockProject2]);
      const updated = { ...mockProject, name: 'Updated Name' };
      useProjectStore.getState().updateProject(updated);
      const state = useProjectStore.getState();
      expect(selectProjects(state).find(p => p.id === 'proj-2')?.name).toBe(
        'Another Project'
      );
    });
  });

  describe('removeProject', () => {
    it('should remove a project by id', () => {
      useProjectStore.getState().setProjects([mockProject, mockProject2]);
      useProjectStore.getState().removeProject('proj-1');
      const state = useProjectStore.getState();
      expect(selectProjects(state)).toHaveLength(1);
      expect(selectProjects(state)[0].id).toBe('proj-2');
    });

    it('should clear selectedProjectId if removed project was selected', () => {
      useProjectStore.getState().setProjects([mockProject]);
      useProjectStore.getState().selectProject('proj-1');
      useProjectStore.getState().removeProject('proj-1');
      const state = useProjectStore.getState();
      expect(selectSelectedProjectId(state)).toBeNull();
    });

    it('should keep selectedProjectId if different project was removed', () => {
      useProjectStore.getState().setProjects([mockProject, mockProject2]);
      useProjectStore.getState().selectProject('proj-2');
      useProjectStore.getState().removeProject('proj-1');
      const state = useProjectStore.getState();
      expect(selectSelectedProjectId(state)).toBe('proj-2');
    });
  });

  describe('selectProject', () => {
    it('should set selectedProjectId', () => {
      useProjectStore.getState().selectProject('proj-1');
      const state = useProjectStore.getState();
      expect(selectSelectedProjectId(state)).toBe('proj-1');
    });

    it('should allow setting to null', () => {
      useProjectStore.getState().selectProject('proj-1');
      useProjectStore.getState().selectProject(null);
      const state = useProjectStore.getState();
      expect(selectSelectedProjectId(state)).toBeNull();
    });
  });

  describe('selectSelectedProject selector', () => {
    it('should return the selected project', () => {
      useProjectStore.getState().setProjects([mockProject, mockProject2]);
      useProjectStore.getState().selectProject('proj-1');
      const state = useProjectStore.getState();
      expect(selectSelectedProject(state)).toEqual(mockProject);
    });

    it('should return null if no project selected', () => {
      useProjectStore.getState().setProjects([mockProject]);
      const state = useProjectStore.getState();
      expect(selectSelectedProject(state)).toBeNull();
    });

    it('should return null if selected project not found', () => {
      useProjectStore.getState().setProjects([mockProject]);
      useProjectStore.getState().selectProject('non-existent');
      const state = useProjectStore.getState();
      expect(selectSelectedProject(state)).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      useProjectStore.getState().setLoading(true);
      expect(selectIsLoading(useProjectStore.getState())).toBe(true);
      useProjectStore.getState().setLoading(false);
      expect(selectIsLoading(useProjectStore.getState())).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error state', () => {
      useProjectStore.getState().setError('Something went wrong');
      expect(selectError(useProjectStore.getState())).toBe('Something went wrong');
    });

    it('should allow clearing error', () => {
      useProjectStore.getState().setError('Error');
      useProjectStore.getState().setError(null);
      expect(selectError(useProjectStore.getState())).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      useProjectStore.getState().setProjects([mockProject]);
      useProjectStore.getState().selectProject('proj-1');
      useProjectStore.getState().setLoading(true);
      useProjectStore.getState().setError('Error');

      useProjectStore.getState().reset();

      const state = useProjectStore.getState();
      expect(selectProjects(state)).toEqual([]);
      expect(selectSelectedProjectId(state)).toBeNull();
      expect(selectIsLoading(state)).toBe(false);
      expect(selectError(state)).toBeNull();
    });
  });
});

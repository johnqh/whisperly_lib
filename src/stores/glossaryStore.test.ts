import { describe, it, expect, beforeEach } from 'vitest';
import {
  useGlossaryStore,
  selectGlossariesForProject,
  selectSelectedGlossaryId,
  selectIsLoading,
  selectError,
} from './glossaryStore';
import type { Glossary } from '@sudobility/whisperly_types';

const mockGlossary = (id: string, term: string): Glossary => ({
  id,
  project_id: 'proj-1',
  term,
  translations: { ja: 'テスト', es: 'prueba' },
  context: 'test context',
  created_at: new Date(),
  updated_at: new Date(),
});

describe('glossaryStore', () => {
  beforeEach(() => {
    useGlossaryStore.getState().reset();
  });

  describe('initial state', () => {
    it('has empty glossaries', () => {
      expect(useGlossaryStore.getState().glossaries).toEqual({});
    });

    it('has no selected glossary', () => {
      expect(useGlossaryStore.getState().selectedGlossaryId).toBeNull();
    });

    it('is not loading', () => {
      expect(useGlossaryStore.getState().isLoading).toBe(false);
    });

    it('has no error', () => {
      expect(useGlossaryStore.getState().error).toBeNull();
    });
  });

  describe('setGlossaries', () => {
    it('sets glossaries for a project', () => {
      const glossaries = [mockGlossary('g1', 'hello'), mockGlossary('g2', 'world')];
      useGlossaryStore.getState().setGlossaries('proj-1', glossaries);

      expect(useGlossaryStore.getState().glossaries['proj-1']).toHaveLength(2);
    });

    it('replaces existing glossaries for a project', () => {
      useGlossaryStore.getState().setGlossaries('proj-1', [mockGlossary('g1', 'hello')]);
      useGlossaryStore.getState().setGlossaries('proj-1', [mockGlossary('g2', 'world')]);

      expect(useGlossaryStore.getState().glossaries['proj-1']).toHaveLength(1);
      expect(useGlossaryStore.getState().glossaries['proj-1']![0]!.term).toBe('world');
    });

    it('does not affect other projects', () => {
      useGlossaryStore.getState().setGlossaries('proj-1', [mockGlossary('g1', 'hello')]);
      useGlossaryStore.getState().setGlossaries('proj-2', [mockGlossary('g2', 'world')]);

      expect(useGlossaryStore.getState().glossaries['proj-1']).toHaveLength(1);
      expect(useGlossaryStore.getState().glossaries['proj-2']).toHaveLength(1);
    });
  });

  describe('addGlossary', () => {
    it('adds a glossary to an existing project', () => {
      useGlossaryStore.getState().setGlossaries('proj-1', [mockGlossary('g1', 'hello')]);
      useGlossaryStore.getState().addGlossary('proj-1', mockGlossary('g2', 'world'));

      expect(useGlossaryStore.getState().glossaries['proj-1']).toHaveLength(2);
    });

    it('adds a glossary to a new project', () => {
      useGlossaryStore.getState().addGlossary('proj-1', mockGlossary('g1', 'hello'));

      expect(useGlossaryStore.getState().glossaries['proj-1']).toHaveLength(1);
    });
  });

  describe('updateGlossary', () => {
    it('updates an existing glossary', () => {
      const original = mockGlossary('g1', 'hello');
      useGlossaryStore.getState().setGlossaries('proj-1', [original]);

      const updated = { ...original, term: 'updated-hello' };
      useGlossaryStore.getState().updateGlossary('proj-1', updated);

      expect(useGlossaryStore.getState().glossaries['proj-1']![0]!.term).toBe('updated-hello');
    });

    it('does not modify other glossaries', () => {
      const g1 = mockGlossary('g1', 'hello');
      const g2 = mockGlossary('g2', 'world');
      useGlossaryStore.getState().setGlossaries('proj-1', [g1, g2]);

      const updated = { ...g1, term: 'updated-hello' };
      useGlossaryStore.getState().updateGlossary('proj-1', updated);

      expect(useGlossaryStore.getState().glossaries['proj-1']![1]!.term).toBe('world');
    });
  });

  describe('removeGlossary', () => {
    it('removes a glossary from a project', () => {
      useGlossaryStore.getState().setGlossaries('proj-1', [
        mockGlossary('g1', 'hello'),
        mockGlossary('g2', 'world'),
      ]);
      useGlossaryStore.getState().removeGlossary('proj-1', 'g1');

      expect(useGlossaryStore.getState().glossaries['proj-1']).toHaveLength(1);
      expect(useGlossaryStore.getState().glossaries['proj-1']![0]!.id).toBe('g2');
    });

    it('clears selectedGlossaryId if removed', () => {
      useGlossaryStore.getState().setGlossaries('proj-1', [mockGlossary('g1', 'hello')]);
      useGlossaryStore.getState().selectGlossary('g1');
      useGlossaryStore.getState().removeGlossary('proj-1', 'g1');

      expect(useGlossaryStore.getState().selectedGlossaryId).toBeNull();
    });

    it('keeps selectedGlossaryId if different glossary removed', () => {
      useGlossaryStore.getState().setGlossaries('proj-1', [
        mockGlossary('g1', 'hello'),
        mockGlossary('g2', 'world'),
      ]);
      useGlossaryStore.getState().selectGlossary('g1');
      useGlossaryStore.getState().removeGlossary('proj-1', 'g2');

      expect(useGlossaryStore.getState().selectedGlossaryId).toBe('g1');
    });
  });

  describe('selectGlossary', () => {
    it('sets selected glossary id', () => {
      useGlossaryStore.getState().selectGlossary('g1');
      expect(useGlossaryStore.getState().selectedGlossaryId).toBe('g1');
    });

    it('clears selection when null', () => {
      useGlossaryStore.getState().selectGlossary('g1');
      useGlossaryStore.getState().selectGlossary(null);
      expect(useGlossaryStore.getState().selectedGlossaryId).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('sets loading state', () => {
      useGlossaryStore.getState().setLoading(true);
      expect(useGlossaryStore.getState().isLoading).toBe(true);
    });
  });

  describe('setError', () => {
    it('sets error message', () => {
      useGlossaryStore.getState().setError('Something went wrong');
      expect(useGlossaryStore.getState().error).toBe('Something went wrong');
    });

    it('clears error when null', () => {
      useGlossaryStore.getState().setError('Something went wrong');
      useGlossaryStore.getState().setError(null);
      expect(useGlossaryStore.getState().error).toBeNull();
    });
  });

  describe('clearProjectGlossaries', () => {
    it('clears glossaries for a specific project', () => {
      useGlossaryStore.getState().setGlossaries('proj-1', [mockGlossary('g1', 'hello')]);
      useGlossaryStore.getState().setGlossaries('proj-2', [mockGlossary('g2', 'world')]);
      useGlossaryStore.getState().clearProjectGlossaries('proj-1');

      expect(useGlossaryStore.getState().glossaries['proj-1']).toBeUndefined();
      expect(useGlossaryStore.getState().glossaries['proj-2']).toHaveLength(1);
    });
  });

  describe('reset', () => {
    it('resets to initial state', () => {
      useGlossaryStore.getState().setGlossaries('proj-1', [mockGlossary('g1', 'hello')]);
      useGlossaryStore.getState().selectGlossary('g1');
      useGlossaryStore.getState().setLoading(true);
      useGlossaryStore.getState().setError('error');
      useGlossaryStore.getState().reset();

      expect(useGlossaryStore.getState().glossaries).toEqual({});
      expect(useGlossaryStore.getState().selectedGlossaryId).toBeNull();
      expect(useGlossaryStore.getState().isLoading).toBe(false);
      expect(useGlossaryStore.getState().error).toBeNull();
    });
  });

  describe('selectors', () => {
    it('selectGlossariesForProject returns glossaries for project', () => {
      const glossaries = [mockGlossary('g1', 'hello')];
      useGlossaryStore.getState().setGlossaries('proj-1', glossaries);

      const result = selectGlossariesForProject('proj-1')(useGlossaryStore.getState());
      expect(result).toEqual(glossaries);
    });

    it('selectGlossariesForProject returns empty array for unknown project', () => {
      const result = selectGlossariesForProject('unknown')(useGlossaryStore.getState());
      expect(result).toEqual([]);
    });

    it('selectSelectedGlossaryId returns selected id', () => {
      useGlossaryStore.getState().selectGlossary('g1');
      const result = selectSelectedGlossaryId(useGlossaryStore.getState());
      expect(result).toBe('g1');
    });

    it('selectIsLoading returns loading state', () => {
      useGlossaryStore.getState().setLoading(true);
      const result = selectIsLoading(useGlossaryStore.getState());
      expect(result).toBe(true);
    });

    it('selectError returns error', () => {
      useGlossaryStore.getState().setError('error');
      const result = selectError(useGlossaryStore.getState());
      expect(result).toBe('error');
    });
  });
});

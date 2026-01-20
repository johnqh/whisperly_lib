import { describe, it, expect, beforeEach } from 'vitest';
import {
  useDictionaryStore,
  selectDictionariesForProject,
  selectSelectedDictionaryId,
  selectIsLoading,
  selectError,
} from './dictionaryStore';
import type { DictionarySearchResponse } from '@sudobility/whisperly_types';

const mockDictionary = (id: string, translations: Record<string, string>): DictionarySearchResponse => ({
  dictionary_id: id,
  translations,
});

describe('dictionaryStore', () => {
  beforeEach(() => {
    useDictionaryStore.getState().reset();
  });

  describe('initial state', () => {
    it('has empty dictionaries', () => {
      expect(useDictionaryStore.getState().dictionaries).toEqual({});
    });

    it('has no selected dictionary', () => {
      expect(useDictionaryStore.getState().selectedDictionaryId).toBeNull();
    });

    it('is not loading', () => {
      expect(useDictionaryStore.getState().isLoading).toBe(false);
    });

    it('has no error', () => {
      expect(useDictionaryStore.getState().error).toBeNull();
    });
  });

  describe('setDictionaries', () => {
    it('sets dictionaries for a project', () => {
      const dictionaries = [
        mockDictionary('d1', { en: 'hello', ja: 'こんにちは' }),
        mockDictionary('d2', { en: 'world', ja: '世界' }),
      ];
      useDictionaryStore.getState().setDictionaries('proj-1', dictionaries);

      expect(useDictionaryStore.getState().dictionaries['proj-1']).toHaveLength(2);
    });

    it('replaces existing dictionaries for a project', () => {
      useDictionaryStore.getState().setDictionaries('proj-1', [mockDictionary('d1', { en: 'hello' })]);
      useDictionaryStore.getState().setDictionaries('proj-1', [mockDictionary('d2', { en: 'world' })]);

      expect(useDictionaryStore.getState().dictionaries['proj-1']).toHaveLength(1);
      expect(useDictionaryStore.getState().dictionaries['proj-1']![0]!.translations.en).toBe('world');
    });

    it('does not affect other projects', () => {
      useDictionaryStore.getState().setDictionaries('proj-1', [mockDictionary('d1', { en: 'hello' })]);
      useDictionaryStore.getState().setDictionaries('proj-2', [mockDictionary('d2', { en: 'world' })]);

      expect(useDictionaryStore.getState().dictionaries['proj-1']).toHaveLength(1);
      expect(useDictionaryStore.getState().dictionaries['proj-2']).toHaveLength(1);
    });
  });

  describe('addDictionary', () => {
    it('adds a dictionary to an existing project', () => {
      useDictionaryStore.getState().setDictionaries('proj-1', [mockDictionary('d1', { en: 'hello' })]);
      useDictionaryStore.getState().addDictionary('proj-1', mockDictionary('d2', { en: 'world' }));

      expect(useDictionaryStore.getState().dictionaries['proj-1']).toHaveLength(2);
    });

    it('adds a dictionary to a new project', () => {
      useDictionaryStore.getState().addDictionary('proj-1', mockDictionary('d1', { en: 'hello' }));

      expect(useDictionaryStore.getState().dictionaries['proj-1']).toHaveLength(1);
    });
  });

  describe('updateDictionary', () => {
    it('updates an existing dictionary', () => {
      const original = mockDictionary('d1', { en: 'hello' });
      useDictionaryStore.getState().setDictionaries('proj-1', [original]);

      const updated = mockDictionary('d1', { en: 'updated-hello' });
      useDictionaryStore.getState().updateDictionary('proj-1', updated);

      expect(useDictionaryStore.getState().dictionaries['proj-1']![0]!.translations.en).toBe('updated-hello');
    });

    it('does not modify other dictionaries', () => {
      const d1 = mockDictionary('d1', { en: 'hello' });
      const d2 = mockDictionary('d2', { en: 'world' });
      useDictionaryStore.getState().setDictionaries('proj-1', [d1, d2]);

      const updated = mockDictionary('d1', { en: 'updated-hello' });
      useDictionaryStore.getState().updateDictionary('proj-1', updated);

      expect(useDictionaryStore.getState().dictionaries['proj-1']![1]!.translations.en).toBe('world');
    });
  });

  describe('removeDictionary', () => {
    it('removes a dictionary from a project', () => {
      useDictionaryStore.getState().setDictionaries('proj-1', [
        mockDictionary('d1', { en: 'hello' }),
        mockDictionary('d2', { en: 'world' }),
      ]);
      useDictionaryStore.getState().removeDictionary('proj-1', 'd1');

      expect(useDictionaryStore.getState().dictionaries['proj-1']).toHaveLength(1);
      expect(useDictionaryStore.getState().dictionaries['proj-1']![0]!.dictionary_id).toBe('d2');
    });

    it('clears selectedDictionaryId if removed', () => {
      useDictionaryStore.getState().setDictionaries('proj-1', [mockDictionary('d1', { en: 'hello' })]);
      useDictionaryStore.getState().selectDictionary('d1');
      useDictionaryStore.getState().removeDictionary('proj-1', 'd1');

      expect(useDictionaryStore.getState().selectedDictionaryId).toBeNull();
    });

    it('keeps selectedDictionaryId if different dictionary removed', () => {
      useDictionaryStore.getState().setDictionaries('proj-1', [
        mockDictionary('d1', { en: 'hello' }),
        mockDictionary('d2', { en: 'world' }),
      ]);
      useDictionaryStore.getState().selectDictionary('d1');
      useDictionaryStore.getState().removeDictionary('proj-1', 'd2');

      expect(useDictionaryStore.getState().selectedDictionaryId).toBe('d1');
    });
  });

  describe('selectDictionary', () => {
    it('sets selected dictionary id', () => {
      useDictionaryStore.getState().selectDictionary('d1');
      expect(useDictionaryStore.getState().selectedDictionaryId).toBe('d1');
    });

    it('clears selection when null', () => {
      useDictionaryStore.getState().selectDictionary('d1');
      useDictionaryStore.getState().selectDictionary(null);
      expect(useDictionaryStore.getState().selectedDictionaryId).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('sets loading state', () => {
      useDictionaryStore.getState().setLoading(true);
      expect(useDictionaryStore.getState().isLoading).toBe(true);
    });
  });

  describe('setError', () => {
    it('sets error message', () => {
      useDictionaryStore.getState().setError('Something went wrong');
      expect(useDictionaryStore.getState().error).toBe('Something went wrong');
    });

    it('clears error when null', () => {
      useDictionaryStore.getState().setError('Something went wrong');
      useDictionaryStore.getState().setError(null);
      expect(useDictionaryStore.getState().error).toBeNull();
    });
  });

  describe('clearProjectDictionaries', () => {
    it('clears dictionaries for a specific project', () => {
      useDictionaryStore.getState().setDictionaries('proj-1', [mockDictionary('d1', { en: 'hello' })]);
      useDictionaryStore.getState().setDictionaries('proj-2', [mockDictionary('d2', { en: 'world' })]);
      useDictionaryStore.getState().clearProjectDictionaries('proj-1');

      expect(useDictionaryStore.getState().dictionaries['proj-1']).toBeUndefined();
      expect(useDictionaryStore.getState().dictionaries['proj-2']).toHaveLength(1);
    });
  });

  describe('reset', () => {
    it('resets to initial state', () => {
      useDictionaryStore.getState().setDictionaries('proj-1', [mockDictionary('d1', { en: 'hello' })]);
      useDictionaryStore.getState().selectDictionary('d1');
      useDictionaryStore.getState().setLoading(true);
      useDictionaryStore.getState().setError('error');
      useDictionaryStore.getState().reset();

      expect(useDictionaryStore.getState().dictionaries).toEqual({});
      expect(useDictionaryStore.getState().selectedDictionaryId).toBeNull();
      expect(useDictionaryStore.getState().isLoading).toBe(false);
      expect(useDictionaryStore.getState().error).toBeNull();
    });
  });

  describe('selectors', () => {
    it('selectDictionariesForProject returns dictionaries for project', () => {
      const dictionaries = [mockDictionary('d1', { en: 'hello' })];
      useDictionaryStore.getState().setDictionaries('proj-1', dictionaries);

      const result = selectDictionariesForProject('proj-1')(useDictionaryStore.getState());
      expect(result).toEqual(dictionaries);
    });

    it('selectDictionariesForProject returns empty array for unknown project', () => {
      const result = selectDictionariesForProject('unknown')(useDictionaryStore.getState());
      expect(result).toEqual([]);
    });

    it('selectSelectedDictionaryId returns selected id', () => {
      useDictionaryStore.getState().selectDictionary('d1');
      const result = selectSelectedDictionaryId(useDictionaryStore.getState());
      expect(result).toBe('d1');
    });

    it('selectIsLoading returns loading state', () => {
      useDictionaryStore.getState().setLoading(true);
      const result = selectIsLoading(useDictionaryStore.getState());
      expect(result).toBe(true);
    });

    it('selectError returns error', () => {
      useDictionaryStore.getState().setError('error');
      const result = selectError(useDictionaryStore.getState());
      expect(result).toBe('error');
    });
  });
});

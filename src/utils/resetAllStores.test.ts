import { describe, it, expect, beforeEach } from 'vitest';
import { resetAllStores } from './resetAllStores';
import { useProjectStore } from '../stores/projectStore';
import { useDictionaryStore } from '../stores/dictionaryStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useAnalyticsStore } from '../stores/analyticsStore';

describe('resetAllStores', () => {
  beforeEach(() => {
    // Set up some state in all stores
    useProjectStore.getState().setLoading(true);
    useDictionaryStore.getState().setLoading(true);
    useSettingsStore.getState().setLoading(true);
    useAnalyticsStore.getState().setLoading(true);
  });

  it('resets all stores to initial state', () => {
    // Verify stores have state
    expect(useProjectStore.getState().isLoading).toBe(true);
    expect(useDictionaryStore.getState().isLoading).toBe(true);
    expect(useSettingsStore.getState().isLoading).toBe(true);
    expect(useAnalyticsStore.getState().isLoading).toBe(true);

    // Reset all
    resetAllStores();

    // Verify all stores are reset
    expect(useProjectStore.getState().isLoading).toBe(false);
    expect(useDictionaryStore.getState().isLoading).toBe(false);
    expect(useSettingsStore.getState().isLoading).toBe(false);
    expect(useAnalyticsStore.getState().isLoading).toBe(false);
  });

  it('clears all data from stores', () => {
    // Set up data
    useProjectStore.getState().setProjects([
      {
        id: 'p1',
        entity_id: 'e1',
        project_name: 'test',
        display_name: 'Test',
        description: null,
        instructions: null,
        default_source_language: null,
        default_target_languages: null,
        ip_allowlist: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
    useDictionaryStore.getState().setDictionaries('proj-1', [
      {
        dictionary_id: 'd1',
        translations: { en: 'hello', ja: 'こんにちは' },
      },
    ]);
    useSettingsStore.getState().setSettings({
      id: 's1',
      firebase_uid: 'u1',
      organization_name: 'Test',
      organization_path: 'test',
      is_default: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Reset all
    resetAllStores();

    // Verify all data is cleared
    expect(useProjectStore.getState().projects).toEqual([]);
    expect(useDictionaryStore.getState().dictionaries).toEqual({});
    expect(useSettingsStore.getState().settings).toBeNull();
    expect(useAnalyticsStore.getState().analytics).toBeNull();
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { resetAllStores } from './resetAllStores';
import { useProjectStore } from '../stores/projectStore';
import { useGlossaryStore } from '../stores/glossaryStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { useAnalyticsStore } from '../stores/analyticsStore';

describe('resetAllStores', () => {
  beforeEach(() => {
    // Set up some state in all stores
    useProjectStore.getState().setLoading(true);
    useGlossaryStore.getState().setLoading(true);
    useSettingsStore.getState().setLoading(true);
    useSubscriptionStore.getState().setLoading(true);
    useAnalyticsStore.getState().setLoading(true);
  });

  it('resets all stores to initial state', () => {
    // Verify stores have state
    expect(useProjectStore.getState().isLoading).toBe(true);
    expect(useGlossaryStore.getState().isLoading).toBe(true);
    expect(useSettingsStore.getState().isLoading).toBe(true);
    expect(useSubscriptionStore.getState().isLoading).toBe(true);
    expect(useAnalyticsStore.getState().isLoading).toBe(true);

    // Reset all
    resetAllStores();

    // Verify all stores are reset
    expect(useProjectStore.getState().isLoading).toBe(false);
    expect(useGlossaryStore.getState().isLoading).toBe(false);
    expect(useSettingsStore.getState().isLoading).toBe(false);
    expect(useSubscriptionStore.getState().isLoading).toBe(false);
    expect(useAnalyticsStore.getState().isLoading).toBe(false);
  });

  it('clears all data from stores', () => {
    // Set up data
    useProjectStore.getState().setProjects([
      {
        id: 'p1',
        user_id: 'u1',
        project_name: 'test',
        display_name: 'Test',
        description: null,
        instructions: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
    useGlossaryStore.getState().setGlossaries('proj-1', [
      {
        id: 'g1',
        project_id: 'proj-1',
        term: 'test',
        translations: {},
        context: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
    useSettingsStore.getState().setSettings({
      id: 's1',
      user_id: 'u1',
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
    expect(useGlossaryStore.getState().glossaries).toEqual({});
    expect(useSettingsStore.getState().settings).toBeNull();
    expect(useSubscriptionStore.getState().subscription).toBeNull();
    expect(useAnalyticsStore.getState().analytics).toBeNull();
  });
});

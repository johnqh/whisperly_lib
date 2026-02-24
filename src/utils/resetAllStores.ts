import { useProjectStore } from '../stores/projectStore';
import { useDictionaryStore } from '../stores/dictionaryStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useAnalyticsStore } from '../stores/analyticsStore';

/**
 * Reset all Zustand stores to their initial state.
 *
 * Call this on user logout to clear all cached data and prevent
 * stale state from persisting across sessions. This is a non-hook
 * utility that can be called from anywhere (not just React components).
 *
 * Resets: projectStore, dictionaryStore, settingsStore, analyticsStore
 */
export function resetAllStores(): void {
  useProjectStore.getState().reset();
  useDictionaryStore.getState().reset();
  useSettingsStore.getState().reset();
  useAnalyticsStore.getState().reset();
}

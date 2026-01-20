import { useProjectStore } from '../stores/projectStore';
import { useDictionaryStore } from '../stores/dictionaryStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useAnalyticsStore } from '../stores/analyticsStore';

export function resetAllStores(): void {
  useProjectStore.getState().reset();
  useDictionaryStore.getState().reset();
  useSettingsStore.getState().reset();
  useAnalyticsStore.getState().reset();
}

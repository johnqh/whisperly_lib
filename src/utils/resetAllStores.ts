import { useProjectStore } from '../stores/projectStore';
import { useGlossaryStore } from '../stores/glossaryStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { useAnalyticsStore } from '../stores/analyticsStore';

export function resetAllStores(): void {
  useProjectStore.getState().reset();
  useGlossaryStore.getState().reset();
  useSettingsStore.getState().reset();
  useSubscriptionStore.getState().reset();
  useAnalyticsStore.getState().reset();
}

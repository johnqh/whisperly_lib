// Stores
export {
  // Project Store
  useProjectStore,
  selectProjects,
  selectSelectedProjectId,
  selectSelectedProject,
  selectProjectIsLoading,
  selectProjectError,
  // Dictionary Store
  useDictionaryStore,
  selectDictionariesForProject,
  selectSelectedDictionaryId,
  selectDictionaryIsLoading,
  selectDictionaryError,
  // Settings Store
  useSettingsStore,
  selectSettings,
  selectOrganizationName,
  selectOrganizationPath,
  selectSettingsIsLoading,
  selectSettingsError,
  // Analytics Store
  useAnalyticsStore,
  selectAnalytics,
  selectAggregate,
  selectByProject,
  selectByDate,
  selectDateRange,
  selectFilterProjectId,
  selectAnalyticsIsLoading,
  selectAnalyticsError,
} from './stores';

// Managers
export {
  useProjectManager,
  useProjectDetail,
  type UseProjectManagerResult,
  type UseProjectDetailResult,
} from './managers/useProjectManager';
export {
  useDictionaryManager,
  type UseDictionaryManagerResult,
} from './managers/useDictionaryManager';
export {
  useSettingsManager,
  type UseSettingsManagerResult,
} from './managers/useSettingsManager';
export {
  useAnalyticsManager,
  type UseAnalyticsManagerOptions,
  type UseAnalyticsManagerResult,
} from './managers/useAnalyticsManager';
export { useTranslationManager } from './managers/useTranslationManager';

// Hooks
export { useFirebaseAuth, type UseFirebaseAuthResult } from './hooks/useFirebaseAuth';
export {
  useWhisperlyClient,
  type UseWhisperlyClientOptions,
} from './hooks/useWhisperlyClient';

// Utils
export { resetAllStores } from './utils/resetAllStores';

// Re-export client and types for convenience
export { WhisperlyClient, WhisperlyApiError } from '@sudobility/whisperly_client';
export type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  Dictionary,
  DictionaryEntry,
  DictionaryTranslations,
  DictionaryCreateRequest,
  DictionaryUpdateRequest,
  DictionarySearchResponse,
  UserSettings,
  UserSettingsUpdateRequest,
  AnalyticsResponse,
  TranslationRequest,
  TranslationResponse,
} from '@sudobility/whisperly_types';

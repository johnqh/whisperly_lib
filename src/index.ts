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
  type UseProjectManagerConfig,
  type UseProjectManagerResult,
  type UseProjectDetailConfig,
  type UseProjectDetailResult,
} from './managers/useProjectManager';
export {
  useDictionaryManager,
  type UseDictionaryManagerConfig,
  type UseDictionaryManagerResult,
} from './managers/useDictionaryManager';
export {
  useSettingsManager,
  type UseSettingsManagerConfig,
  type UseSettingsManagerResult,
} from './managers/useSettingsManager';
export {
  useAnalyticsManager,
  type UseAnalyticsManagerConfig,
  type UseAnalyticsManagerOptions,
  type UseAnalyticsManagerResult,
} from './managers/useAnalyticsManager';
export {
  useTranslationManager,
  type UseTranslationManagerConfig,
  type TranslateParams,
} from './managers/useTranslationManager';
export {
  useLanguagesManager,
  type UseLanguagesManagerConfig,
  type UseLanguagesManagerResult,
} from './managers/useLanguagesManager';

// Hooks
export { useFirebaseAuth, type UseFirebaseAuthResult } from './hooks/useFirebaseAuth';

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
  ProjectLanguagesResponse,
  AvailableLanguage,
  UserSettings,
  UserSettingsUpdateRequest,
  AnalyticsResponse,
  TranslationRequest,
  TranslationResponse,
} from '@sudobility/whisperly_types';

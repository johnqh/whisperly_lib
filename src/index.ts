// Stores
export {
  // Project Store
  useProjectStore,
  selectProjects,
  selectSelectedProjectId,
  selectSelectedProject,
  selectProjectIsLoading,
  selectProjectError,
  // Glossary Store
  useGlossaryStore,
  selectGlossariesForProject,
  selectSelectedGlossaryId,
  selectGlossaryIsLoading,
  selectGlossaryError,
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
  useGlossaryManager,
  type UseGlossaryManagerResult,
} from './managers/useGlossaryManager';
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
  Glossary,
  GlossaryCreateRequest,
  GlossaryUpdateRequest,
  UserSettings,
  UserSettingsUpdateRequest,
  AnalyticsResponse,
  TranslationRequest,
  TranslationResponse,
} from '@sudobility/whisperly_types';

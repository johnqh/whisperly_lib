import { useEffect, useCallback, useMemo } from 'react';
import { useAnalytics, WhisperlyClient } from '@sudobility/whisperly_client';
import type {
  AnalyticsResponse,
  UsageAggregate,
  UsageByProject,
  UsageByDate,
} from '@sudobility/whisperly_types';
import type { NetworkClient } from '@sudobility/types';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { formatStoreError } from '../utils/formatStoreError';

/**
 * Configuration for the {@link useAnalyticsManager} hook.
 *
 * Entity-scoped manager that fetches analytics data with optional date and project filters.
 */
export interface UseAnalyticsManagerConfig {
  /** Base URL for the Whisperly API (e.g., "https://api.whisperly.dev") */
  baseUrl: string;
  /** Platform-agnostic network client for making HTTP requests */
  networkClient: NetworkClient;
  /** URL-safe slug identifying the entity/organization (e.g., "my-org") */
  entitySlug: string;
  /** Start date filter in ISO format (e.g., "2024-01-01"). Optional. */
  startDate?: string;
  /** End date filter in ISO format (e.g., "2024-01-31"). Optional. */
  endDate?: string;
  /** Filter analytics to a specific project ID. Optional. */
  projectId?: string;
  /** Whether to enable the query. Defaults to `true`. Set to `false` to defer fetching. */
  enabled?: boolean;
}

/**
 * Optional filter parameters for analytics queries.
 *
 * These can be passed as part of the config or updated via returned actions.
 */
export interface UseAnalyticsManagerOptions {
  /** Start date filter in ISO format (e.g., "2024-01-01") */
  startDate?: string;
  /** End date filter in ISO format (e.g., "2024-01-31") */
  endDate?: string;
  /** Filter analytics to a specific project ID */
  projectId?: string;
  /** Whether to enable the query. Defaults to `true`. */
  enabled?: boolean;
}

/**
 * Return type of the {@link useAnalyticsManager} hook.
 *
 * Provides analytics data broken down by aggregate, project, and date,
 * along with filter state and actions.
 */
export interface UseAnalyticsManagerResult {
  /** Full analytics response, or `null` if not yet loaded */
  analytics: AnalyticsResponse | null;
  /** Aggregate usage statistics for the period, or `null` */
  aggregate: UsageAggregate | null;
  /** Usage broken down by project. Always an array. */
  byProject: UsageByProject[];
  /** Usage broken down by date. Always an array. */
  byDate: UsageByDate[];
  /** Currently applied date range filter */
  dateRange: { startDate: string | null; endDate: string | null };
  /** Currently applied project ID filter, or `null` for all projects */
  filterProjectId: string | null;
  /** `true` while the analytics data is being fetched */
  isLoading: boolean;
  /** Error message from the most recent failed fetch, or `null` */
  error: string | null;
  /** Update the date range filter in the store */
  setDateRange: (start: string | null, end: string | null) => void;
  /** Update the project ID filter in the store */
  setFilterProjectId: (id: string | null) => void;
  /** Refetch analytics data from the API */
  refetch: () => void;
}

export function useAnalyticsManager(
  config: UseAnalyticsManagerConfig
): UseAnalyticsManagerResult {
  const {
    baseUrl,
    networkClient,
    entitySlug,
    startDate,
    endDate,
    projectId,
    enabled = true,
  } = config;

  // Create client internally
  const client = useMemo(
    () => new WhisperlyClient({ baseUrl, networkClient }),
    [baseUrl, networkClient]
  );

  const store = useAnalyticsStore();
  const {
    setAnalytics,
    setLoading,
    setError,
    setDateRange: storeSetDateRange,
    setFilterProjectId: storeSetFilterProjectId,
  } = store;

  const analyticsQuery = useAnalytics(client, entitySlug, {
    startDate,
    endDate,
    projectId,
    enabled,
  });

  // Sync query data to store
  useEffect(() => {
    if (analyticsQuery.data) {
      setAnalytics(analyticsQuery.data);
    }
  }, [analyticsQuery.data, setAnalytics]);

  useEffect(() => {
    setLoading(analyticsQuery.isLoading);
  }, [analyticsQuery.isLoading, setLoading]);

  useEffect(() => {
    if (analyticsQuery.error) {
      setError(formatStoreError(analyticsQuery.error));
    }
  }, [analyticsQuery.error, setError]);

  // Sync options to store
  useEffect(() => {
    storeSetDateRange(startDate ?? null, endDate ?? null);
  }, [startDate, endDate, storeSetDateRange]);

  useEffect(() => {
    storeSetFilterProjectId(projectId ?? null);
  }, [projectId, storeSetFilterProjectId]);

  const setDateRange = useCallback(
    (start: string | null, end: string | null) => {
      storeSetDateRange(start, end);
    },
    [storeSetDateRange]
  );

  const setFilterProjectId = useCallback(
    (id: string | null) => {
      storeSetFilterProjectId(id);
    },
    [storeSetFilterProjectId]
  );

  const refetch = useCallback(() => {
    return analyticsQuery.refetch();
  }, [analyticsQuery]);

  const analytics = store.analytics;

  return {
    // Data
    analytics,
    aggregate: analytics?.aggregate ?? null,
    byProject: analytics?.by_project ?? [],
    byDate: analytics?.by_date ?? [],

    // Filters
    dateRange: store.dateRange,
    filterProjectId: store.filterProjectId,

    // State
    isLoading: store.isLoading,
    error: store.error,

    // Actions
    setDateRange,
    setFilterProjectId,
    refetch,
  };
}

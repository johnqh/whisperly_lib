import { useEffect, useCallback, useMemo } from 'react';
import { useAnalytics, WhisperlyClient } from '@sudobility/whisperly_client';
import type { AnalyticsResponse, UsageAggregate, UsageByProject, UsageByDate } from '@sudobility/whisperly_types';
import { useAnalyticsStore } from '../stores/analyticsStore';

/**
 * Configuration for useAnalyticsManager
 */
export interface UseAnalyticsManagerConfig {
  baseUrl: string;
  getIdToken: () => Promise<string | undefined>;
  entitySlug: string;
  startDate?: string;
  endDate?: string;
  projectId?: string;
  enabled?: boolean;
}

export interface UseAnalyticsManagerOptions {
  startDate?: string;
  endDate?: string;
  projectId?: string;
  enabled?: boolean;
}

export interface UseAnalyticsManagerResult {
  analytics: AnalyticsResponse | null;
  aggregate: UsageAggregate | null;
  byProject: UsageByProject[];
  byDate: UsageByDate[];
  dateRange: { startDate: string | null; endDate: string | null };
  filterProjectId: string | null;
  isLoading: boolean;
  error: string | null;
  setDateRange: (start: string | null, end: string | null) => void;
  setFilterProjectId: (id: string | null) => void;
  refetch: () => void;
}

export function useAnalyticsManager(config: UseAnalyticsManagerConfig): UseAnalyticsManagerResult {
  const {
    baseUrl,
    getIdToken,
    entitySlug,
    startDate,
    endDate,
    projectId,
    enabled = true,
  } = config;

  // Create client internally
  const client = useMemo(
    () => new WhisperlyClient({ baseUrl, getIdToken }),
    [baseUrl, getIdToken]
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
      setError(analyticsQuery.error.message);
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

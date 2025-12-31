import { useEffect, useCallback } from 'react';
import { useAnalytics, WhisperlyClient } from '@sudobility/whisperly_client';
import type { AnalyticsResponse, UsageAggregate, UsageByProject, UsageByDate } from '@sudobility/whisperly_types';
import { useAnalyticsStore } from '../stores/analyticsStore';

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

export function useAnalyticsManager(
  client: WhisperlyClient,
  options: UseAnalyticsManagerOptions = {}
): UseAnalyticsManagerResult {
  const { startDate, endDate, projectId, enabled = true } = options;
  const store = useAnalyticsStore();
  const analyticsQuery = useAnalytics(client, {
    startDate,
    endDate,
    projectId,
    enabled,
  });

  // Sync query data to store
  useEffect(() => {
    if (analyticsQuery.data) {
      store.setAnalytics(analyticsQuery.data);
    }
  }, [analyticsQuery.data]);

  useEffect(() => {
    store.setLoading(analyticsQuery.isLoading);
  }, [analyticsQuery.isLoading]);

  useEffect(() => {
    if (analyticsQuery.error) {
      store.setError(analyticsQuery.error.message);
    }
  }, [analyticsQuery.error]);

  // Sync options to store
  useEffect(() => {
    store.setDateRange(startDate ?? null, endDate ?? null);
  }, [startDate, endDate]);

  useEffect(() => {
    store.setFilterProjectId(projectId ?? null);
  }, [projectId]);

  const setDateRange = useCallback(
    (start: string | null, end: string | null) => {
      store.setDateRange(start, end);
    },
    [store]
  );

  const setFilterProjectId = useCallback(
    (id: string | null) => {
      store.setFilterProjectId(id);
    },
    [store]
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

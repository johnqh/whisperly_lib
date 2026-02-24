import { create } from 'zustand';
import type { AnalyticsResponse } from '@sudobility/whisperly_types';

interface AnalyticsState {
  analytics: AnalyticsResponse | null;
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  filterProjectId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAnalytics: (analytics: AnalyticsResponse | null) => void;
  setDateRange: (startDate: string | null, endDate: string | null) => void;
  setFilterProjectId: (projectId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  analytics: null,
  dateRange: {
    startDate: null,
    endDate: null,
  },
  filterProjectId: null,
  isLoading: false,
  error: null,
};

export const useAnalyticsStore = create<AnalyticsState>(set => ({
  ...initialState,

  setAnalytics: analytics => set({ analytics }),

  setDateRange: (startDate, endDate) =>
    set({ dateRange: { startDate, endDate } }),

  setFilterProjectId: projectId => set({ filterProjectId: projectId }),

  setLoading: isLoading => set({ isLoading }),

  setError: error => set({ error }),

  reset: () => set(initialState),
}));

// Selectors

/** Select the full analytics response, or `null` if not loaded */
export const selectAnalytics = (state: AnalyticsState) => state.analytics;

/** Select the aggregate usage statistics, or `null` if analytics not loaded */
export const selectAggregate = (state: AnalyticsState) =>
  state.analytics?.aggregate ?? null;

/** Select usage data broken down by project. Returns an empty array if not loaded. */
export const selectByProject = (state: AnalyticsState) =>
  state.analytics?.by_project ?? [];

/** Select usage data broken down by date. Returns an empty array if not loaded. */
export const selectByDate = (state: AnalyticsState) =>
  state.analytics?.by_date ?? [];

/** Select the current date range filter */
export const selectDateRange = (state: AnalyticsState) => state.dateRange;

/** Select the current project ID filter, or `null` for all projects */
export const selectFilterProjectId = (state: AnalyticsState) =>
  state.filterProjectId;

/** Select the loading state for the analytics store */
export const selectIsLoading = (state: AnalyticsState) => state.isLoading;

/** Select the error message from the analytics store, or `null` */
export const selectError = (state: AnalyticsState) => state.error;

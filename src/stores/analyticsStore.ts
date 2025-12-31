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
export const selectAnalytics = (state: AnalyticsState) => state.analytics;
export const selectAggregate = (state: AnalyticsState) =>
  state.analytics?.aggregate ?? null;
export const selectByProject = (state: AnalyticsState) =>
  state.analytics?.by_project ?? [];
export const selectByDate = (state: AnalyticsState) =>
  state.analytics?.by_date ?? [];
export const selectDateRange = (state: AnalyticsState) => state.dateRange;
export const selectFilterProjectId = (state: AnalyticsState) =>
  state.filterProjectId;
export const selectIsLoading = (state: AnalyticsState) => state.isLoading;
export const selectError = (state: AnalyticsState) => state.error;

import { describe, it, expect, beforeEach } from 'vitest';
import {
  useAnalyticsStore,
  selectAnalytics,
  selectAggregate,
  selectByProject,
  selectByDate,
  selectDateRange,
  selectFilterProjectId,
  selectIsLoading,
  selectError,
} from './analyticsStore';
import type { AnalyticsResponse } from '@sudobility/whisperly_types';

const mockAnalytics: AnalyticsResponse = {
  aggregate: {
    total_requests: 1000,
    total_strings: 50000,
    total_characters: 250000,
    successful_requests: 950,
    failed_requests: 50,
    success_rate: 0.95,
    period_start: '2024-01-01',
    period_end: '2024-01-31',
  },
  by_project: [
    {
      project_id: 'proj-1',
      project_name: 'project-1',
      request_count: 500,
      string_count: 25000,
      character_count: 125000,
      success_rate: 0.96,
    },
    {
      project_id: 'proj-2',
      project_name: 'project-2',
      request_count: 500,
      string_count: 25000,
      character_count: 125000,
      success_rate: 0.94,
    },
  ],
  by_date: [
    {
      date: '2024-01-15',
      request_count: 50,
      string_count: 2500,
      character_count: 12500,
    },
    {
      date: '2024-01-16',
      request_count: 60,
      string_count: 3000,
      character_count: 15000,
    },
  ],
};

describe('analyticsStore', () => {
  beforeEach(() => {
    useAnalyticsStore.getState().reset();
  });

  describe('initial state', () => {
    it('has null analytics', () => {
      expect(useAnalyticsStore.getState().analytics).toBeNull();
    });

    it('has null date range', () => {
      expect(useAnalyticsStore.getState().dateRange).toEqual({
        startDate: null,
        endDate: null,
      });
    });

    it('has null filter project id', () => {
      expect(useAnalyticsStore.getState().filterProjectId).toBeNull();
    });

    it('is not loading', () => {
      expect(useAnalyticsStore.getState().isLoading).toBe(false);
    });

    it('has no error', () => {
      expect(useAnalyticsStore.getState().error).toBeNull();
    });
  });

  describe('setAnalytics', () => {
    it('sets analytics data', () => {
      useAnalyticsStore.getState().setAnalytics(mockAnalytics);
      expect(useAnalyticsStore.getState().analytics).toEqual(mockAnalytics);
    });

    it('clears analytics when null', () => {
      useAnalyticsStore.getState().setAnalytics(mockAnalytics);
      useAnalyticsStore.getState().setAnalytics(null);
      expect(useAnalyticsStore.getState().analytics).toBeNull();
    });
  });

  describe('setDateRange', () => {
    it('sets date range', () => {
      useAnalyticsStore.getState().setDateRange('2024-01-01', '2024-01-31');
      expect(useAnalyticsStore.getState().dateRange).toEqual({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
    });

    it('allows null values', () => {
      useAnalyticsStore.getState().setDateRange('2024-01-01', null);
      expect(useAnalyticsStore.getState().dateRange).toEqual({
        startDate: '2024-01-01',
        endDate: null,
      });
    });
  });

  describe('setFilterProjectId', () => {
    it('sets filter project id', () => {
      useAnalyticsStore.getState().setFilterProjectId('proj-1');
      expect(useAnalyticsStore.getState().filterProjectId).toBe('proj-1');
    });

    it('clears filter when null', () => {
      useAnalyticsStore.getState().setFilterProjectId('proj-1');
      useAnalyticsStore.getState().setFilterProjectId(null);
      expect(useAnalyticsStore.getState().filterProjectId).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('sets loading state', () => {
      useAnalyticsStore.getState().setLoading(true);
      expect(useAnalyticsStore.getState().isLoading).toBe(true);
    });
  });

  describe('setError', () => {
    it('sets error message', () => {
      useAnalyticsStore.getState().setError('Analytics error');
      expect(useAnalyticsStore.getState().error).toBe('Analytics error');
    });
  });

  describe('reset', () => {
    it('resets to initial state', () => {
      useAnalyticsStore.getState().setAnalytics(mockAnalytics);
      useAnalyticsStore.getState().setDateRange('2024-01-01', '2024-01-31');
      useAnalyticsStore.getState().setFilterProjectId('proj-1');
      useAnalyticsStore.getState().setLoading(true);
      useAnalyticsStore.getState().setError('error');
      useAnalyticsStore.getState().reset();

      expect(useAnalyticsStore.getState().analytics).toBeNull();
      expect(useAnalyticsStore.getState().dateRange).toEqual({
        startDate: null,
        endDate: null,
      });
      expect(useAnalyticsStore.getState().filterProjectId).toBeNull();
      expect(useAnalyticsStore.getState().isLoading).toBe(false);
      expect(useAnalyticsStore.getState().error).toBeNull();
    });
  });

  describe('selectors', () => {
    it('selectAnalytics returns analytics', () => {
      useAnalyticsStore.getState().setAnalytics(mockAnalytics);
      const result = selectAnalytics(useAnalyticsStore.getState());
      expect(result).toEqual(mockAnalytics);
    });

    it('selectAggregate returns aggregate data', () => {
      useAnalyticsStore.getState().setAnalytics(mockAnalytics);
      const result = selectAggregate(useAnalyticsStore.getState());
      expect(result).toEqual(mockAnalytics.aggregate);
    });

    it('selectAggregate returns null when no analytics', () => {
      const result = selectAggregate(useAnalyticsStore.getState());
      expect(result).toBeNull();
    });

    it('selectByProject returns by_project data', () => {
      useAnalyticsStore.getState().setAnalytics(mockAnalytics);
      const result = selectByProject(useAnalyticsStore.getState());
      expect(result).toHaveLength(2);
    });

    it('selectByProject returns empty array when no analytics', () => {
      const result = selectByProject(useAnalyticsStore.getState());
      expect(result).toEqual([]);
    });

    it('selectByDate returns by_date data', () => {
      useAnalyticsStore.getState().setAnalytics(mockAnalytics);
      const result = selectByDate(useAnalyticsStore.getState());
      expect(result).toHaveLength(2);
    });

    it('selectByDate returns empty array when no analytics', () => {
      const result = selectByDate(useAnalyticsStore.getState());
      expect(result).toEqual([]);
    });

    it('selectDateRange returns date range', () => {
      useAnalyticsStore.getState().setDateRange('2024-01-01', '2024-01-31');
      const result = selectDateRange(useAnalyticsStore.getState());
      expect(result).toEqual({ startDate: '2024-01-01', endDate: '2024-01-31' });
    });

    it('selectFilterProjectId returns filter project id', () => {
      useAnalyticsStore.getState().setFilterProjectId('proj-1');
      const result = selectFilterProjectId(useAnalyticsStore.getState());
      expect(result).toBe('proj-1');
    });

    it('selectIsLoading returns loading state', () => {
      useAnalyticsStore.getState().setLoading(true);
      const result = selectIsLoading(useAnalyticsStore.getState());
      expect(result).toBe(true);
    });

    it('selectError returns error', () => {
      useAnalyticsStore.getState().setError('error');
      const result = selectError(useAnalyticsStore.getState());
      expect(result).toBe('error');
    });
  });
});

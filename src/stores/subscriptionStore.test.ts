import { describe, it, expect, beforeEach } from 'vitest';
import {
  useSubscriptionStore,
  selectSubscription,
  selectTier,
  selectMonthlyLimit,
  selectMonthlyUsed,
  selectMonthlyRemaining,
  selectHourlyLimit,
  selectHourlyUsed,
  selectHourlyRemaining,
  selectIsLoading,
  selectError,
} from './subscriptionStore';
import type { Subscription } from '@sudobility/whisperly_types';

const mockSubscription: Subscription = {
  id: 'sub-1',
  user_id: 'user-1',
  tier: 'pro',
  revenuecat_entitlement: 'pro_monthly',
  monthly_request_limit: 50000,
  hourly_request_limit: 2000,
  requests_this_month: 10000,
  requests_this_hour: 100,
  month_reset_at: new Date(),
  hour_reset_at: new Date(),
  created_at: new Date(),
  updated_at: new Date(),
};

describe('subscriptionStore', () => {
  beforeEach(() => {
    useSubscriptionStore.getState().reset();
  });

  describe('initial state', () => {
    it('has null subscription', () => {
      expect(useSubscriptionStore.getState().subscription).toBeNull();
    });

    it('is not loading', () => {
      expect(useSubscriptionStore.getState().isLoading).toBe(false);
    });

    it('has no error', () => {
      expect(useSubscriptionStore.getState().error).toBeNull();
    });
  });

  describe('setSubscription', () => {
    it('sets subscription', () => {
      useSubscriptionStore.getState().setSubscription(mockSubscription);
      expect(useSubscriptionStore.getState().subscription).toEqual(mockSubscription);
    });

    it('clears subscription when null', () => {
      useSubscriptionStore.getState().setSubscription(mockSubscription);
      useSubscriptionStore.getState().setSubscription(null);
      expect(useSubscriptionStore.getState().subscription).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('sets loading state', () => {
      useSubscriptionStore.getState().setLoading(true);
      expect(useSubscriptionStore.getState().isLoading).toBe(true);
    });
  });

  describe('setError', () => {
    it('sets error message', () => {
      useSubscriptionStore.getState().setError('Subscription error');
      expect(useSubscriptionStore.getState().error).toBe('Subscription error');
    });
  });

  describe('reset', () => {
    it('resets to initial state', () => {
      useSubscriptionStore.getState().setSubscription(mockSubscription);
      useSubscriptionStore.getState().setLoading(true);
      useSubscriptionStore.getState().setError('error');
      useSubscriptionStore.getState().reset();

      expect(useSubscriptionStore.getState().subscription).toBeNull();
      expect(useSubscriptionStore.getState().isLoading).toBe(false);
      expect(useSubscriptionStore.getState().error).toBeNull();
    });
  });

  describe('selectors', () => {
    it('selectSubscription returns subscription', () => {
      useSubscriptionStore.getState().setSubscription(mockSubscription);
      const result = selectSubscription(useSubscriptionStore.getState());
      expect(result).toEqual(mockSubscription);
    });

    it('selectTier returns tier', () => {
      useSubscriptionStore.getState().setSubscription(mockSubscription);
      const result = selectTier(useSubscriptionStore.getState());
      expect(result).toBe('pro');
    });

    it('selectTier returns null when no subscription', () => {
      const result = selectTier(useSubscriptionStore.getState());
      expect(result).toBeNull();
    });

    it('selectMonthlyLimit returns monthly limit', () => {
      useSubscriptionStore.getState().setSubscription(mockSubscription);
      const result = selectMonthlyLimit(useSubscriptionStore.getState());
      expect(result).toBe(50000);
    });

    it('selectMonthlyLimit returns 0 when no subscription', () => {
      const result = selectMonthlyLimit(useSubscriptionStore.getState());
      expect(result).toBe(0);
    });

    it('selectMonthlyUsed returns requests this month', () => {
      useSubscriptionStore.getState().setSubscription(mockSubscription);
      const result = selectMonthlyUsed(useSubscriptionStore.getState());
      expect(result).toBe(10000);
    });

    it('selectMonthlyRemaining calculates remaining requests', () => {
      useSubscriptionStore.getState().setSubscription(mockSubscription);
      const result = selectMonthlyRemaining(useSubscriptionStore.getState());
      expect(result).toBe(40000); // 50000 - 10000
    });

    it('selectMonthlyRemaining returns 0 when no subscription', () => {
      const result = selectMonthlyRemaining(useSubscriptionStore.getState());
      expect(result).toBe(0);
    });

    it('selectMonthlyRemaining returns 0 when over limit', () => {
      const overLimitSub = { ...mockSubscription, requests_this_month: 60000 };
      useSubscriptionStore.getState().setSubscription(overLimitSub);
      const result = selectMonthlyRemaining(useSubscriptionStore.getState());
      expect(result).toBe(0);
    });

    it('selectHourlyLimit returns hourly limit', () => {
      useSubscriptionStore.getState().setSubscription(mockSubscription);
      const result = selectHourlyLimit(useSubscriptionStore.getState());
      expect(result).toBe(2000);
    });

    it('selectHourlyUsed returns requests this hour', () => {
      useSubscriptionStore.getState().setSubscription(mockSubscription);
      const result = selectHourlyUsed(useSubscriptionStore.getState());
      expect(result).toBe(100);
    });

    it('selectHourlyRemaining calculates remaining hourly requests', () => {
      useSubscriptionStore.getState().setSubscription(mockSubscription);
      const result = selectHourlyRemaining(useSubscriptionStore.getState());
      expect(result).toBe(1900); // 2000 - 100
    });

    it('selectHourlyRemaining returns 0 when no subscription', () => {
      const result = selectHourlyRemaining(useSubscriptionStore.getState());
      expect(result).toBe(0);
    });

    it('selectIsLoading returns loading state', () => {
      useSubscriptionStore.getState().setLoading(true);
      const result = selectIsLoading(useSubscriptionStore.getState());
      expect(result).toBe(true);
    });

    it('selectError returns error', () => {
      useSubscriptionStore.getState().setError('error');
      const result = selectError(useSubscriptionStore.getState());
      expect(result).toBe('error');
    });
  });
});

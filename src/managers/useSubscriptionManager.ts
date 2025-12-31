import { useEffect, useCallback } from 'react';
import {
  useSubscription,
  useSyncSubscription,
  WhisperlyClient,
} from '@sudobility/whisperly_client';
import type { Subscription, SubscriptionTier } from '@sudobility/whisperly_types';
import { useSubscriptionStore } from '../stores/subscriptionStore';

export interface UseSubscriptionManagerResult {
  subscription: Subscription | null;
  tier: SubscriptionTier | null;
  monthlyLimit: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  hourlyLimit: number;
  hourlyUsed: number;
  hourlyRemaining: number;
  isLoading: boolean;
  error: string | null;
  syncWithRevenueCat: () => Promise<Subscription>;
  refetch: () => void;
  isSyncing: boolean;
}

export function useSubscriptionManager(client: WhisperlyClient): UseSubscriptionManagerResult {
  const store = useSubscriptionStore();
  const subscriptionQuery = useSubscription(client);
  const syncMutation = useSyncSubscription(client);

  // Sync query data to store
  useEffect(() => {
    if (subscriptionQuery.data) {
      store.setSubscription(subscriptionQuery.data);
    }
  }, [subscriptionQuery.data]);

  useEffect(() => {
    store.setLoading(subscriptionQuery.isLoading);
  }, [subscriptionQuery.isLoading]);

  useEffect(() => {
    if (subscriptionQuery.error) {
      store.setError(subscriptionQuery.error.message);
    }
  }, [subscriptionQuery.error]);

  const syncWithRevenueCat = useCallback(async () => {
    const result = await syncMutation.mutateAsync();
    store.setSubscription(result);
    return result;
  }, [syncMutation, store]);

  const refetch = useCallback(() => {
    return subscriptionQuery.refetch();
  }, [subscriptionQuery]);

  const subscription = store.subscription;

  return {
    // Data
    subscription,
    tier: subscription?.tier ?? null,
    monthlyLimit: subscription?.monthly_request_limit ?? 0,
    monthlyUsed: subscription?.requests_this_month ?? 0,
    monthlyRemaining: subscription
      ? Math.max(
          0,
          subscription.monthly_request_limit - subscription.requests_this_month
        )
      : 0,
    hourlyLimit: subscription?.hourly_request_limit ?? 0,
    hourlyUsed: subscription?.requests_this_hour ?? 0,
    hourlyRemaining: subscription
      ? Math.max(
          0,
          subscription.hourly_request_limit - subscription.requests_this_hour
        )
      : 0,

    // State
    isLoading: store.isLoading || syncMutation.isPending,
    error: store.error,

    // Actions
    syncWithRevenueCat,
    refetch,

    // Mutation states
    isSyncing: syncMutation.isPending,
  };
}

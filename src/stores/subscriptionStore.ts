import { create } from 'zustand';
import type { Subscription, SubscriptionTier } from '@sudobility/whisperly_types';

interface SubscriptionState {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSubscription: (subscription: Subscription | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  subscription: null,
  isLoading: false,
  error: null,
};

export const useSubscriptionStore = create<SubscriptionState>(set => ({
  ...initialState,

  setSubscription: subscription => set({ subscription }),

  setLoading: isLoading => set({ isLoading }),

  setError: error => set({ error }),

  reset: () => set(initialState),
}));

// Selectors
export const selectSubscription = (state: SubscriptionState) =>
  state.subscription;
export const selectTier = (state: SubscriptionState): SubscriptionTier | null =>
  state.subscription?.tier ?? null;
export const selectMonthlyLimit = (state: SubscriptionState) =>
  state.subscription?.monthly_request_limit ?? 0;
export const selectMonthlyUsed = (state: SubscriptionState) =>
  state.subscription?.requests_this_month ?? 0;
export const selectMonthlyRemaining = (state: SubscriptionState) => {
  const sub = state.subscription;
  if (!sub) return 0;
  return Math.max(0, sub.monthly_request_limit - sub.requests_this_month);
};
export const selectHourlyLimit = (state: SubscriptionState) =>
  state.subscription?.hourly_request_limit ?? 0;
export const selectHourlyUsed = (state: SubscriptionState) =>
  state.subscription?.requests_this_hour ?? 0;
export const selectHourlyRemaining = (state: SubscriptionState) => {
  const sub = state.subscription;
  if (!sub) return 0;
  return Math.max(0, sub.hourly_request_limit - sub.requests_this_hour);
};
export const selectIsLoading = (state: SubscriptionState) => state.isLoading;
export const selectError = (state: SubscriptionState) => state.error;

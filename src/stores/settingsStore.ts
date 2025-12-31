import { create } from 'zustand';
import type { UserSettings } from '@sudobility/whisperly_types';

interface SettingsState {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSettings: (settings: UserSettings | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  settings: null,
  isLoading: false,
  error: null,
};

export const useSettingsStore = create<SettingsState>(set => ({
  ...initialState,

  setSettings: settings => set({ settings }),

  setLoading: isLoading => set({ isLoading }),

  setError: error => set({ error }),

  reset: () => set(initialState),
}));

// Selectors
export const selectSettings = (state: SettingsState) => state.settings;
export const selectOrganizationName = (state: SettingsState) =>
  state.settings?.organization_name ?? null;
export const selectOrganizationPath = (state: SettingsState) =>
  state.settings?.organization_path ?? null;
export const selectIsLoading = (state: SettingsState) => state.isLoading;
export const selectError = (state: SettingsState) => state.error;

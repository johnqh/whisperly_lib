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

/** Select the full user settings object, or `null` if not loaded */
export const selectSettings = (state: SettingsState) => state.settings;

/** Select the organization display name, or `null` if settings not loaded */
export const selectOrganizationName = (state: SettingsState) =>
  state.settings?.organization_name ?? null;

/** Select the organization URL-safe path/slug, or `null` if settings not loaded */
export const selectOrganizationPath = (state: SettingsState) =>
  state.settings?.organization_path ?? null;

/** Select the loading state for the settings store */
export const selectIsLoading = (state: SettingsState) => state.isLoading;

/** Select the error message from the settings store, or `null` */
export const selectError = (state: SettingsState) => state.error;

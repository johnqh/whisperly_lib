import { describe, it, expect, beforeEach } from 'vitest';
import {
  useSettingsStore,
  selectSettings,
  selectOrganizationName,
  selectOrganizationPath,
  selectIsLoading,
  selectError,
} from './settingsStore';
import type { UserSettings } from '@sudobility/whisperly_types';

const mockSettings: UserSettings = {
  id: 'settings-1',
  user_id: 'user-1',
  organization_name: 'Test Organization',
  organization_path: 'test-org',
  is_default: false,
  created_at: new Date(),
  updated_at: new Date(),
};

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.getState().reset();
  });

  describe('initial state', () => {
    it('has null settings', () => {
      expect(useSettingsStore.getState().settings).toBeNull();
    });

    it('is not loading', () => {
      expect(useSettingsStore.getState().isLoading).toBe(false);
    });

    it('has no error', () => {
      expect(useSettingsStore.getState().error).toBeNull();
    });
  });

  describe('setSettings', () => {
    it('sets settings', () => {
      useSettingsStore.getState().setSettings(mockSettings);
      expect(useSettingsStore.getState().settings).toEqual(mockSettings);
    });

    it('clears settings when null', () => {
      useSettingsStore.getState().setSettings(mockSettings);
      useSettingsStore.getState().setSettings(null);
      expect(useSettingsStore.getState().settings).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('sets loading state', () => {
      useSettingsStore.getState().setLoading(true);
      expect(useSettingsStore.getState().isLoading).toBe(true);
    });
  });

  describe('setError', () => {
    it('sets error message', () => {
      useSettingsStore.getState().setError('Settings update failed');
      expect(useSettingsStore.getState().error).toBe('Settings update failed');
    });

    it('clears error when null', () => {
      useSettingsStore.getState().setError('error');
      useSettingsStore.getState().setError(null);
      expect(useSettingsStore.getState().error).toBeNull();
    });
  });

  describe('reset', () => {
    it('resets to initial state', () => {
      useSettingsStore.getState().setSettings(mockSettings);
      useSettingsStore.getState().setLoading(true);
      useSettingsStore.getState().setError('error');
      useSettingsStore.getState().reset();

      expect(useSettingsStore.getState().settings).toBeNull();
      expect(useSettingsStore.getState().isLoading).toBe(false);
      expect(useSettingsStore.getState().error).toBeNull();
    });
  });

  describe('selectors', () => {
    it('selectSettings returns settings', () => {
      useSettingsStore.getState().setSettings(mockSettings);
      const result = selectSettings(useSettingsStore.getState());
      expect(result).toEqual(mockSettings);
    });

    it('selectOrganizationName returns organization name', () => {
      useSettingsStore.getState().setSettings(mockSettings);
      const result = selectOrganizationName(useSettingsStore.getState());
      expect(result).toBe('Test Organization');
    });

    it('selectOrganizationName returns null when no settings', () => {
      const result = selectOrganizationName(useSettingsStore.getState());
      expect(result).toBeNull();
    });

    it('selectOrganizationPath returns organization path', () => {
      useSettingsStore.getState().setSettings(mockSettings);
      const result = selectOrganizationPath(useSettingsStore.getState());
      expect(result).toBe('test-org');
    });

    it('selectOrganizationPath returns null when no settings', () => {
      const result = selectOrganizationPath(useSettingsStore.getState());
      expect(result).toBeNull();
    });

    it('selectIsLoading returns loading state', () => {
      useSettingsStore.getState().setLoading(true);
      const result = selectIsLoading(useSettingsStore.getState());
      expect(result).toBe(true);
    });

    it('selectError returns error', () => {
      useSettingsStore.getState().setError('error');
      const result = selectError(useSettingsStore.getState());
      expect(result).toBe('error');
    });
  });
});

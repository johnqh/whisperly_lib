// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFirebaseAuth } from './useFirebaseAuth';

// Type for the callback that onAuthStateChanged uses
type AuthCallback = (user: unknown) => void;

// Store the callback so tests can trigger auth state changes
let authStateCallback: AuthCallback | null = null;
const mockUnsubscribe = vi.fn();

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth: unknown, callback: AuthCallback) => {
    authStateCallback = callback;
    return mockUnsubscribe;
  }),
}));

const mockAuth = {} as Parameters<typeof useFirebaseAuth>[0];

const mockUser = {
  uid: 'user-123',
  email: 'test@example.com',
  getIdToken: vi.fn().mockResolvedValue('mock-token-abc'),
};

describe('useFirebaseAuth', () => {
  beforeEach(() => {
    authStateCallback = null;
    mockUnsubscribe.mockClear();
    mockUser.getIdToken.mockClear();
  });

  it('starts with loading=true and user=null', () => {
    const { result } = renderHook(() => useFirebaseAuth(mockAuth));

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('sets user and stops loading when auth state changes to signed in', async () => {
    const { result } = renderHook(() => useFirebaseAuth(mockAuth));

    act(() => {
      authStateCallback?.(mockUser);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBe(mockUser);
  });

  it('sets user to null when auth state changes to signed out', async () => {
    const { result } = renderHook(() => useFirebaseAuth(mockAuth));

    // Sign in first
    act(() => {
      authStateCallback?.(mockUser);
    });

    await waitFor(() => {
      expect(result.current.user).toBe(mockUser);
    });

    // Sign out
    act(() => {
      authStateCallback?.(null);
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });

    expect(result.current.loading).toBe(false);
  });

  it('getIdToken returns token when user is signed in', async () => {
    const { result } = renderHook(() => useFirebaseAuth(mockAuth));

    act(() => {
      authStateCallback?.(mockUser);
    });

    await waitFor(() => {
      expect(result.current.user).toBe(mockUser);
    });

    const token = await result.current.getIdToken();
    expect(token).toBe('mock-token-abc');
    expect(mockUser.getIdToken).toHaveBeenCalled();
  });

  it('getIdToken returns undefined when no user is signed in', async () => {
    const { result } = renderHook(() => useFirebaseAuth(mockAuth));

    act(() => {
      authStateCallback?.(null);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const token = await result.current.getIdToken();
    expect(token).toBeUndefined();
  });

  it('unsubscribes from auth state on unmount', () => {
    const { unmount } = renderHook(() => useFirebaseAuth(mockAuth));
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});

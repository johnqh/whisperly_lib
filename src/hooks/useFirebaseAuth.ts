import { useState, useEffect, useCallback } from 'react';
import type { Auth, User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * Return type of the {@link useFirebaseAuth} hook.
 */
export interface UseFirebaseAuthResult {
  /** The currently authenticated Firebase user, or `null` if signed out */
  user: User | null;
  /** `true` during the initial auth state check. Becomes `false` once Firebase resolves the user. */
  loading: boolean;
  /**
   * Retrieve the current user's Firebase ID token.
   * Returns `undefined` if no user is signed in.
   * The token is auto-refreshed by Firebase if expired.
   */
  getIdToken: () => Promise<string | undefined>;
}

/**
 * Hook that subscribes to Firebase auth state changes.
 *
 * Listens to `onAuthStateChanged` and provides the current user,
 * loading state, and a token retrieval function. Automatically
 * cleans up the listener on unmount.
 *
 * @param auth - Firebase Auth instance
 * @returns Auth state with user, loading flag, and token getter
 *
 * @example
 * ```ts
 * const { user, loading, getIdToken } = useFirebaseAuth(auth);
 * if (loading) return <Spinner />;
 * if (!user) return <LoginScreen />;
 * ```
 */
export function useFirebaseAuth(auth: Auth): UseFirebaseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const getIdToken = useCallback(async () => {
    if (!user) return undefined;
    return user.getIdToken();
  }, [user]);

  return {
    user,
    loading,
    getIdToken,
  };
}

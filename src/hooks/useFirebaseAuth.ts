import { useState, useEffect, useCallback } from 'react';
import type { Auth, User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

export interface UseFirebaseAuthResult {
  user: User | null;
  loading: boolean;
  getIdToken: () => Promise<string | undefined>;
}

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

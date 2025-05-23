import { auth } from '@/firebaseConfig';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

export function useAuthentication() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
} 
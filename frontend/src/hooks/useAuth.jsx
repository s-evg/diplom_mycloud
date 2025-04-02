import { useState, useEffect } from 'react';
import { getCurrentUser } from '../api/auth';

export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return { user, setUser };
}
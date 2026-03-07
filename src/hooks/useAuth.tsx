import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { fetchSchoolProfile } from '../services/firestore';

interface AuthContextType {
  user: User | null;
  schoolName: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, schoolName: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user?.email) {
        try {
          const profile = await fetchSchoolProfile(user.email);
          if (profile) {
            setSchoolName(profile.schoolName);
          } else {
            // Fallback: Use email prefix if no profile exists
            const prefix = user.email.split('@')[0];
            const formatted = prefix.charAt(0).toUpperCase() + prefix.slice(1);
            setSchoolName(formatted);
          }
        } catch (error) {
          console.error('Error fetching school profile:', error);
        }
      } else {
        setSchoolName(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, schoolName, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

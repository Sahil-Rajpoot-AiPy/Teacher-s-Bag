import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { fetchUserProfile } from '../services/firestore';
import { UserDoc } from '../types';
import { resolveUserRole } from '../utils/roles';

interface AuthContextType {
  user: User | null;
  schoolName: string | null;
  profile: UserDoc | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, schoolName: null, profile: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserDoc | null>(null);
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
          const userProfile = await fetchUserProfile(user.uid, user.email);
          const resolvedRole = resolveUserRole(userProfile);
          setProfile(
            userProfile
              ? { ...userProfile, role: resolvedRole }
              : {
                  id: user.uid,
                  uid: user.uid,
                  name: user.displayName || user.email || '',
                  email: user.email || '',
                  role: resolvedRole,
                }
          );

          if (userProfile) {
            setSchoolName(userProfile.name || userProfile.email);
          } else {
            // Fallback: Use email prefix if no profile exists
            const prefix = user.email.split('@')[0];
            const formatted = prefix.charAt(0).toUpperCase() + prefix.slice(1);
            setSchoolName(formatted);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          const fallbackName = user.displayName || user.email || '';
          const fallbackRole = resolveUserRole(null);
          setProfile({
            id: user.uid,
            uid: user.uid,
            name: fallbackName,
            email: user.email || '',
            role: fallbackRole,
          });
          setSchoolName(fallbackName || null);
        }
      } else {
        setSchoolName(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, schoolName, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

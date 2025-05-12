// src/providers/AuthProvider.tsx
"use client";
import type { ReactNode } from 'react';
import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import type { AuthContextUser, UserProfile } from '@/lib/types';

export interface AuthContextType {
  user: AuthContextUser | null;
  loading: boolean;
  userRole: 'user' | 'admin' | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthContextUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'user' | 'admin' | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userProfileData = userDocSnap.data() as UserProfile;
          setUser({ ...firebaseUser, role: userProfileData.role, userProfile: userProfileData });
          setUserRole(userProfileData.role);
        } else {
          // Handle case where user exists in auth but not in Firestore (should ideally not happen after signup)
          setUser({ ...firebaseUser, role: 'user', userProfile: null }); // Default to 'user' if profile not found
          setUserRole('user');
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, userRole }}>
      {children}
    </AuthContext.Provider>
  );
};

'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createUserAction, loginAction } from '@/app/actions';
import { type UserCredentials, type NewUser } from '@/types';

const CURRENT_USER_STORAGE_KEY = 'exclusivity-app-current-user';

interface AuthContextType {
  user: UserCredentials | null;
  loading: boolean;
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  createUser: (data: NewUser) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserCredentials | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for a logged-in user session from previous visits
    if (typeof window !== 'undefined') {
      const loggedInUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (loggedInUser) {
        try {
            setUser(JSON.parse(loggedInUser));
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
            localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        }
      }
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password?: string): Promise<boolean> => {
    const response = await loginAction({ username, password });

    if (response.success && response.user) {
      setUser(response.user);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(response.user));
      return true;
    }
    
    // Make sure to throw the error from the server action if it exists
    if (response.error) {
        throw new Error(response.error);
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    router.push('/login');
  };

  const createUser = async (data: NewUser) => {
    const response = await createUserAction(data);
    if (!response.success) {
      throw new Error(response.error || 'Falha ao criar usuário.');
    }
  };
  
  const value = { user, loading, login, logout, createUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

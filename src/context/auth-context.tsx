'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createUserAction } from '@/app/actions';
import { type UserCredentials, type NewUser } from '@/types';
import { useToast } from '@/hooks/use-toast';

const USERS_STORAGE_KEY = 'exclusivity-app-users';
const CURRENT_USER_STORAGE_KEY = 'exclusivity-app-current-user';

interface AuthContextType {
  user: UserCredentials | null;
  loading: boolean;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  createUser: (data: NewUser) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserCredentials | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Initialize users in localStorage if not present
    if (typeof window !== 'undefined') {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (!storedUsers) {
        // Bootstrap with a default admin user
        const defaultUsers: UserCredentials[] = [{ username: 'admin', password: 'admin' }];
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
      }

      // Check for a logged-in user session
      const loggedInUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (loggedInUser) {
        setUser(JSON.parse(loggedInUser));
      }
      setLoading(false);
    }
  }, []);

  const login = (username: string, password?: string): boolean => {
    const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const foundUser = storedUsers.find(
      (u: UserCredentials) => u.username === username && u.password === password
    );

    if (foundUser) {
      const currentUser = { username: foundUser.username };
      setUser(currentUser);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    router.push('/login');
  };

  const createUser = async (data: NewUser) => {
    // 1. Validate admin password on the server
    const response = await createUserAction({ adminPassword: data.adminPassword });
    if (!response.success) {
      throw new Error(response.error || 'Falha ao validar credenciais de administrador.');
    }

    // 2. Add user to localStorage on the client
    const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const userExists = storedUsers.some((u: UserCredentials) => u.username === data.username);
    if (userExists) {
      throw new Error('Este nome de usuário já existe.');
    }

    const newUser: UserCredentials = { username: data.username, password: data.password };
    const updatedUsers = [...storedUsers, newUser];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
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

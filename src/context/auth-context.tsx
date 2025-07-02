'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { type UserCredentials } from '@/types';
import { auth } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  type User
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: UserCredentials) => Promise<void>;
  logout: () => void;
  createUser: (credentials: UserCredentials) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials: UserCredentials) => {
    if (!credentials.email || !credentials.password) {
        throw new Error("Email e senha são obrigatórios.");
    }
    try {
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error("E-mail ou senha inválidos.");
      }
      console.error("Firebase login error:", error);
      throw new Error("Ocorreu um erro durante o login.");
    }
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const createUser = async (credentials: UserCredentials) => {
    if (!credentials.email || !credentials.password) {
        throw new Error("Email e senha são obrigatórios.");
    }
    try {
      await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error("Este endereço de e-mail já está em uso.");
      }
       if (error.code === 'auth/weak-password') {
        throw new Error("A senha é muito fraca. Use pelo menos 6 caracteres.");
      }
      console.error("Firebase signup error:", error);
      throw new Error('Falha ao criar usuário.');
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

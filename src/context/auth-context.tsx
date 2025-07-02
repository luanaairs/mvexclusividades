'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { type UserCredentials } from '@/types';
import { auth, firebaseError } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  type User
} from 'firebase/auth';
import { AlertCircle } from 'lucide-react';

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

  // If Firebase fails to initialize, show a clear error message.
  if (firebaseError) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted p-4">
        <div className="w-full max-w-md rounded-lg border border-destructive bg-card p-6 text-center shadow-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-xl font-bold text-destructive">Erro de Configuração do Firebase</h1>
          <p className="mt-2 text-muted-foreground">{firebaseError}</p>
        </div>
      </div>
    );
  }

  // Ensure auth is not null before proceeding
  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    };
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials: UserCredentials) => {
    if (!auth) throw new Error("Firebase não inicializado.");
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
    if (!auth) throw new Error("Firebase não inicializado.");
    await signOut(auth);
    router.push('/login');
  };

  const createUser = async (credentials: UserCredentials) => {
    if (!auth) throw new Error("Firebase não inicializado.");
    if (!credentials.email || !credentials.password) {
        throw new Error("Email e senha são obrigatórios.");
    }

    const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY;
    if (!adminKey) {
        throw new Error("A chave de administrador do aplicativo não está configurada.");
    }

    if (credentials.adminKey !== adminKey) {
        throw new Error("Chave de administrador inválida.");
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

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api/client';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: number;
  email: string;
  username: string;
  realName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const savedToken = await SecureStore.getItemAsync('token');

      if (savedToken) {
        setToken(savedToken);

        try {
          const data = await api('/auth/me');
          setUser(data);
        } catch {
          await SecureStore.deleteItemAsync('token');
          setToken(null);
        }
      }

      setLoading(false);
    }

    load();
  }, []);

  async function login(newToken: string, newUser: User) {
    await SecureStore.setItemAsync('token', newToken);
    setToken(newToken);
    setUser(newUser);
  }

  async function logout() {
    await SecureStore.deleteItemAsync('token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

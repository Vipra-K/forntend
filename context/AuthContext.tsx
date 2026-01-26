'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          // Verify token and fetch fresh user data
          const res = await api.post('/auth/me');
          setUser(res.data);
          setToken(savedToken);
        } catch (err) {
          // If token is invalid or user deleted, clear everything
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // 401 Interceptor: Automatically logout if session expires
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.post('/auth/login', { email, password: pass });
    const { user, accessToken } = res.data;
    setUser(user);
    setToken(accessToken);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    router.push('/dashboard');
  };

  const register = async (email: string, pass: string) => {
    const res = await api.post('/auth/register', { email, password: pass });
    const { user, accessToken } = res.data;
    setUser(user);
    setToken(accessToken);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

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
  forgotPassword: (email: string) => Promise<{ message: string; debugToken?: string }>;
  resetPassword: (token: string, newPass: string) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
  updateProfile: (email?: string) => Promise<void>;
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

  const forgotPassword = async (email: string) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  };

  const resetPassword = async (token: string, newPass: string) => {
    await api.post('/auth/reset-password', { token, newPassword: newPass });
    router.push('/login');
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    await api.patch('/auth/change-password', { oldPassword: oldPass, newPassword: newPass });
  };

  const updateProfile = async (email?: string) => {
    const res = await api.patch('/auth/me', { email });
    const updatedUser = res.data;
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout, 
      forgotPassword, 
      resetPassword, 
      changePassword, 
      updateProfile, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

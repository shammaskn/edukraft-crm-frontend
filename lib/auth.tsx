'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import api from './axios';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on page load
useEffect(() => {
  const savedToken = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  if (savedToken && savedUser) {
    // Verify token is still valid
    api.get('/auth/me')
      .then(() => {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      })
      .catch(() => {
        // Token expired or invalid → clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; max-age=0';
        window.location.href = '/login';
      })
      .finally(() => setIsLoading(false));
  } else {
    setIsLoading(false);
  }
}, []);
const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  const { token, user } = response.data.data;

  // Save to localStorage
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));

  // Save to cookie
  document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

  setToken(token);
  setUser(user);
};

 const logout = () => {
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  // Clear cookie properly
  document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';

  // Clear state
  setToken(null);
  setUser(null);

  // Force full page reload to login
  window.location.replace('/login');
};

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth anywhere
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
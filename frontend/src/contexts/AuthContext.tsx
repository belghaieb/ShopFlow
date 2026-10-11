'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';
import { User, AuthResponse } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  role: 'CUSTOMER' | 'SELLER';
  nomBoutique?: string;
  descriptionBoutique?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = Cookies.get('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const saveAuth = (data: AuthResponse) => {
    Cookies.set('access_token', data.accessToken, { expires: 1 / 96 });
    Cookies.set('refresh_token', data.refreshToken, { expires: 7 });
    const u: User = {
      userId: data.userId, email: data.email,
      prenom: data.prenom, nom: data.nom, role: data.role,
    };
    Cookies.set('user', JSON.stringify(u), { expires: 7 });
    setUser(u);
    return u;
  };

  const login = async (email: string, motDePasse: string) => {
    const { data } = await authApi.login({ email, motDePasse });
    const u = saveAuth(data);
    // Redirect seller/admin to dashboard, customers to home
    if (u.role === 'SELLER' || u.role === 'ADMIN') {
      window.location.href = '/seller/dashboard';
    } else {
      window.location.href = '/';
    }
  };

  const register = async (registerData: RegisterData) => {
    const { data } = await authApi.register(registerData);
    const u = saveAuth(data);
    if (u.role === 'SELLER' || u.role === 'ADMIN') {
      window.location.href = '/seller/dashboard';
    } else {
      window.location.href = '/';
    }
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (name: string, email: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentUser = async () => {
    try {
      const currentUser = await authApi.getMe();
      setUser(currentUser);
    } catch {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('projecthub_token');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await authApi.login({ email, password: pass });
    if (typeof window !== 'undefined' && data.access_token) {
      localStorage.setItem('projecthub_token', data.access_token);
    }
    setUser(data.user);
    return data.user;
  };

  const register = async (name: string, email: string, pass: string) => {
    const data = await authApi.register({ name, email, password: pass });
    if (typeof window !== 'undefined' && data.access_token) {
      localStorage.setItem('projecthub_token', data.access_token);
    }
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('projecthub_token');
    }
    setUser(null);
    router.push('/');
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

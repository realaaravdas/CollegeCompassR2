'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  username: string;
  photoURL?: string; // Keep for avatar consistency
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: { username: string; password?: string }) => Promise<void>;
  register: (credentials: { username: string; password?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/status');
        if (res.ok) {
          const { user: loggedInUser } = await res.json();
          setUser(loggedInUser);
          if (pathname === '/') {
            router.replace('/dashboard');
          }
        } else {
          setUser(null);
          if (pathname.startsWith('/dashboard')) {
            router.replace('/');
          }
        }
      } catch (e) {
        setUser(null);
        if (pathname.startsWith('/dashboard')) {
            router.replace('/');
        }
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, [pathname, router]);

  const login = useCallback(async (credentials: { username: string; password?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      setUser(data.user);
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const register = useCallback(async (credentials: { username: string; password?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      setUser(data.user);
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
        console.error("Logout failed", e);
    } finally {
        setUser(null);
        router.push('/');
    }
  }, [router]);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading && !user && pathname.startsWith('/dashboard') ? (
        <div className="flex h-screen items-center justify-center">Loading...</div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

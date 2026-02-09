'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  EmpCode: string;
  EmpName: string;
  RoleName: string;
  LocationId: number;
  LocationName: string;
  loggedIn: boolean;
  loginTime: string;
  expiresAt: string;
  sessionId: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token: string, rememberMe: boolean) => void;
  logout: () => void;
  getUserInitials: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from storage
    const localStorageUser = localStorage.getItem('vinworld_user');
    const sessionStorageUser = sessionStorage.getItem('vinworld_user');

    const userData = localStorageUser ? JSON.parse(localStorageUser) : sessionStorageUser ? JSON.parse(sessionStorageUser) : null;
    const storedToken = localStorage.getItem('vinworld_token');

    if (userData && userData.loggedIn) {
      // Check expiry
      if (userData.expiresAt) {
        const expiry = new Date(userData.expiresAt);
        if (new Date() <= expiry) {
          setUser(userData);
          setToken(storedToken);
        } else {
          handleLogout();
        }
      } else {
        setUser(userData);
        setToken(storedToken);
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: User, authToken: string, rememberMe: boolean) => {
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 8);

    const authData: User = {
      ...userData,
      loggedIn: true,
      loginTime: new Date().toISOString(),
      expiresAt: expiryTime.toISOString(),
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    if (rememberMe) {
      localStorage.setItem('vinworld_user', JSON.stringify(authData));
      localStorage.setItem('vinworld_token', authToken);
      sessionStorage.setItem('vinworld_user', JSON.stringify(authData));
    } else {
      sessionStorage.setItem('vinworld_user', JSON.stringify(authData));
      localStorage.removeItem('vinworld_user');
      localStorage.removeItem('vinworld_token');
    }

    setUser(authData);
    setToken(authToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('vinworld_user');
    localStorage.removeItem('vinworld_token');
    localStorage.removeItem('vinworld_remembered_username');
    sessionStorage.removeItem('vinworld_user');
    setUser(null);
    setToken(null);
  };

  const getUserInitials = (): string => {
    if (!user?.EmpName) return 'U';
    return user.EmpName.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login: handleLogin,
        logout: handleLogout,
        getUserInitials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

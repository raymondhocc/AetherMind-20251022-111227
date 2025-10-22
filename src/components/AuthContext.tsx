import React, { useState, useEffect, useCallback } from 'react';
import * as auth from '@/lib/auth';
import { AuthContext, AuthContextType, User } from '@/lib/auth-context';
export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const checkUser = () => {
      const currentUser = auth.getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };
    checkUser();
  }, []);
  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    const result = await auth.login(username, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    setIsLoading(false);
    return { success: result.success, error: result.error };
  }, []);
  const signup = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    const result = await auth.signup(username, password);
    setIsLoading(false);
    return result;
  }, []);
  const logout = useCallback(() => {
    auth.logout();
    setUser(null);
  }, []);
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
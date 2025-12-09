import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserContextType } from '../types';

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'cLockin_user_data';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const updateUser = (data: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) {
        // Initial creation defaults
        return {
          name: '',
          targetRoles: [],
          startDate: '',
          ...data
        };
      }
      return { ...prev, ...data };
    });
  };

  const clearUser = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, updateUser, clearUser, isAuthenticated: !!user }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
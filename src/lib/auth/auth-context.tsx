'use client';

// ==============================================================================
// nia mobility - Clean Authentication & Role Context
// Developed by Denory Codespace
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Profile, DriverProfile, PartnerProfile, UserRole } from '@/types';
import { marketplaceStore } from '../db/store';

interface AuthContextType {
  currentUser: User | null;
  currentProfile: Profile | null;
  driverProfile: DriverProfile | null;
  partnerProfile: PartnerProfile | null;
  role: UserRole | 'GUEST';
  setRole: (role: UserRole | 'GUEST') => void;
  registerUser: (params: {
    fullName: string;
    phone: string;
    email: string;
    role: UserRole;
    county?: string;
    subcounty?: string;
    experienceYears?: number;
    companyName?: string;
  }) => Promise<{ user: User; profile: Profile; supabaseSynced?: boolean }>;
  loginUser: (identifier: string) => Promise<{ success: boolean; error?: string }>;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole | 'GUEST'>('GUEST');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(null);

  // Restore authenticated session
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const restoreSession = () => {
      const savedUserId = localStorage.getItem('nia_current_user_id');
      if (savedUserId) {
        const found = marketplaceStore.users.find(u => u.id === savedUserId);
        if (found) {
          setCurrentUser(found);
          setRole(found.role);
          setCurrentProfile(marketplaceStore.profiles.find(p => p.userId === found.id) || null);
          if (found.role === 'DRIVER') {
            setDriverProfile(marketplaceStore.drivers.find(d => d.userId === found.id) || null);
            setPartnerProfile(null);
          } else if (found.role === 'PARTNER') {
            setPartnerProfile(marketplaceStore.partners.find(p => p.userId === found.id) || null);
            setDriverProfile(null);
          }
        } else if (marketplaceStore.users.length === 0) {
          // Database was cleared
          setCurrentUser(null);
          setCurrentProfile(null);
          setDriverProfile(null);
          setPartnerProfile(null);
          setRole('GUEST');
          localStorage.removeItem('nia_current_user_id');
        }
      }
    };

    restoreSession();
    const unsubscribe = marketplaceStore.subscribe(restoreSession);
    return unsubscribe;
  }, []);

  const registerUser = async (params: {
    fullName: string;
    phone: string;
    email: string;
    role: UserRole;
    county?: string;
    subcounty?: string;
    experienceYears?: number;
    companyName?: string;
  }) => {
    const res = await marketplaceStore.registerUser(params);
    const { user, profile } = res;

    setCurrentUser(user);
    setCurrentProfile(profile);
    setRole(user.role);

    if (user.role === 'DRIVER') {
      setDriverProfile(marketplaceStore.drivers.find(d => d.userId === user.id) || null);
      setPartnerProfile(null);
    } else if (user.role === 'PARTNER') {
      setPartnerProfile(marketplaceStore.partners.find(p => p.userId === user.id) || null);
      setDriverProfile(null);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('nia_current_user_id', user.id);
    }

    return res;
  };

  const loginUser = async (identifier: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await marketplaceStore.loginUser(identifier);
      if (!res) {
        return {
          success: false,
          error: 'No account found with this email or phone number. Please register first.',
        };
      }

      setCurrentUser(res.user);
      setCurrentProfile(res.profile);
      setRole(res.user.role);

      if (res.user.role === 'DRIVER') {
        setDriverProfile(res.driverProfile || null);
        setPartnerProfile(null);
      } else if (res.user.role === 'PARTNER') {
        setPartnerProfile(res.partnerProfile || null);
        setDriverProfile(null);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('nia_current_user_id', res.user.id);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const loginAsRole = (targetRole: UserRole) => {
    const existing = marketplaceStore.users.find(u => u.role === targetRole);
    if (existing) {
      setCurrentUser(existing);
      setCurrentProfile(marketplaceStore.profiles.find(p => p.userId === existing.id) || null);
      setRole(existing.role);
      if (existing.role === 'DRIVER') {
        setDriverProfile(marketplaceStore.drivers.find(d => d.userId === existing.id) || null);
        setPartnerProfile(null);
      } else if (existing.role === 'PARTNER') {
        setPartnerProfile(marketplaceStore.partners.find(p => p.userId === existing.id) || null);
        setDriverProfile(null);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('nia_current_user_id', existing.id);
      }
    } else {
      setRole(targetRole);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentProfile(null);
    setDriverProfile(null);
    setPartnerProfile(null);
    setRole('GUEST');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nia_current_user_id');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentProfile,
        driverProfile,
        partnerProfile,
        role,
        setRole,
        registerUser,
        loginUser,
        loginAsRole,
        logout,
        isAuthenticated: role !== 'GUEST' && currentUser !== null,
      }}
    >
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

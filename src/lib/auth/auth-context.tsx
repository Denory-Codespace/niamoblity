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
  registerUser: (params: any) => void;
  loginAs: (role: UserRole) => void;
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

  useEffect(() => {
    // Check if user exists in store
    if (marketplaceStore.users.length > 0 && !currentUser) {
      const firstUser = marketplaceStore.users[0];
      const firstProfile = marketplaceStore.profiles[0] || null;
      setCurrentUser(firstUser);
      setCurrentProfile(firstProfile);
      setRole(firstUser.role);

      if (firstUser.role === 'DRIVER') {
        setDriverProfile(marketplaceStore.drivers.find(d => d.userId === firstUser.id) || null);
      } else if (firstUser.role === 'PARTNER') {
        setPartnerProfile(marketplaceStore.partners.find(p => p.userId === firstUser.id) || null);
      }
    }
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
    const { user, profile } = await marketplaceStore.registerUser(params);
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
  };

  const loginAs = (targetRole: UserRole) => {
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
        loginAs,
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

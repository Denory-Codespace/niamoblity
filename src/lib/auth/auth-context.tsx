'use client';

// ==============================================================================
// nia mobility - Authentication & Role Context
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
  switchPersona: (persona: 'DRIVER' | 'PARTNER' | 'ADMIN' | 'GUEST') => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Default to Driver persona for instant interactive marketplace testing
  const [selectedRole, setSelectedRole] = useState<UserRole | 'GUEST'>('DRIVER');
  const [currentUser, setCurrentUser] = useState<User | null>(marketplaceStore.users[3]); // Samuel Mwangi (Driver)
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(marketplaceStore.profiles[3]);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(marketplaceStore.drivers[0]);
  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(null);

  const switchPersona = (persona: 'DRIVER' | 'PARTNER' | 'ADMIN' | 'GUEST') => {
    setSelectedRole(persona);
    if (persona === 'DRIVER') {
      const user = marketplaceStore.users.find(u => u.id === 'usr-driver-01') || null;
      setCurrentUser(user);
      setCurrentProfile(marketplaceStore.profiles.find(p => p.userId === user?.id) || null);
      setDriverProfile(marketplaceStore.drivers.find(d => d.userId === user?.id) || null);
      setPartnerProfile(null);
    } else if (persona === 'PARTNER') {
      const user = marketplaceStore.users.find(u => u.id === 'usr-partner-01') || null;
      setCurrentUser(user);
      setCurrentProfile(marketplaceStore.profiles.find(p => p.userId === user?.id) || null);
      setPartnerProfile(marketplaceStore.partners.find(p => p.userId === user?.id) || null);
      setDriverProfile(null);
    } else if (persona === 'ADMIN') {
      const user = marketplaceStore.users.find(u => u.id === 'usr-admin-01') || null;
      setCurrentUser(user);
      setCurrentProfile(marketplaceStore.profiles.find(p => p.userId === user?.id) || null);
      setDriverProfile(null);
      setPartnerProfile(null);
    } else {
      setCurrentUser(null);
      setCurrentProfile(null);
      setDriverProfile(null);
      setPartnerProfile(null);
    }
  };

  const logout = () => {
    switchPersona('GUEST');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentProfile,
        driverProfile,
        partnerProfile,
        role: selectedRole,
        setRole: setSelectedRole,
        switchPersona,
        isAuthenticated: selectedRole !== 'GUEST' && currentUser !== null,
        logout,
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

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  Car,
  Search,
  UserCheck,
  FileCheck2,
  Bell,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  PlusCircle,
  Menu,
  X,
  LogIn,
  UserPlus,
  LogOut,
} from 'lucide-react';
import { marketplaceStore } from '@/lib/db/store';
import { UserRole } from '@/types';

export default function Navbar() {
  const pathname = usePathname();
  const { role, currentProfile, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultRole, setAuthDefaultRole] = useState<UserRole>('DRIVER');

  const openRegister = (targetRole: UserRole) => {
    setAuthDefaultRole(targetRole);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        {/* Top Minimal Brand Bar */}
        <div className="bg-[#102A43] text-white text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-200">Built by <strong className="text-white font-bold tracking-wide">Denory Codespace</strong></span>
            <span className="hidden sm:inline text-slate-400">| Nairobi, Kenya</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <span className="hidden md:inline">KDPA 2019 Compliant</span>
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
              >
                <LogOut className="w-3 h-3" /> Sign Out
              </button>
            ) : null}
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-[#102A43] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                  <Car className="w-6 h-6 text-[#FFF1B8]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-[#102A43] font-heading leading-tight">
                    nia<span className="text-blue-600 font-medium ml-0.5">mobility</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600 -mt-1">
                    Kenyan Marketplace
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <nav className="hidden lg:flex items-center gap-1 pl-4">
                <Link
                  href="/vehicles"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    pathname.startsWith('/vehicles')
                      ? 'bg-[#DCEEFF] text-[#102A43]'
                      : 'text-slate-600 hover:text-[#102A43] hover:bg-slate-100'
                  }`}
                >
                  Find a Vehicle
                </Link>
                <Link
                  href="/how-it-works"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    pathname === '/how-it-works'
                      ? 'bg-[#DCEEFF] text-[#102A43]'
                      : 'text-slate-600 hover:text-[#102A43] hover:bg-slate-100'
                  }`}
                >
                  How It Works
                </Link>

                {role === 'DRIVER' && (
                  <>
                    <Link
                      href="/driver/matches"
                      className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        pathname === '/driver/matches'
                          ? 'bg-[#DCEEFF] text-[#102A43]'
                          : 'text-slate-600 hover:text-[#102A43] hover:bg-slate-100'
                      }`}
                    >
                      My Matches ✨
                    </Link>
                    <Link
                      href="/driver/applications"
                      className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        pathname === '/driver/applications'
                          ? 'bg-[#DCEEFF] text-[#102A43]'
                          : 'text-slate-600 hover:text-[#102A43] hover:bg-slate-100'
                      }`}
                    >
                      Applications
                    </Link>
                    <Link
                      href="/driver/agreements"
                      className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        pathname === '/driver/agreements'
                          ? 'bg-[#DCEEFF] text-[#102A43]'
                          : 'text-slate-600 hover:text-[#102A43] hover:bg-slate-100'
                      }`}
                    >
                      Agreements
                    </Link>
                  </>
                )}

                {role === 'PARTNER' && (
                  <>
                    <Link
                      href="/partner/dashboard"
                      className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        pathname === '/partner/dashboard'
                          ? 'bg-[#FFF1B8] text-[#92400E]'
                          : 'text-slate-600 hover:text-[#102A43] hover:bg-slate-100'
                      }`}
                    >
                      Partner Hub
                    </Link>
                    <Link
                      href="/partner/applications"
                      className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        pathname === '/partner/applications'
                          ? 'bg-[#FFF1B8] text-[#92400E]'
                          : 'text-slate-600 hover:text-[#102A43] hover:bg-slate-100'
                      }`}
                    >
                      Applicants
                    </Link>
                  </>
                )}

                {role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      pathname.startsWith('/admin')
                        ? 'bg-[#DDF5E3] text-[#065F46]'
                        : 'text-slate-600 hover:text-[#102A43] hover:bg-slate-100'
                    }`}
                  >
                    Admin Control Panel 🛡️
                  </Link>
                )}
              </nav>
            </div>

            {/* Right Action Area */}
            <div className="hidden lg:flex items-center gap-3">
              {!isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => openRegister('DRIVER')}
                    leftIcon={<UserPlus className="w-4 h-4 text-blue-600" />}
                  >
                    Register as Driver
                  </Button>
                  <Button
                    variant="soft-yellow"
                    size="md"
                    className="font-bold"
                    onClick={() => openRegister('PARTNER')}
                    leftIcon={<Car className="w-4 h-4 text-[#92400E]" />}
                  >
                    List a Vehicle
                  </Button>
                </div>
              ) : role === 'PARTNER' ? (
                <Link href="/partner/listings/new">
                  <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4 text-[#FFF1B8]" />}>
                    Post Vehicle Opportunity
                  </Button>
                </Link>
              ) : role === 'DRIVER' ? (
                <Link href="/vehicles">
                  <Button variant="primary" size="md" leftIcon={<Search className="w-4 h-4 text-[#DCEEFF]" />}>
                    Find Vehicles
                  </Button>
                </Link>
              ) : null}

              {/* Profile Avatar */}
              {isAuthenticated && currentProfile && (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-9 h-9 rounded-full bg-[#102A43] text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-100">
                    {currentProfile.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-[#102A43] truncate max-w-[110px]">
                      {currentProfile.fullName.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {role}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2">
            <Link
              href="/vehicles"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-slate-800 hover:bg-slate-100"
            >
              <Search className="w-5 h-5 text-blue-600" />
              Find a Vehicle
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-slate-800 hover:bg-slate-100"
            >
              <Sparkles className="w-5 h-5 text-amber-500" />
              How It Works
            </Link>

            {!isAuthenticated ? (
              <div className="pt-2 space-y-2 border-t border-slate-100">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => openRegister('DRIVER')}
                >
                  Register as Driver
                </Button>
                <Button
                  variant="soft-yellow"
                  size="md"
                  className="w-full font-bold"
                  onClick={() => openRegister('PARTNER')}
                >
                  List My Vehicle
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultRole={authDefaultRole}
      />
    </>
  );
}

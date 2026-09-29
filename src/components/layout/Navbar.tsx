'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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
} from 'lucide-react';
import { marketplaceStore } from '@/lib/db/store';

export default function Navbar() {
  const pathname = usePathname();
  const { role, switchPersona, currentProfile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);

  const unreadNotifs = marketplaceStore.notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Top Interactive Switcher Bar for Pair-Programming & Evaluation */}
      <div className="bg-[#102A43] text-white text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-200">Built by <strong className="text-white font-bold tracking-wide">Denory Codespace</strong></span>
          <span className="hidden sm:inline text-slate-400">| Nairobi, Kenya</span>
        </div>

        {/* Persona Switcher */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-slate-300 text-[11px] hidden md:inline">Test Role Persona:</span>
          <button
            onClick={() => switchPersona('DRIVER')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              role === 'DRIVER' ? 'bg-[#DCEEFF] text-[#102A43] shadow' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Driver
          </button>
          <button
            onClick={() => switchPersona('PARTNER')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              role === 'PARTNER' ? 'bg-[#FFF1B8] text-[#92400E] shadow' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Partner
          </button>
          <button
            onClick={() => switchPersona('ADMIN')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              role === 'ADMIN' ? 'bg-[#DDF5E3] text-[#065F46] shadow' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => switchPersona('GUEST')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              role === 'GUEST' ? 'bg-white/20 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Guest
          </button>
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
                    href="/partner/listings"
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      pathname === '/partner/listings'
                        ? 'bg-[#FFF1B8] text-[#92400E]'
                        : 'text-slate-600 hover:text-[#102A43] hover:bg-slate-100'
                    }`}
                  >
                    My Listings
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
            {role === 'PARTNER' ? (
              <Link href="/partner/listings/new">
                <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4 text-[#FFF1B8]" />}>
                  Post Vehicle Opportunity
                </Button>
              </Link>
            ) : role === 'DRIVER' ? (
              <Link href="/vehicles">
                <Button variant="primary" size="md" leftIcon={<Search className="w-4 h-4 text-[#DCEEFF]" />}>
                  Explore Nairobi Vehicles
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/vehicles">
                  <Button variant="outline" size="md">
                    Browse Cars
                  </Button>
                </Link>
                <Link href="/partner/listings/new">
                  <Button variant="primary" size="md">
                    List My Vehicle
                  </Button>
                </Link>
              </div>
            )}

            {/* Profile Avatar / Status */}
            {currentProfile && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-9 h-9 rounded-full bg-[#102A43] text-white flex items-center justify-center font-bold text-xs overflow-hidden ring-2 ring-blue-100">
                  {currentProfile.avatarUrl ? (
                    <img src={currentProfile.avatarUrl} alt={currentProfile.fullName} className="w-full h-full object-cover" />
                  ) : (
                    currentProfile.fullName.slice(0, 2).toUpperCase()
                  )}
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

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-2">
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
          {role === 'DRIVER' && (
            <>
              <Link
                href="/driver/matches"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-slate-800 hover:bg-slate-100"
              >
                <Sparkles className="w-5 h-5 text-blue-500" />
                My Algorithmic Matches
              </Link>
              <Link
                href="/driver/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-slate-800 hover:bg-slate-100"
              >
                <UserCheck className="w-5 h-5 text-emerald-600" />
                My Applications
              </Link>
              <Link
                href="/driver/agreements"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-slate-800 hover:bg-slate-100"
              >
                <FileCheck2 className="w-5 h-5 text-slate-600" />
                Agreements
              </Link>
            </>
          )}
          {role === 'PARTNER' && (
            <>
              <Link
                href="/partner/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-slate-800 hover:bg-slate-100"
              >
                <Car className="w-5 h-5 text-amber-600" />
                Fleet Dashboard
              </Link>
              <Link
                href="/partner/listings/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-slate-800 hover:bg-slate-100"
              >
                <PlusCircle className="w-5 h-5 text-blue-600" />
                Post Vehicle Opportunity
              </Link>
            </>
          )}
          {role === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-emerald-800 bg-emerald-50"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Admin Portal
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

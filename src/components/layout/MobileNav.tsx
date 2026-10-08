'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import {
  Search,
  Sparkles,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Car,
  Users,
  FileCheck2,
  PlusCircle,
  Compass,
  LogIn,
} from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();
  const { role, isAuthenticated } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 md:hidden px-1.5 py-1 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      {/* 1. DRIVER BOTTOM NAVIGATION */}
      {role === 'DRIVER' && (
        <>
          <Link
            href="/vehicles"
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
              pathname.startsWith('/vehicles') ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Search className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Vehicles</span>
          </Link>

          <Link
            href="/driver/matches"
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
              pathname === '/driver/matches' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-0.5 text-amber-500" />
            <span className="text-[10px]">Matches</span>
          </Link>

          <Link
            href="/driver/applications"
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
              pathname === '/driver/applications' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Applied</span>
          </Link>

          <Link
            href="/driver/agreements"
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
              pathname === '/driver/agreements' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Agreements</span>
          </Link>

          <Link
            href="/how-it-works"
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
              pathname === '/how-it-works' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Compass className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Guide</span>
          </Link>
        </>
      )}

      {/* 2. PARTNER BOTTOM NAVIGATION */}
      {role === 'PARTNER' && (
        <>
          <Link
            href="/partner/dashboard"
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
              pathname === '/partner/dashboard' ? 'text-amber-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Fleet Hub</span>
          </Link>

          <Link
            href="/partner/vehicles"
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
              pathname === '/partner/vehicles' ? 'text-amber-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Car className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Vehicles</span>
          </Link>

          <Link
            href="/partner/applications"
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
              pathname === '/partner/applications' ? 'text-amber-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Applicants</span>
          </Link>

          <Link
            href="/partner/agreements"
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
              pathname === '/partner/agreements' ? 'text-amber-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Agreements</span>
          </Link>

          <Link
            href="/partner/listings/new"
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
              pathname === '/partner/listings/new' ? 'text-amber-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-5 h-5 mb-0.5 text-amber-600" />
            <span className="text-[10px]">Post Car</span>
          </Link>
        </>
      )}

      {/* 3. GUEST / ADMIN / ALL OTHER ROLES */}
      {role !== 'DRIVER' && role !== 'PARTNER' && (
        <>
          <Link
            href="/vehicles"
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors ${
              pathname.startsWith('/vehicles') ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Search className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Vehicles</span>
          </Link>

          <Link
            href="/how-it-works"
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors ${
              pathname === '/how-it-works' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Compass className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">How It Works</span>
          </Link>

          {role === 'ADMIN' ? (
            <Link
              href="/admin"
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors ${
                pathname.startsWith('/admin') ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Admin</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors ${
                pathname === '/login' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Sign In</span>
            </Link>
          )}
        </>
      )}
    </nav>
  );
}

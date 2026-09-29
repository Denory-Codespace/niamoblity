'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Search, Sparkles, FileText, LayoutDashboard, ShieldCheck } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();
  const { role } = useAuth();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 md:hidden px-2 py-1.5 flex items-center justify-around shadow-lg">
      <Link
        href="/vehicles"
        className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
          pathname.startsWith('/vehicles') ? 'text-blue-600 font-bold' : 'text-slate-500'
        }`}
      >
        <Search className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Vehicles</span>
      </Link>

      {role === 'DRIVER' && (
        <>
          <Link
            href="/driver/matches"
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
              pathname === '/driver/matches' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Matches</span>
          </Link>
          <Link
            href="/driver/applications"
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
              pathname === '/driver/applications' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Applications</span>
          </Link>
        </>
      )}

      {role === 'PARTNER' && (
        <>
          <Link
            href="/partner/dashboard"
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
              pathname.startsWith('/partner') ? 'text-amber-700 font-bold' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Partner Hub</span>
          </Link>
        </>
      )}

      {role === 'ADMIN' && (
        <Link
          href="/admin"
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
            pathname.startsWith('/admin') ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <ShieldCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Admin</span>
        </Link>
      )}

      <Link
        href="/how-it-works"
        className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
          pathname === '/how-it-works' ? 'text-blue-600 font-bold' : 'text-slate-500'
        }`}
      >
        <Sparkles className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Guide</span>
      </Link>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Home, Search, Car } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-soft text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto ring-8 ring-blue-50/50">
          <Car className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider block">
            404 Error
          </span>
          <h2 className="text-2xl font-black text-[#102A43]">Page Not Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            The page or vehicle opportunity you are looking for does not exist or has been relocated.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
              Back to Home
            </Button>
          </Link>
          <Link href="/vehicles">
            <Button variant="outline" size="md" leftIcon={<Search className="w-4 h-4" />}>
              Explore Vehicles
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

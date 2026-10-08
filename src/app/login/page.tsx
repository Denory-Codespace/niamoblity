'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Car, LogIn, Users, AlertCircle, ArrowLeft } from 'lucide-react';
import { UserRole } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, isAuthenticated, role } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Please enter your email or Kenyan phone number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await loginUser(identifier);
    setIsSubmitting(false);

    if (res.success) {
      router.push('/vehicles');
    } else {
      setErrorMessage(res.error || 'Account not found. Please register.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#102A43] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
        </Link>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#102A43] flex items-center justify-center text-white mx-auto shadow-md">
              <Car className="w-6 h-6 text-[#FFF1B8]" />
            </div>
            <h1 className="text-2xl font-black text-[#102A43] font-heading">
              Sign In to nia mobility
            </h1>
            <p className="text-xs text-slate-500">
              Access your driver opportunities or partner fleet hub.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address or Kenyan Phone
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. driver@example.com or 0712345678"
                className="w-full text-xs p-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43]"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              isLoading={isSubmitting}
              leftIcon={<LogIn className="w-4 h-4 text-[#FFF1B8]" />}
            >
              Sign In
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-bold text-blue-600 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

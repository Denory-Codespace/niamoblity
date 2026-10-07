'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/auth/auth-context';
import { NAIROBI_SUBCOUNTIES } from '@/lib/utils';
import { Users, Car, ShieldCheck, CheckCircle2, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { UserRole } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
  initialMode?: 'LOGIN' | 'REGISTER';
}

export function AuthModal({
  isOpen,
  onClose,
  defaultRole = 'DRIVER',
  initialMode = 'REGISTER',
}: AuthModalProps) {
  const { registerUser, loginUser, loginAsRole } = useAuth();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);
  const [role, setRole] = useState<UserRole>(defaultRole);

  // Form states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subcounty, setSubcounty] = useState('Westlands');
  const [experienceYears, setExperienceYears] = useState(3);
  const [companyName, setCompanyName] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your email or Kenyan phone number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await loginUser(loginIdentifier);
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Account not found. Please create an account.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await registerUser({
        fullName,
        phone,
        email,
        role,
        county: 'Nairobi',
        subcounty,
        experienceYears: Number(experienceYears),
        companyName: role === 'PARTNER' ? companyName : undefined,
      });

      setIsSubmitting(false);
      if (res.supabaseSynced === false) {
        setSuccessNotice('Account created! (Saved locally — run prisma/rls_fix.sql in Supabase to sync live)');
        setTimeout(() => onClose(), 1200);
      } else {
        onClose();
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Registration failed. Please check your details.');
    }
  };

  const handleQuickDemo = (demoRole: UserRole) => {
    loginAsRole(demoRole);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'LOGIN' ? 'Sign In to nia mobility' : 'Join nia mobility Kenya'}
      description={
        mode === 'LOGIN'
          ? 'Access your driver matches or partner fleet hub.'
          : 'Create your verified account to start driving or listing vehicles.'
      }
    >
      <div className="space-y-4">
        {/* Mode Switcher Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => { setMode('REGISTER'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'REGISTER'
                ? 'bg-white text-[#102A43] shadow-sm'
                : 'text-slate-600 hover:text-[#102A43]'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => { setMode('LOGIN'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'LOGIN'
                ? 'bg-white text-[#102A43] shadow-sm'
                : 'text-slate-600 hover:text-[#102A43]'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="leading-snug">{errorMessage}</p>
          </div>
        )}

        {successNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-snug">{successNotice}</p>
          </div>
        )}

        {mode === 'LOGIN' ? (
          /* Sign In Form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address or Kenyan Phone
              </label>
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="e.g. driver@example.com or 0712345678"
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43] transition-all"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Enter either the email or phone number you registered with.
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center py-3"
              isLoading={isSubmitting}
              leftIcon={<LogIn className="w-4 h-4 text-[#FFF1B8]" />}
            >
              Sign In
            </Button>

            {/* Quick Demo Login Assistance */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block mb-2 text-center">
                Instant One-Click Demo Mode
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDemo('DRIVER')}
                  className="text-xs justify-center"
                  leftIcon={<Users className="w-3.5 h-3.5 text-blue-600" />}
                >
                  Demo Driver
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDemo('PARTNER')}
                  className="text-xs justify-center"
                  leftIcon={<Car className="w-3.5 h-3.5 text-amber-700" />}
                >
                  Demo Partner
                </Button>
              </div>
            </div>
          </form>
        ) : (
          /* Registration Form */
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Role Selector */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRole('DRIVER')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  role === 'DRIVER'
                    ? 'bg-[#DCEEFF] border-blue-400 text-[#102A43] ring-2 ring-blue-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users className="w-5 h-5 mb-1 text-blue-700" />
                <div>
                  <span className="font-bold text-xs block">I am a Driver</span>
                  <span className="text-[10px] text-slate-500">Looking for a vehicle</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('PARTNER')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  role === 'PARTNER'
                    ? 'bg-[#FFF1B8] border-amber-400 text-[#92400E] ring-2 ring-amber-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Car className="w-5 h-5 mb-1 text-amber-800" />
                <div>
                  <span className="font-bold text-xs block">I am a Partner</span>
                  <span className="text-[10px] text-slate-500">I own/manage vehicles</span>
                </div>
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Samuel Mwangi or Beatrice Nduta"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kenyan Phone (M-PESA)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0712 345 678"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="driver@example.com"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Operating Subcounty</label>
                  <select
                    value={subcounty}
                    onChange={(e) => setSubcounty(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  >
                    {NAIROBI_SUBCOUNTIES.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                {role === 'DRIVER' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Driving Experience</label>
                    <select
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                    >
                      <option value={1}>1 Year Experience</option>
                      <option value={2}>2 Years Experience</option>
                      <option value={3}>3 - 5 Years Experience</option>
                      <option value={5}>5+ Years Experience</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Business / Fleet Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Apex Fleet Kenya"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                leftIcon={<CheckCircle2 className="w-4 h-4 text-[#FFF1B8]" />}
              >
                Create {role === 'DRIVER' ? 'Driver' : 'Partner'} Account
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

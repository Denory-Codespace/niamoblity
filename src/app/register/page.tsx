'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { NAIROBI_SUBCOUNTIES } from '@/lib/utils';
import { otpService } from '@/lib/auth/otp-service';
import { Car, Users, CheckCircle2, AlertCircle, ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck, RefreshCw } from 'lucide-react';
import { UserRole } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser } = useAuth();
  const [role, setRole] = useState<UserRole>('DRIVER');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [subcounty, setSubcounty] = useState('Westlands');
  const [experienceYears, setExperienceYears] = useState(3);
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // OTP Verification state
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [otpCode, setOtpCode] = useState('');
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);
  const [otpCountdown, setOtpCountdown] = useState(60);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (!phone || phone.length < 9) {
      setErrorMessage('Please provide a valid Kenyan phone number (e.g. 0712345678).');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await otpService.sendSignupOtp({ email, phone, fullName });
      setPreviewOtp(res.previewCode);
      setStep('OTP');
      setOtpCountdown(60);
      setIsSubmitting(false);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage('Could not send verification code. Please check your credentials.');
    }
  };

  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    const verification = otpService.verifySignupOtp(email, otpCode);
    if (!verification.valid) {
      setErrorMessage(verification.message || 'Invalid verification code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await registerUser({
        fullName,
        phone,
        email,
        password,
        role,
        county: 'Nairobi',
        subcounty,
        experienceYears: Number(experienceYears),
        companyName: role === 'PARTNER' ? companyName : undefined,
      });

      setIsSubmitting(false);
      if (role === 'PARTNER') {
        router.push('/partner/dashboard');
      } else {
        router.push('/vehicles');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    if (otpCountdown > 0) return;
    try {
      const res = await otpService.sendSignupOtp({ email, phone, fullName });
      setPreviewOtp(res.previewCode);
      setOtpCountdown(60);
    } catch (e) {
      setErrorMessage('Failed to resend code.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-lg space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#102A43] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
        </Link>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#102A43] flex items-center justify-center text-white mx-auto shadow-md">
              <Car className="w-6 h-6 text-[#FFF1B8]" />
            </div>
            <h1 className="text-2xl font-black text-[#102A43] font-heading">
              Create your nia mobility Account
            </h1>
            <p className="text-xs text-slate-500">
              Join Kenya&apos;s trusted driver & vehicle partner network.
            </p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('DRIVER')}
              className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
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
              className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                role === 'PARTNER'
                  ? 'bg-[#FFF1B8] border-amber-400 text-[#92400E] ring-2 ring-amber-300'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Car className="w-5 h-5 mb-1 text-amber-800" />
              <div>
                <span className="font-bold text-xs block">I am a Vehicle Partner</span>
                <span className="text-[10px] text-slate-500">I own/manage vehicles</span>
              </div>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          )}

          {step === 'OTP' ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span>Verification Code Dispatched 🇰🇪</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  We sent a 6-digit one-time PIN to <strong>{email}</strong> and SMS notification to <strong>{phone}</strong>.
                </p>
                {previewOtp && (
                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Demo Code: <strong className="font-mono text-emerald-700 font-bold">{previewOtp}</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtpCode(previewOtp)}
                      className="text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-md transition-colors"
                    >
                      Quick Auto-Fill
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter 6-Digit Verification PIN
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 583920"
                    autoFocus
                    className="w-full text-center tracking-[0.4em] text-lg font-black font-mono p-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block text-center">
                    Check your spam folder or console if email delivery is delayed.
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center"
                  isLoading={isSubmitting}
                  leftIcon={<ShieldCheck className="w-4 h-4 text-[#FFF1B8]" />}
                >
                  Verify &amp; Activate Account
                </Button>

                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('DETAILS')}
                    className="text-slate-500 hover:text-slate-700 text-xs font-semibold"
                  >
                    &larr; Edit Details
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpCountdown > 0}
                    className="text-blue-600 hover:text-blue-800 font-bold disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Samuel Mwangi or Beatrice Nduta"
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43]"
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
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43]"
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
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Operating Subcounty</label>
                <select
                  value={subcounty}
                  onChange={(e) => setSubcounty(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300"
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
                    className="w-full text-xs p-3 rounded-xl border border-slate-300"
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
                    className="w-full text-xs p-3 rounded-xl border border-slate-300"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (minimum 6 characters)"
                  className="w-full text-xs p-3 pr-10 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Used to securely log in across devices.</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-4 h-4 text-[#FFF1B8]" />}
            >
              Continue to Verification &rarr;
            </Button>
          </form>
          )}

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-blue-600 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

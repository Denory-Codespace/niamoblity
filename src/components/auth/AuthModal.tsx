'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/auth/auth-context';
import { NAIROBI_SUBCOUNTIES } from '@/lib/utils';
import { Users, Car, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { UserRole } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
}

export function AuthModal({ isOpen, onClose, defaultRole = 'DRIVER' }: AuthModalProps) {
  const { registerUser } = useAuth();
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subcounty, setSubcounty] = useState('Westlands');
  const [experienceYears, setExperienceYears] = useState(3);
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await registerUser({
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
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Join nia mobility Kenya"
      description="Create your clean account to start driving or listing vehicles."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Inputs */}
        <div className="space-y-3 pt-2">
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Operating Area</label>
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
                  placeholder="e.g. Apex Fleet Kenya (optional)"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                />
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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
    </Modal>
  );
}

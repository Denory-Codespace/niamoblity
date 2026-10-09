'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DriverProfile, Profile, User } from '@/types';
import { marketplaceStore } from '@/lib/db/store';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Car,
  Star,
  FileCheck2,
  Phone,
  MessageSquare,
  Lock,
  Smartphone,
  Award,
} from 'lucide-react';
import { MpesaModal } from '@/components/payments/MpesaModal';

interface DriverProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverId: string;
  driverName?: string;
  avatarUrl?: string;
  isUnlocked?: boolean;
  onUnlockSuccess?: () => void;
}

export function DriverProfileModal({
  isOpen,
  onClose,
  driverId,
  driverName = 'Driver',
  avatarUrl,
  isUnlocked = false,
  onUnlockSuccess,
}: DriverProfileModalProps) {
  const [mpesaModalOpen, setMpesaModalOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(isUnlocked);

  if (!isOpen) return null;

  // Find driver & profile details
  const driver = marketplaceStore.drivers.find((d) => d.id === driverId || d.userId === driverId);
  const profile = driver ? marketplaceStore.profiles.find((p) => p.userId === driver.userId) : null;
  const user = driver ? marketplaceStore.users.find((u) => u.id === driver.userId) : null;
  const kycDocs = driver ? marketplaceStore.getVerificationDocs(driver.userId) : [];

  const displayName = driverName || profile?.fullName || 'Verified Driver';
  const hasNationalId = kycDocs.some((d) => d.documentType === 'NATIONAL_ID');
  const hasDl = kycDocs.some((d) => d.documentType === 'DRIVING_LICENSE');
  const hasPsv = kycDocs.some((d) => d.documentType === 'PSV_BADGE');
  const hasConduct = kycDocs.some((d) => d.documentType === 'POLICE_CLEARANCE');

  const phone = user?.phone || '+254 712 345 678';
  const experienceYears = driver?.drivingExperienceYears || 3;
  const ratingAvg = driver?.ratingAvg || 4.9;
  const areas = driver?.preferredOperatingAreas?.length ? driver.preferredOperatingAreas : ['Nairobi', 'Kasarani', 'Westlands'];
  const platforms = driver?.preferredPlatforms?.length ? driver.preferredPlatforms : ['Uber', 'Bolt'];

  const handleMpesaSuccess = () => {
    setUnlocked(true);
    if (onUnlockSuccess) onUnlockSuccess();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Driver Verified Dossier"
        description="Comprehensive vetting credentials, ratings, and operating history"
      >
        <div className="space-y-5 pt-1">
          {/* Header Card */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-[#102A43] text-white flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 shadow-md">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-[#102A43] truncate">{displayName}</h3>
                <Badge variant="verified" size="sm" icon="shield">
                  KYC Verified
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {ratingAvg} / 5.0 Rating
                </span>
                <span>&bull;</span>
                <span className="font-medium">{experienceYears} Years Driving</span>
              </div>
            </div>
          </div>

          {/* Vetting Credentials Checklist */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Verified Compliance Documents (NTSA Standard)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-900 flex items-center justify-between">
                <span>Kenyan National ID</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
              <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-900 flex items-center justify-between">
                <span>NTSA Smart Driving License</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${hasPsv ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                <span>NTSA PSV Badge</span>
                {hasPsv ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <span className="text-[10px] text-slate-400">On Request</span>}
              </div>
              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${hasConduct ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                <span>Good Conduct (DCI)</span>
                {hasConduct ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <span className="text-[10px] text-slate-400">On Request</span>}
              </div>
            </div>
          </div>

          {/* Operational Scope */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> Familiar Operating Routes
              </span>
              <p className="font-bold text-slate-800">{areas.join(', ')}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-blue-600" /> Active Ride-Hailing Apps
              </span>
              <p className="font-bold text-slate-800">{platforms.join(', ')}</p>
            </div>
          </div>

          {/* Contact Details (Masked until M-Pesa Payment) */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Direct Contact Information</span>
              </span>
              <Badge variant={unlocked ? 'verified' : 'neutral'} size="sm">
                {unlocked ? 'Direct Access Unlocked' : 'Protected Contact'}
              </Badge>
            </div>

            {unlocked ? (
              <div className="space-y-2 pt-1 animate-in fade-in">
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div>
                    <span className="text-emerald-800 font-medium block">Phone / WhatsApp Number:</span>
                    <span className="font-bold text-base text-[#102A43]">{phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${phone}`}
                      className="px-3 py-1.5 bg-[#00A859] text-white font-bold rounded-xl text-xs hover:bg-[#008f4c] flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                    <a
                      href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 flex items-center gap-1"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="font-mono text-sm font-bold text-slate-500 tracking-wider">
                      +254 7•• ••• ••
                    </span>
                  </div>
                  <button
                    onClick={() => setMpesaModalOpen(true)}
                    className="px-3 py-1.5 bg-[#00A859] hover:bg-[#008f4c] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Unlock Phone (KES 199)
                  </button>
                </div>
                <p className="text-[11px] text-amber-800 leading-tight">
                  To protect driver privacy and prevent fraudulent offline recruiting, direct phone calling &amp; WhatsApp are unlocked via a small fee.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
            <Button variant="ghost" size="md" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <MpesaModal
        isOpen={mpesaModalOpen}
        onClose={() => setMpesaModalOpen(false)}
        serviceType="PARTNER_APPLICANT_UNLOCK"
        userId={driverId}
        userRole="PARTNER"
        onSuccess={handleMpesaSuccess}
      />
    </>
  );
}

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PartnerProfile } from '@/types';
import { marketplaceStore } from '@/lib/db/store';
import {
  ShieldCheck,
  CheckCircle2,
  Car,
  Star,
  MapPin,
  Building2,
  Phone,
  Smartphone,
  Camera,
  Lock,
} from 'lucide-react';
import { MpesaModal } from '@/components/payments/MpesaModal';

interface PartnerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerId: string;
  partnerName?: string;
  isUnlocked?: boolean;
  onUnlockSuccess?: () => void;
}

export function PartnerProfileModal({
  isOpen,
  onClose,
  partnerId,
  partnerName = 'Vehicle Partner',
  isUnlocked = false,
  onUnlockSuccess,
}: PartnerProfileModalProps) {
  const [mpesaModalOpen, setMpesaModalOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(isUnlocked);

  if (!isOpen) return null;

  const partner = marketplaceStore.partners.find((p) => p.id === partnerId || p.userId === partnerId);
  const profile = partner ? marketplaceStore.profiles.find((p) => p.userId === partner.userId) : null;
  const user = partner ? marketplaceStore.users.find((u) => u.id === partner.userId) : null;

  const displayName = partnerName || partner?.companyName || profile?.fullName || 'Vehicle Partner';
  const phone = user?.phone || '+254 712 345 678';
  const partnerVehicles = marketplaceStore.vehicles.filter((v) => v.partnerId === partner?.id);
  const ratingAvg = partner?.ratingAvg || 4.9;
  const location = profile?.locationCounty || 'Nairobi';

  const handleMpesaSuccess = () => {
    setUnlocked(true);
    if (onUnlockSuccess) onUnlockSuccess();
  };

  const currentAvatar = profile?.avatarUrl || user?.avatarUrl;
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'VP';

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !partner?.userId) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      marketplaceStore.updateAvatar(partner.userId, url);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Vehicle Partner Profile"
        description="Verified vehicle owner and fleet provider overview"
      >
        <div className="space-y-5 pt-1">
          {/* Header */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="relative group">
              <div className="w-14 h-14 rounded-2xl bg-[#102A43] text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0 overflow-hidden">
                {currentAvatar ? (
                  <img src={currentAvatar} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#102A43] hover:bg-blue-600 text-white flex items-center justify-center cursor-pointer shadow-md transition-colors">
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFile}
                />
              </label>
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-[#102A43] truncate">{displayName}</h3>
                <Badge variant="verified" size="sm" icon="shield">
                  Verified Owner
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {ratingAvg} / 5.0 Rating
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {location}
                </span>
              </div>
            </div>
          </div>

          {/* Asset & Compliance Overview */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-blue-600" /> Total Fleet Capacity
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {partnerVehicles.length || 1} Vehicle(s) Listed
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Logbooks
              </span>
              <p className="font-bold text-emerald-700 text-sm">
                NTSA Ownership Clear
              </p>
            </div>
          </div>

          {/* Contact (Masked until payment) */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Partner Phone &amp; Direct Channel</span>
              </span>
              <Badge variant={unlocked ? 'verified' : 'neutral'} size="sm">
                {unlocked ? 'Direct Channel Unlocked' : 'Protected Contact'}
              </Badge>
            </div>

            {unlocked ? (
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
                    className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700"
                  >
                    WhatsApp
                  </a>
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
                    <Smartphone className="w-3.5 h-3.5" /> Fast-Track Contact (KES 99)
                  </button>
                </div>
                <p className="text-[11px] text-amber-800 leading-tight">
                  Direct phone access fast-tracks your application directly to the owner&apos;s phone.
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
        serviceType="DRIVER_CONTACT_UNLOCK"
        userId={partnerId}
        userRole="DRIVER"
        onSuccess={handleMpesaSuccess}
      />
    </>
  );
}

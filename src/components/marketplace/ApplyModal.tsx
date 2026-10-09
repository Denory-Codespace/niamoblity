'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VehicleListing, DocumentType, VerificationDocument } from '@/types';
import { useAuth } from '@/lib/auth/auth-context';
import { marketplaceStore } from '@/lib/db/store';
import { formatKes } from '@/lib/utils';
import {
  CheckCircle,
  ShieldCheck,
  Sparkles,
  Send,
  Users,
  LogIn,
  UserPlus,
  FileText,
  AlertTriangle,
  Smartphone,
  Phone,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';
import { MpesaModal } from '@/components/payments/MpesaModal';
import { VerificationModal } from '@/components/verification/VerificationModal';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: VehicleListing | null;
  onSuccess?: () => void;
}

export function ApplyModal({ isOpen, onClose, listing, onSuccess }: ApplyModalProps) {
  const { driverProfile, currentProfile, currentUser, isAuthenticated, role } = useAuth();
  const [coverNote, setCoverNote] = useState(
    "Hello! I am an experienced driver registered on mobility platforms. I maintain consistent daily remittance and keep vehicles in pristine condition. I would love to drive this vehicle."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // KYC state
  const [kycDocs, setKycDocs] = useState<VerificationDocument[]>([]);
  const [nationalIdNum, setNationalIdNum] = useState('');
  const [dlNum, setDlNum] = useState('');
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  // M-Pesa fast-track unlock state
  const [mpesaModalOpen, setMpesaModalOpen] = useState(false);
  const [isContactUnlocked, setIsContactUnlocked] = useState(false);

  const userId = currentUser?.id || currentProfile?.userId || '';

  useEffect(() => {
    if (!isOpen || !userId) return;
    const update = () => {
      setKycDocs(marketplaceStore.getVerificationDocs(userId));
    };
    update();
    const unsubscribe = marketplaceStore.subscribe(update);
    return unsubscribe;
  }, [isOpen, userId]);

  if (!listing) return null;

  const hasNationalId = kycDocs.some((d) => d.documentType === 'NATIONAL_ID');
  const hasDl = kycDocs.some((d) => d.documentType === 'DRIVING_LICENSE');
  const hasPsv = kycDocs.some((d) => d.documentType === 'PSV_BADGE');
  const hasConduct = kycDocs.some((d) => d.documentType === 'POLICE_CLEARANCE');

  const allCoreDocsReady = hasNationalId && hasDl;

  const handleQuickKycSave = () => {
    if (nationalIdNum && !hasNationalId) {
      marketplaceStore.submitVerificationDocument({
        userId,
        documentType: 'NATIONAL_ID',
        documentNumber: nationalIdNum,
        fileName: `national_id_${nationalIdNum}.pdf`,
      });
    }
    if (dlNum && !hasDl) {
      marketplaceStore.submitVerificationDocument({
        userId,
        documentType: 'DRIVING_LICENSE',
        documentNumber: dlNum,
        fileName: `dl_${dlNum}.pdf`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const activeDriverId = driverProfile?.id;
      if (!activeDriverId) {
        throw new Error("Active driver profile not found. Please log in as a Driver.");
      }

      // Automatically register pending docs if entered in quick inputs
      handleQuickKycSave();

      await marketplaceStore.applyToListing(
        listing.id,
        activeDriverId,
        coverNote
      );

      setIsSubmitting(false);
      setIsSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Application submission failed.');
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setErrorMsg(null);
    onClose();
  };

  const openAuth = (mode: 'LOGIN' | 'REGISTER') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={isSubmitted ? "Application Submitted!" : "Apply for Vehicle Opportunity"}
        description={
          isSubmitted
            ? "Your application and verified profile have been sent to the partner."
            : `${listing.vehicle?.make} ${listing.vehicle?.model} (${listing.vehicle?.year})`
        }
      >
        {isSubmitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-[#102A43]">Application Transmitted</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {listing.partner?.fullName || "Vehicle Partner"} has received your profile, KYC status, and cover note. You can track status in your Driver Applications tab.
              </p>
            </div>

            {isContactUnlocked ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left space-y-2">
                <span className="text-xs font-bold text-emerald-900 block">📞 Direct Partner Contact Unlocked:</span>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-[#102A43]">{listing.partner?.fullName}</span>
                  <a
                    href="tel:+254712345678"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00A859] text-white rounded-xl font-bold text-xs hover:bg-[#008f4c]"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Partner
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-900 block">Fast-Track Your Review?</span>
                  <span className="text-[11px] text-amber-700">Reveal phone number &amp; call the partner directly.</span>
                </div>
                <button
                  onClick={() => setMpesaModalOpen(true)}
                  className="px-3 py-1.5 bg-[#00A859] text-white rounded-xl text-xs font-bold hover:bg-[#008f4c] shrink-0"
                >
                  Pay KES 150
                </button>
              </div>
            )}

            <div className="pt-2">
              <Button variant="primary" size="md" onClick={handleClose} className="w-full">
                Done &amp; Return to Marketplace
              </Button>
            </div>
          </div>
        ) : !isAuthenticated || role !== 'DRIVER' ? (
          <div className="py-6 space-y-5 text-center">
            <div className="w-14 h-14 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Users className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-[#102A43]">
                {role === 'PARTNER' ? 'Partner Account Detected' : 'Driver Account Required'}
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {role === 'PARTNER'
                  ? 'You are currently signed in as a Vehicle Partner. Sign in with your Driver account to apply.'
                  : 'You must be signed in as a registered Driver to apply for vehicle opportunities.'}
              </p>
            </div>
            <div className="flex flex-col gap-2.5 max-w-xs mx-auto pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={() => openAuth('LOGIN')}
                leftIcon={<LogIn className="w-4 h-4 text-[#FFF1B8]" />}
              >
                Sign In as Driver
              </Button>
              <Button
                variant="outline"
                size="md"
                className="w-full justify-center"
                onClick={() => openAuth('REGISTER')}
                leftIcon={<UserPlus className="w-4 h-4 text-blue-600" />}
              >
                Register Driver Account
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {errorMsg}
              </div>
            )}

            {/* Summary Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Daily Target (Hesabu):</span>
                <span className="text-sm font-bold text-[#102A43]">
                  {formatKes(listing.targetAmountKes)} / {listing.paymentFrequency.toLowerCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Security Deposit:</span>
                <span className="font-bold text-slate-700">{formatKes(listing.depositAmountKes)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Location:</span>
                <span className="font-semibold text-slate-700">
                  {listing.county} &bull; {listing.subcounty || "All Nairobi"}
                </span>
              </div>
            </div>

            {/* Uber / Bolt Standard KYC Enforcement */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Required KYC &amp; Verification Documents
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setVerificationModalOpen(true)}
                  className="text-[11px] font-bold text-blue-600 hover:underline"
                >
                  Manage All Docs
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className={`p-2 rounded-xl border flex items-center justify-between ${hasNationalId ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <span>Kenyan National ID</span>
                  {hasNationalId ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span className="text-[10px] text-amber-600 font-bold">Needed</span>}
                </div>
                <div className={`p-2 rounded-xl border flex items-center justify-between ${hasDl ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <span>NTSA Smart Driving License</span>
                  {hasDl ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span className="text-[10px] text-amber-600 font-bold">Needed</span>}
                </div>
                <div className={`p-2 rounded-xl border flex items-center justify-between ${hasPsv ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <span>NTSA PSV Driver Badge</span>
                  {hasPsv ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span className="text-[10px] text-slate-400">Optional</span>}
                </div>
                <div className={`p-2 rounded-xl border flex items-center justify-between ${hasConduct ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <span>Good Conduct (DCI)</span>
                  {hasConduct ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span className="text-[10px] text-slate-400">Optional</span>}
                </div>
              </div>

              {!allCoreDocsReady && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Quick ID &amp; License Entry</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-tight">
                    Vehicle partners prioritize drivers who provide their National ID and NTSA DL numbers.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {!hasNationalId && (
                      <input
                        type="text"
                        placeholder="National ID (e.g. 32918290)"
                        value={nationalIdNum}
                        onChange={(e) => setNationalIdNum(e.target.value)}
                        className="text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    )}
                    {!hasDl && (
                      <input
                        type="text"
                        placeholder="NTSA DL No (e.g. DL-883921)"
                        value={dlNum}
                        onChange={(e) => setDlNum(e.target.value)}
                        className="text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Fast-Track Callout via M-Pesa */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#102A43] flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#00A859]" />
                  <span>Fast-Track &amp; Reveal Partner Contact</span>
                </span>
                <span className="text-[11px] text-slate-600 block">
                  Skip the queue and get direct calling access for KES 150 via M-Pesa.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMpesaModalOpen(true)}
                className="px-3 py-1.5 bg-[#00A859] hover:bg-[#008f4c] text-white text-xs font-bold rounded-xl shrink-0 transition-colors shadow-sm"
              >
                {isContactUnlocked ? 'Unlocked ✅' : 'M-Pesa 150'}
              </button>
            </div>

            {/* Cover Note Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Introduction &amp; Experience Note to Partner:
              </label>
              <textarea
                rows={3}
                required
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#102A43] focus:border-transparent"
                placeholder="Describe your driving background, punctuality, and route experience..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="ghost" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                leftIcon={<Send className="w-4 h-4 text-[#FFF1B8]" />}
              >
                Submit Application
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultRole="DRIVER"
        initialMode={authMode}
      />

      <VerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
      />

      <MpesaModal
        isOpen={mpesaModalOpen}
        onClose={() => setMpesaModalOpen(false)}
        serviceType="DRIVER_CONTACT_UNLOCK"
        userId={userId}
        userRole="DRIVER"
        referenceId={listing.id}
        defaultPhone={currentUser?.phone || ''}
        onSuccess={() => setIsContactUnlocked(true)}
      />
    </>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Upload,
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
  const [coverNote, setCoverNote] = useState('');
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

  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);

  const hasNationalId = kycDocs.some((d) => d.documentType === 'NATIONAL_ID');
  const hasDl = kycDocs.some((d) => d.documentType === 'DRIVING_LICENSE');
  const hasPsv = kycDocs.some((d) => d.documentType === 'PSV_BADGE');
  const hasConduct = kycDocs.some((d) => d.documentType === 'POLICE_CLEARANCE');

  // National ID and Driving License are strictly mandatory (as required by Uber/Bolt/Little & Nia Mobility)
  const allCoreDocsReady = hasNationalId && hasDl;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: DocumentType) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploadingDocType(type);
    const reader = new FileReader();
    reader.onload = () => {
      marketplaceStore.submitVerificationDocument({
        userId,
        documentType: type,
        documentNumber: `KE-${Date.now().toString().slice(-6)}`,
        fileName: file.name,
        fileUrl: reader.result as string,
      });
      setKycDocs(marketplaceStore.getVerificationDocs(userId));
      setUploadingDocType(null);
    };
    reader.readAsDataURL(file);
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

      if (!allCoreDocsReady) {
        throw new Error("You must upload both your Kenyan National ID and NTSA Driving License before submitting an application.");
      }

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
        ) : (driverProfile && marketplaceStore.applications.some(
          (a) => a.listingId === listing.id && a.driverId === driverProfile.id && a.status !== 'WITHDRAWN'
        )) ? (
          <div className="py-6 space-y-5 text-center">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-[#102A43]">
                Application Already Submitted
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                You have already submitted an active application for this vehicle opportunity. The vehicle partner is reviewing your profile and credentials.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 max-w-xs mx-auto pt-2">
              <Link href="/driver/applications" onClick={onClose}>
                <Button variant="primary" size="md" className="w-full justify-center">
                  Track in My Applications &rarr;
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
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
            <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Verification Documents (Uber / Bolt &amp; Nia Standard)
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

              <p className="text-[11px] text-slate-500 leading-tight">
                To protect vehicle owners from fraud and ensure safety, <strong>National ID</strong> and <strong>Driving License</strong> document uploads are mandatory before applying.
              </p>

              {/* Document rows */}
              <div className="space-y-2">
                {/* 1. National ID */}
                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${hasNationalId ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'}`}>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">1. Kenyan National ID / Passport</span>
                      <span className="text-[10px] font-extrabold text-rose-600 bg-rose-100 px-1.5 py-0.2 rounded">Required</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {hasNationalId ? '✓ Document uploaded & ready for partner review' : 'Front & back scan or clear phone photo'}
                    </p>
                  </div>
                  {hasNationalId ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                    </span>
                  ) : (
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#102A43] hover:bg-[#1f3f60] text-white text-[11px] font-bold rounded-xl transition-colors shrink-0 shadow-sm">
                      <Upload className="w-3 h-3" />
                      <span>{uploadingDocType === 'NATIONAL_ID' ? 'Uploading...' : 'Upload ID'}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'NATIONAL_ID')}
                      />
                    </label>
                  )}
                </div>

                {/* 2. Driving License */}
                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${hasDl ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'}`}>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">2. NTSA Smart Driving License</span>
                      <span className="text-[10px] font-extrabold text-rose-600 bg-rose-100 px-1.5 py-0.2 rounded">Required</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {hasDl ? '✓ Valid DL uploaded & verified' : 'Class B / PSV Smart DL photo or PDF'}
                    </p>
                  </div>
                  {hasDl ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                    </span>
                  ) : (
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#102A43] hover:bg-[#1f3f60] text-white text-[11px] font-bold rounded-xl transition-colors shrink-0 shadow-sm">
                      <Upload className="w-3 h-3" />
                      <span>{uploadingDocType === 'DRIVING_LICENSE' ? 'Uploading...' : 'Upload DL'}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'DRIVING_LICENSE')}
                      />
                    </label>
                  )}
                </div>

                {/* 3. PSV Badge or Good Conduct (Optional Trust Boosters) */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className={`p-2 rounded-xl border flex items-center justify-between ${hasPsv ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <span className="truncate">PSV Badge (Optional)</span>
                    {hasPsv ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <label className="cursor-pointer text-[10px] text-blue-600 font-bold hover:underline shrink-0">
                        Upload
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'PSV_BADGE')}
                        />
                      </label>
                    )}
                  </div>
                  <div className={`p-2 rounded-xl border flex items-center justify-between ${hasConduct ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <span className="truncate">Good Conduct (DCI)</span>
                    {hasConduct ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <label className="cursor-pointer text-[10px] text-blue-600 font-bold hover:underline shrink-0">
                        Upload
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'POLICE_CLEARANCE')}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Fast-Track Callout via M-Pesa: KES 99 */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#102A43] flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#00A859]" />
                  <span>Fast-Track Application &amp; Contact Unlock</span>
                </span>
                <span className="text-[11px] text-slate-600 block">
                  Directly obtain the partner phone number and prioritize your application for KES 99.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMpesaModalOpen(true)}
                className="px-3 py-1.5 bg-[#00A859] hover:bg-[#008f4c] text-white text-xs font-bold rounded-xl shrink-0 transition-colors shadow-sm"
              >
                {isContactUnlocked ? 'Unlocked ✅' : 'M-Pesa 99'}
              </button>
            </div>

            {/* Cover Note Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Introduction &amp; Experience Note to Partner: <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#102A43] focus:border-transparent"
                placeholder="Introduce yourself — describe your driving background, daily remittance track record, punctuality, and why this vehicle is a good fit for you. Keep it honest and specific."
              />
              <p className="text-[10px] text-slate-400">Write a genuine introduction — partners read this first.</p>
            </div>

            {/* Doc gate warning */}
            {!allCoreDocsReady && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>
                  Please upload your <strong>National ID</strong> and <strong>Driving License</strong> above before submitting. Vehicles cannot be assigned without verified identification.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="ghost" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                disabled={!allCoreDocsReady || !coverNote.trim()}
                leftIcon={<Send className="w-4 h-4 text-[#FFF1B8]" />}
              >
                {!allCoreDocsReady ? 'Upload Required Docs to Apply' : 'Submit Application'}
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


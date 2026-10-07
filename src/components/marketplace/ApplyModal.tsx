'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VehicleListing } from '@/types';
import { useAuth } from '@/lib/auth/auth-context';
import { marketplaceStore } from '@/lib/db/store';
import { formatKes, generateUUID } from '@/lib/utils';
import { CheckCircle, ShieldCheck, Sparkles, Send, Users, LogIn } from 'lucide-react';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: VehicleListing | null;
  onSuccess?: () => void;
}

export function ApplyModal({ isOpen, onClose, listing, onSuccess }: ApplyModalProps) {
  const { driverProfile, currentProfile, currentUser, isAuthenticated, role, loginAsRole } = useAuth();
  const [coverNote, setCoverNote] = useState(
    "Hello! I am an experienced driver registered on mobility platforms. I maintain consistent daily remittance and keep vehicles in pristine condition. I would love to drive this vehicle."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let activeDriverId = driverProfile?.id;
      if (!activeDriverId) {
        if (marketplaceStore.drivers.length > 0) {
          activeDriverId = marketplaceStore.drivers[0].id;
        } else {
          activeDriverId = generateUUID();
        }
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSubmitted ? "Application Submitted!" : "Apply for Vehicle Opportunity"}
      description={
        isSubmitted
          ? "Your application has been sent directly to the vehicle partner."
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
              {listing.partner?.fullName || "Vehicle Partner"} has received your profile and cover note. You can track status in your Driver Applications tab.
            </p>
          </div>
          <div className="pt-4">
            <Button variant="primary" size="md" onClick={handleClose} className="w-full">
              Done & Return to Marketplace
            </Button>
          </div>
        </div>
      ) : !isAuthenticated || role !== 'DRIVER' ? (
        <div className="py-6 space-y-5 text-center">
          <div className="w-14 h-14 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-[#102A43]">Driver Account Required</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              You must be signed in as a registered Driver to apply for vehicle opportunities.
            </p>
          </div>
          <div className="flex flex-col gap-2 max-w-xs mx-auto">
            <Button
              variant="primary"
              size="md"
              onClick={() => loginAsRole('DRIVER')}
              leftIcon={<LogIn className="w-4 h-4 text-[#FFF1B8]" />}
            >
              Continue as Driver
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
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Commercial Target:</span>
              <span className="text-sm font-bold text-[#102A43]">
                {formatKes(listing.targetAmountKes)} / {listing.paymentFrequency.toLowerCase()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Security Deposit:</span>
              <span className="text-sm font-bold text-slate-700">
                {formatKes(listing.depositAmountKes)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Location:</span>
              <span className="text-xs font-semibold text-slate-700">
                {listing.county} &bull; {listing.subcounty || "All Nairobi"}
              </span>
            </div>
          </div>

          {/* Driver Verification State */}
          <div className="flex items-center gap-2 p-3 bg-[#DDF5E3]/60 border border-[#A7F3D0] rounded-xl text-xs text-[#065F46]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              Applying as <strong>{currentProfile?.fullName || "Verified Driver"}</strong> (Identity &amp; License Verified).
            </span>
          </div>

          {/* Cover Note Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Introduction &amp; Experience Note to Partner:
            </label>
            <textarea
              rows={4}
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
  );
}

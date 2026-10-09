'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { marketplaceStore } from '@/lib/db/store';
import { Agreement } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatKes, formatDateEAT } from '@/lib/utils';
import {
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  PenTool,
  Printer,
  LogIn,
  Eye,
} from 'lucide-react';
import { AgreementModal } from '@/components/agreement/AgreementModal';

export default function PartnerAgreementsPage() {
  const { partnerProfile, currentProfile, isAuthenticated, role } = useAuth();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);

  const partnerId = partnerProfile?.id;
  const userId = currentProfile?.userId;

  useEffect(() => {
    const update = () => {
      const pid = partnerProfile?.id;
      const uid = currentProfile?.userId;

      const filtered = marketplaceStore.agreements.filter(a => {
        if (pid && a.partnerId === pid) return true;
        if (uid && a.partnerId === uid) return true;
        if (!pid && !uid) return true;
        return false;
      });

      // Enrich vehicle and driver details if needed
      const enriched = filtered.map(agr => {
        const listing = marketplaceStore.listings.find(l => l.id === agr.listingId);
        const vehicle = agr.vehicle || listing?.vehicle || marketplaceStore.vehicles.find(v => v.id === agr.vehicleId || v.partnerId === agr.partnerId);
        const driver = marketplaceStore.drivers.find(d => d.id === agr.driverId);
        const driverProf = marketplaceStore.profiles.find(p => p.userId === driver?.userId);
        return {
          ...agr,
          vehicle: vehicle || agr.vehicle,
          driverName: agr.driverName || driverProf?.fullName || 'Verified Driver',
        };
      });

      setAgreements(enriched);
    };

    update();
    const unsubscribe = marketplaceStore.subscribe(update);
    return unsubscribe;
  }, [partnerId, userId, partnerProfile?.id, currentProfile?.userId]);

  const handleOpenAgreement = (agr: Agreement) => {
    setSelectedAgreement(agr);
  };

  if (!isAuthenticated || role !== 'PARTNER') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
          <FileCheck2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-[#102A43]">Partner Sign-In Required</h2>
          <p className="text-slate-500 text-xs leading-relaxed">
            Sign in as a Vehicle Partner to view and manage your operating agreements.
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2.5 max-w-xs mx-auto">
          <Link href="/login" className="w-full">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              leftIcon={<LogIn className="w-4 h-4 text-[#FFF1B8]" />}
            >
              Sign In to Your Account
            </Button>
          </Link>
          <Link href="/register" className="w-full">
            <Button
              variant="outline"
              size="md"
              className="w-full justify-center"
            >
              Register Partner Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="yellow" size="sm" icon="shield">
              Fleet Operating Agreements
            </Badge>
          </div>
          <h1 className="text-3xl font-black text-[#102A43] font-heading">
            My Operating Agreements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Review, sign, and manage commercial agreements with your drivers.
          </p>
        </div>

        {/* Agreements List */}
        {agreements.length > 0 ? (
          <div className="space-y-6">
            {agreements.map((agr) => (
              <div
                key={agr.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6"
              >
                {/* Header Status Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      {agr.agreementNumber}
                    </span>
                    <h3 className="text-xl font-black text-[#102A43] mt-1">
                      {agr.vehicle?.make} {agr.vehicle?.model} ({agr.vehicle?.registrationNumber || 'Vehicle'})
                    </h3>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      Driver: <strong className="text-slate-700">{agr.driverName}</strong>
                    </span>
                  </div>
                  <div>
                    {agr.status === 'ACTIVE' ? (
                      <Badge variant="verified" size="md" icon="check">
                        Active Agreement
                      </Badge>
                    ) : (
                      <Badge variant="yellow" size="md" icon="clock">
                        Pending Signatures
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Key Commercial Terms Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Commercial Remittance
                    </span>
                    <span className="text-base font-extrabold text-[#102A43] block mt-0.5">
                      {formatKes(agr.targetAmountKes)} / {agr.paymentFrequency.toLowerCase()}
                    </span>
                    <span className="text-[11px] text-slate-500">Security Deposit: {formatKes(agr.depositAmountKes)}</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Driver
                    </span>
                    <span className="text-sm font-extrabold text-[#102A43] block mt-0.5">
                      {agr.driverName}
                    </span>
                    <span className="text-[11px] text-slate-500">Operating Area: {agr.operatingArea}</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Duration &amp; Term
                    </span>
                    <span className="text-xs font-bold text-[#102A43] block mt-0.5">
                      From {formatDateEAT(agr.startDate)}
                    </span>
                    <span className="text-[11px] text-slate-500">6 Months Renewable</span>
                  </div>
                </div>

                {/* Clauses & Responsibilities */}
                <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700">
                  <div>
                    <strong className="text-slate-900 block mb-0.5">Fuel Terms:</strong>
                    {agr.fuelTerms}
                  </div>
                  <div>
                    <strong className="text-slate-900 block mb-0.5">Maintenance Terms:</strong>
                    {agr.maintenanceTerms}
                  </div>
                  <div>
                    <strong className="text-slate-900 block mb-0.5">Insurance Terms:</strong>
                    {agr.insuranceTerms}
                  </div>
                </div>

                {/* Digital Signatures Box */}
                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-700 space-y-1">
                    <div className="flex items-center gap-1.5">
                      {agr.partnerSignedAt ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Your Digital Signature: <strong>Recorded ({formatDateEAT(agr.partnerSignedAt)})</strong></span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span className="text-amber-900 font-medium">Your countersignature is pending.</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Driver Digital Signature: <strong>{agr.driverSignedAt ? `Recorded (${formatDateEAT(agr.driverSignedAt)})` : 'Awaiting driver'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAgreement(agr)}
                      leftIcon={<Eye className="w-4 h-4" />}
                    >
                      Review Agreement &amp; Terms
                    </Button>

                    {!agr.partnerSignedAt ? (
                      <Button
                        variant="soft-yellow"
                        size="sm"
                        onClick={() => handleOpenAgreement(agr)}
                        leftIcon={<PenTool className="w-4 h-4 text-amber-800" />}
                      >
                        Sign &amp; Countersign
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAgreement(agr)}
                          leftIcon={<Printer className="w-4 h-4" />}
                        >
                          View / Print PDF
                        </Button>
                        <Badge variant="verified" size="md">
                          Agreement Active &amp; Sealed
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <FileCheck2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#102A43]">No Active Agreements</h3>
              <p className="text-xs text-slate-500">
                Once you accept a driver application, an operating agreement will be generated here for your review and signature.
              </p>
            </div>
            <Link href="/partner/applications">
              <Button variant="outline" size="sm">
                View Applications
              </Button>
            </Link>
          </div>
        )}

        {/* Legal Agreement Review & E-Signing Modal */}
        {selectedAgreement && (
          <AgreementModal
            isOpen={!!selectedAgreement}
            onClose={() => setSelectedAgreement(null)}
            agreement={selectedAgreement}
            signerRole="PARTNER"
          />
        )}
      </div>
    </div>
  );
}

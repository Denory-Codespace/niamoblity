'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { marketplaceStore } from '@/lib/db/store';
import { Agreement } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatKes, formatDateEAT } from '@/lib/utils';
import Link from 'next/link';
import {
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  DollarSign,
  AlertTriangle,
  PenTool,
  Printer,
  ExternalLink,
} from 'lucide-react';

export default function DriverAgreementsPage() {
  const { driverProfile, currentProfile, isAuthenticated, role, loginAsRole } = useAuth();
  const [agreements, setAgreements] = useState<Agreement[]>(marketplaceStore.agreements);
  const [signingId, setSigningId] = useState<string | null>(null);

  const driverId = driverProfile?.id;
  const userId = currentProfile?.userId;

  useEffect(() => {
    const update = () => {
      const did = driverProfile?.id;
      const uid = currentProfile?.userId;

      const filtered = marketplaceStore.agreements.filter(a => {
        if (did && a.driverId === did) return true;
        if (uid && a.driverId === uid) return true;
        if (!did && !uid) return true;
        return false;
      });

      // Enrich vehicle and partner details if needed
      const enriched = filtered.map(agr => {
        const listing = marketplaceStore.listings.find(l => l.id === agr.listingId);
        const vehicle = agr.vehicle || listing?.vehicle || marketplaceStore.vehicles.find(v => v.id === agr.vehicleId || v.partnerId === agr.partnerId);
        const partner = marketplaceStore.partners.find(p => p.id === agr.partnerId);
        const partnerProf = marketplaceStore.profiles.find(p => p.userId === partner?.userId);
        return {
          ...agr,
          vehicle: vehicle || agr.vehicle,
          partnerName: agr.partnerName || partnerProf?.fullName || 'Vehicle Partner',
        };
      });

      setAgreements(enriched);
    };

    update();
    const unsubscribe = marketplaceStore.subscribe(update);
    return unsubscribe;
  }, [driverId, userId, driverProfile?.id, currentProfile?.userId]);

  const handleSign = (agreementId: string) => {
    setSigningId(agreementId);
    setTimeout(() => {
      marketplaceStore.signAgreement(agreementId, 'DRIVER');
      setSigningId(null);
    }, 800);
  };

  if (!isAuthenticated || role !== 'DRIVER') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto shadow-sm">
          <FileCheck2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-[#102A43]">Driver Sign-In Required</h2>
          <p className="text-slate-500 text-xs leading-relaxed">
            Sign in as a Driver to view, review, and digitally sign legal operating agreements.
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2.5 max-w-xs mx-auto">
          <Link href="/login" className="w-full">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
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
              Register Driver Account
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
            <Badge variant="verified" size="sm" icon="shield">
              Structured Legal Operating Framework
            </Badge>
          </div>
          <h1 className="text-3xl font-black text-[#102A43] font-heading">
            Operating Agreements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Digitally signed commercial agreements between you and your vehicle partners.
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
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {agr.agreementNumber}
                    </span>
                    <h3 className="text-xl font-black text-[#102A43] mt-1">
                      {agr.vehicle?.make} {agr.vehicle?.model} ({agr.vehicle?.registrationNumber || 'KDC 602A'})
                    </h3>
                  </div>
                  <div>
                    {agr.status === 'ACTIVE' ? (
                      <Badge variant="verified" size="md" icon="check">
                        Active Agreement
                      </Badge>
                    ) : (
                      <Badge variant="yellow" size="md" icon="clock">
                        Pending Digital Signature
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
                      Vehicle Partner
                    </span>
                    <span className="text-sm font-extrabold text-[#102A43] block mt-0.5">
                      {agr.partnerName}
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

                {/* Clauses & Responsibilities Breakdown */}
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
                <div className="p-4 rounded-2xl bg-[#DCEEFF]/40 border border-[#BFDBFE] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-700 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Partner Digital Signature: <strong>{agr.partnerSignedAt ? `Recorded (${formatDateEAT(agr.partnerSignedAt)})` : 'Pending'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {agr.driverSignedAt ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Driver Digital Signature: <strong>Recorded ({formatDateEAT(agr.driverSignedAt)})</strong></span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span className="text-amber-900 font-medium">Your signature is required to activate this vehicle handover.</span>
                        </>
                      )}
                    </div>
                  </div>

                  {!agr.driverSignedAt ? (
                    <Button
                      variant="primary"
                      size="md"
                      isLoading={signingId === agr.id}
                      onClick={() => handleSign(agr.id)}
                      leftIcon={<PenTool className="w-4 h-4 text-[#FFF1B8]" />}
                    >
                      Sign &amp; Accept Agreement
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.print()}
                        leftIcon={<Printer className="w-4 h-4" />}
                      >
                        Print PDF
                      </Button>
                      <Badge variant="verified" size="md">
                        Agreement Active
                      </Badge>
                    </div>
                  )}
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
                Once an application is accepted by a vehicle partner, your formal operating agreement will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

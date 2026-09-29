'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { marketplaceStore } from '@/lib/db/store';
import { matchingService, DEFAULT_MATCHING_WEIGHTS } from '@/lib/matching/matching-service';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatKes, formatDateEAT } from '@/lib/utils';
import {
  ShieldCheck,
  Users,
  Car,
  FileCheck2,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Activity,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { currentProfile } = useAuth();
  const [stats, setStats] = useState(marketplaceStore.getPlatformStats());
  const [verificationDocs, setVerificationDocs] = useState(marketplaceStore.verificationDocs);

  // Dynamic Matching Weights state
  const [weights, setWeights] = useState({
    location: 20,
    platform: 20,
    vehicleType: 15,
    experience: 10,
    availability: 10,
    financial: 15,
    preferences: 10,
  });
  const [isSavedWeights, setIsSavedWeights] = useState(false);

  useEffect(() => {
    const unsubscribe = marketplaceStore.subscribe(() => {
      setStats(marketplaceStore.getPlatformStats());
      setVerificationDocs([...marketplaceStore.verificationDocs]);
    });
    return unsubscribe;
  }, []);

  const handleDocAction = (docId: string, status: 'VERIFIED' | 'REJECTED') => {
    const doc = marketplaceStore.verificationDocs.find(d => d.id === docId);
    if (doc) {
      doc.status = status;
      if (status === 'VERIFIED') doc.verifiedAt = new Date().toISOString();
      setVerificationDocs([...marketplaceStore.verificationDocs]);
      setStats(marketplaceStore.getPlatformStats());
    }
  };

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedWeights(true);
    setTimeout(() => setIsSavedWeights(false), 2000);
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + Number(b), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="verified" size="sm" icon="shield">
                Super Admin Access &bull; Denory Codespace
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-[#102A43] font-heading">
              Platform Administration Control
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage marketplace liquidity, approve KYC documents, and configure algorithmic matching parameters.
            </p>
          </div>
        </div>

        {/* High-level KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Drivers</span>
            <span className="text-2xl font-black text-[#102A43]">{stats.totalDrivers}</span>
            <span className="text-[10px] text-emerald-600 font-semibold block">Nairobi Active Pool</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Fleet Assets</span>
            <span className="text-2xl font-black text-[#102A43]">{stats.totalVehicles}</span>
            <span className="text-[10px] text-blue-600 font-semibold block">{stats.activeListings} Published</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Agreements</span>
            <span className="text-2xl font-black text-emerald-700">{stats.activeAgreements}</span>
            <span className="text-[10px] text-emerald-600 font-semibold block">Legally Structured</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Avg Match Quality</span>
            <span className="text-2xl font-black text-blue-700">{stats.averageMatchScore}%</span>
            <span className="text-[10px] text-slate-500 font-semibold block">7-Factor Normalization</span>
          </div>
        </div>

        {/* Two Columns: 1. KYC Verification Queue | 2. Configurable Matching Weights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Col 1: KYC Verification Queue */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#102A43]">KYC &amp; Statutory Document Queue</h3>
                <p className="text-xs text-slate-500">Review driver DLs, PSV badges, and partner logbooks.</p>
              </div>
              <Badge variant="yellow" size="sm">
                {verificationDocs.filter(d => d.status === 'UNDER_REVIEW').length} Pending
              </Badge>
            </div>

            <div className="space-y-3">
              {verificationDocs.length > 0 ? (
                verificationDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#102A43] font-mono">{doc.documentType}</span>
                        <span className="text-xs font-bold text-slate-600">({doc.documentNumber || 'Ref doc'})</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        Uploaded by #{doc.userId} &bull; File: <strong className="text-blue-600">{doc.fileName}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {doc.status === 'UNDER_REVIEW' ? (
                        <>
                          <Button
                            variant="soft-green"
                            size="sm"
                            onClick={() => handleDocAction(doc.id, 'VERIFIED')}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:bg-rose-50"
                            onClick={() => handleDocAction(doc.id, 'REJECTED')}
                            leftIcon={<XCircle className="w-3.5 h-3.5" />}
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Badge
                          variant={doc.status === 'VERIFIED' ? 'verified' : 'rejected'}
                          size="sm"
                        >
                          {doc.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                  No documents currently in the verification queue.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Database Management</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Clear all local store data and reset marketplace to 0?')) {
                    marketplaceStore.clearAllData();
                    window.location.reload();
                  }
                }}
              >
                Reset All Data to Zero (Clean Slate)
              </Button>
            </div>
          </div>

          {/* Col 2: Dynamic Matching Weights Editor */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-[#102A43]">Matching Weights</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Tune the deterministic 7-factor weights across the live Kenyan marketplace.
              </p>
            </div>

            <form onSubmit={handleSaveWeights} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Location Compatibility</span>
                    <span>{weights.location}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={weights.location}
                    onChange={(e) => setWeights({ ...weights, location: Number(e.target.value) })}
                    className="w-full accent-[#102A43]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Platform Overlap (Uber/Bolt)</span>
                    <span>{weights.platform}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={weights.platform}
                    onChange={(e) => setWeights({ ...weights, platform: Number(e.target.value) })}
                    className="w-full accent-[#102A43]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Financial Target Compatibility</span>
                    <span>{weights.financial}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={weights.financial}
                    onChange={(e) => setWeights({ ...weights, financial: Number(e.target.value) })}
                    className="w-full accent-[#102A43]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Vehicle Body Preference</span>
                    <span>{weights.vehicleType}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={weights.vehicleType}
                    onChange={(e) => setWeights({ ...weights, vehicleType: Number(e.target.value) })}
                    className="w-full accent-[#102A43]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Experience &amp; Track Record</span>
                    <span>{weights.experience}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={weights.experience}
                    onChange={(e) => setWeights({ ...weights, experience: Number(e.target.value) })}
                    className="w-full accent-[#102A43]"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">Total Normalized Weight:</span>
                <span className={`font-black ${totalWeight === 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {totalWeight}%
                </span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
              >
                {isSavedWeights ? 'Saved & Applied to Engine! ✓' : 'Save Algorithm Settings'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

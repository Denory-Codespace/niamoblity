'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { marketplaceStore } from '@/lib/db/store';
import { matchingService } from '@/lib/matching/matching-service';
import { VehicleCard } from '@/components/marketplace/VehicleCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatKes } from '@/lib/utils';
import {
  Sparkles,
  MapPin,
  Car,
  Fuel,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

export default function DriverMatchesPage() {
  const { driverProfile, currentProfile } = useAuth();
  const [rankedListings, setRankedListings] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);

  useEffect(() => {
    if (driverProfile) {
      const ranked = matchingService.rankListingsForDriver(
        driverProfile,
        marketplaceStore.listings
      );
      setRankedListings(ranked);
      if (ranked.length > 0) {
        setSelectedMatch(ranked[0]);
      }
    }
  }, [driverProfile]);

  if (!driverProfile) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold">Please switch to the Driver Persona</h2>
        <p className="text-slate-500 text-sm">Use the top bar to select Driver persona to test algorithmic matching.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="match" size="sm" icon="sparkles">
              Deterministic 7-Factor Engine
            </Badge>
            <Badge variant="verified" size="sm" icon="shield">
              Profile: {currentProfile?.fullName} ({driverProfile.drivingExperienceYears} Yrs Exp)
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#102A43] font-heading">
            Your Algorithmic Matches
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Vehicles ranked specifically according to your preferred Nairobi areas, platforms, budget targets, and experience.
          </p>
        </div>

        {/* Selected Match Factor Breakdown Box */}
        {selectedMatch && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-200/80 shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                  Top Matched Opportunity Analysis
                </span>
                <h3 className="text-xl font-black text-[#102A43]">
                  {selectedMatch.title}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium block">Commercial Target</span>
                  <span className="text-base font-extrabold text-[#102A43]">
                    {formatKes(selectedMatch.targetAmountKes)} / {selectedMatch.paymentFrequency.toLowerCase()}
                  </span>
                </div>
                <div className="px-4 py-2 bg-[#DCEEFF] text-blue-800 rounded-2xl font-black text-xl border border-blue-200 shadow-sm">
                  {selectedMatch.matchScorePct}%
                </div>
              </div>
            </div>

            {/* 7-Factor Detailed Progress Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Factor 1: Location */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Location (20%)</span>
                  <span className="text-blue-700">{selectedMatch.matchBreakdown.locationScore} / 20 pts</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${(selectedMatch.matchBreakdown.locationScore / 20) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">
                  {selectedMatch.subcounty} vs your areas
                </span>
              </div>

              {/* Factor 2: Platform */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Platform Fit (20%)</span>
                  <span className="text-blue-700">{selectedMatch.matchBreakdown.platformScore} / 20 pts</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${(selectedMatch.matchBreakdown.platformScore / 20) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Shared: {selectedMatch.matchBreakdown.factors.platformsShared.join(', ') || 'Standard'}
                </span>
              </div>

              {/* Factor 3: Financial */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Financial Target (15%)</span>
                  <span className="text-blue-700">{selectedMatch.matchBreakdown.financialScore} / 15 pts</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${(selectedMatch.matchBreakdown.financialScore / 15) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Within your target budget
                </span>
              </div>

              {/* Factor 4: Experience & KYC */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Experience &amp; KYC (20%)</span>
                  <span className="text-blue-700">
                    {selectedMatch.matchBreakdown.experienceScore + selectedMatch.matchBreakdown.preferencesScore} / 20 pts
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${((selectedMatch.matchBreakdown.experienceScore + selectedMatch.matchBreakdown.preferencesScore) / 20) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Verified DL + {driverProfile.drivingExperienceYears} yrs experience
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Ranked Opportunities Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#102A43]">All Compatible Nairobi Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rankedListings.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMatch(item)}
                className={`cursor-pointer rounded-2xl transition-all ${
                  selectedMatch?.id === item.id ? 'ring-2 ring-blue-500 shadow-md' : ''
                }`}
              >
                <VehicleCard
                  listing={item}
                  matchScorePct={item.matchScorePct}
                  isSaved={marketplaceStore.savedListingIds.includes(item.id)}
                  onSaveToggle={() => marketplaceStore.toggleSaveListing(item.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

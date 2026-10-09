'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VehicleListing } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatKes } from '@/lib/utils';
import {
  MapPin,
  Fuel,
  Gauge,
  Sparkles,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Layers,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { marketplaceStore } from '@/lib/db/store';
import { useAuth } from '@/lib/auth/auth-context';
import { ApplyModal } from './ApplyModal';
import { PartnerProfileModal } from '@/components/profile/PartnerProfileModal';

interface VehicleCardProps {
  listing: VehicleListing;
  matchScorePct?: number;
  isSaved?: boolean;
  onSaveToggle?: () => void;
}

export function VehicleCard({ listing, matchScorePct, isSaved = false, onSaveToggle }: VehicleCardProps) {
  const { role, partnerProfile } = useAuth();
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const vehicle = listing.vehicle;
  const photoUrl = vehicle?.photos?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80';

  const isMyListing = role === 'PARTNER' && partnerProfile && listing.partnerId === partnerProfile.id;
  const isPartner = role === 'PARTNER';

  // Upwork-style Application & Proposal metrics
  const appsForListing = marketplaceStore.applications.filter((a) => a.listingId === listing.id);
  const totalProposals = Math.max(appsForListing.length, listing.applicationsCount || 0);
  const interviewingCount = appsForListing.filter((a) => a.status === 'INTERVIEW' || a.status === 'SHORTLISTED').length;

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-soft hover:shadow-card transition-all duration-200 flex flex-col group">
        {/* Card Image & Overlay Badges */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <img
            src={photoUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Top Left: Match Score Badge if Driver */}
          {matchScorePct !== undefined && (
            <div className="absolute top-3 left-3">
              <Badge variant="match" size="md" icon="sparkles" className="shadow-md font-bold">
                {matchScorePct}% Match
              </Badge>
            </div>
          )}

          {/* Top Right: Save Bookmark Button */}
          <button
            onClick={onSaveToggle}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:text-blue-600 hover:bg-white shadow-sm transition-all"
            aria-label="Save listing"
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-blue-600 fill-blue-600" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>

          {/* Bottom Left Badge: Verified Vehicle */}
          {vehicle?.verificationStatus === 'VERIFIED' && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="verified" size="sm" icon="shield" className="bg-white/95 backdrop-blur-sm text-[10px]">
                Verified Asset
              </Badge>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            {/* Title & Location */}
            <div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{listing.county} &bull; {listing.subcounty || "All Areas"}</span>
              </div>
              <h3 className="text-base font-bold text-[#102A43] group-hover:text-blue-600 transition-colors line-clamp-1 mt-0.5">
                {listing.title}
              </h3>
            </div>

            {/* Quick Spec Pills */}
            <div className="flex flex-wrap gap-1.5 text-xs text-slate-600 pt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 font-medium text-[11px]">
                <Layers className="w-3 h-3 text-slate-400" />
                {vehicle?.vehicleType || "Sedan"}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 font-medium text-[11px]">
                <Gauge className="w-3 h-3 text-slate-400" />
                {vehicle?.transmission || "Automatic"}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 font-medium text-[11px]">
                <Fuel className="w-3 h-3 text-slate-400" />
                {vehicle?.fuelType || "Petrol"}
              </span>
            </div>

            {/* Supported Platforms */}
            <div className="pt-1">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-slate-400 font-medium">Platforms:</span>
                {(listing.preferredPlatforms.length > 0 ? listing.preferredPlatforms : vehicle?.supportedPlatforms || ["Uber", "Bolt"]).map((plat) => (
                  <span
                    key={plat}
                    className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded"
                  >
                    {plat}
                  </span>
                ))}
              </div>
            </div>

            {/* Partner Attribution */}
            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate">
                Partner: <strong className="text-slate-700">{listing.partner?.fullName || "Vehicle Partner"}</strong>
              </span>
              <button
                type="button"
                onClick={() => setPartnerModalOpen(true)}
                className="text-[10px] font-bold text-blue-600 hover:underline shrink-0"
              >
                Owner Profile &rarr;
              </button>
            </div>

            {/* Upwork-style Proposals & Interviewing Activity */}
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/70 text-[11px] space-y-1 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-600" /> Applications made: 
                </span>
                <span className="font-bold text-slate-800">
                  {totalProposals === 0 ? 'Be the first to apply' : `${totalProposals} drivers`}
                </span>
              </div>
              {totalProposals > 0 && (
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>In Interview: <strong className="text-amber-700 font-bold">{interviewingCount}</strong></span>
                  <span className="text-emerald-700 font-semibold">&bull; Active Now</span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Commercial Structure */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">
                {listing.arrangementType === 'WEEKLY_TARGET' ? 'Weekly Target' : 'Daily Target'}
              </span>
              <span className="text-base font-extrabold text-[#102A43]">
                {formatKes(listing.targetAmountKes)}
              </span>
            </div>

            {isMyListing ? (
              <Link href="/partner/dashboard">
                <Button variant="outline" size="sm" className="border-amber-500 text-amber-800 hover:bg-amber-50">
                  Manage Listing
                </Button>
              </Link>
            ) : isPartner ? (
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-xl">
                Partner View
              </span>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setApplyModalOpen(true)}
              >
                Apply Now
              </Button>
            )}
          </div>
        </div>
      </div>

      <ApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        listing={listing}
      />

      <PartnerProfileModal
        isOpen={partnerModalOpen}
        onClose={() => setPartnerModalOpen(false)}
        partnerId={listing.partnerId}
        partnerName={listing.partner?.fullName}
      />
    </>
  );
}

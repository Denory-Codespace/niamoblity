'use client';

import React, { useState, useEffect } from 'react';

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
  ChevronLeft,
  ChevronRight,
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
  const { role, partnerProfile, driverProfile } = useAuth();
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [, setStoreTick] = useState(0);

  // Subscribe to reactive store updates so live vehicle/partner changes reflect immediately
  useEffect(() => {
    return marketplaceStore.subscribe(() => setStoreTick(t => t + 1));
  }, []);

  const vehicle = listing.vehicle || marketplaceStore.vehicles.find(v => v.id === listing.vehicleId);
  const photos = vehicle?.photos?.length ? vehicle.photos : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80'];
  const photoUrl = photos[photoIndex] || photos[0];

  const isMyListing = role === 'PARTNER' && partnerProfile && listing.partnerId === partnerProfile.id;
  const isPartner = role === 'PARTNER';

  // Resolve genuine partner name
  const partnerRec = marketplaceStore.partners.find((p) => p.id === listing.partnerId || p.userId === listing.partnerId);
  const partnerProfileRec = partnerRec ? marketplaceStore.profiles.find((p) => p.userId === partnerRec.userId) : null;
  const partnerNameResolved = (listing.partner?.fullName && listing.partner.fullName !== 'Vehicle Partner')
    ? listing.partner.fullName
    : partnerProfileRec?.fullName || partnerRec?.companyName || listing.partner?.fullName || 'Verified Fleet Owner';

  // Check if current driver has already submitted an application
  const hasApplied = role === 'DRIVER' && driverProfile && marketplaceStore.applications.some(
    (a) => a.listingId === listing.id && a.driverId === driverProfile.id && a.status !== 'WITHDRAWN'
  );

  // Check if vehicle has already been hired / signed into active contract
  const isHired = listing.status === 'HIRED' ||
    listing.vehicle?.availabilityStatus === 'ASSIGNED' ||
    marketplaceStore.agreements.some(
      (ag) => (ag.listingId === listing.id || (listing.vehicleId && ag.vehicleId === listing.vehicleId)) && (ag.status === 'ACTIVE' || ag.status === 'COMPLETED')
    );

  // Upwork-style Application & Proposal metrics
  const appsForListing = marketplaceStore.applications.filter((a) => a.listingId === listing.id);
  const totalProposals = Math.max(appsForListing.length, listing.applicationsCount || 0);
  const interviewingCount = appsForListing.filter((a) => a.status === 'INTERVIEW' || a.status === 'SHORTLISTED').length;
  return (
    <>
      <div className={`bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-soft transition-all duration-300 flex flex-col group ${
        isHired
          ? 'opacity-75 grayscale-25 border-dashed border-slate-300'
          : 'hover:shadow-xl hover:-translate-y-1.5'
      }`}>
        {/* Card Image & Overlay Badges */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <img
            src={photoUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Photo carousel dots when there are multiple photos */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setPhotoIndex(i => (i - 1 + photos.length) % photos.length); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setPhotoIndex(i => (i + 1) % photos.length); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setPhotoIndex(i); }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === photoIndex ? 'bg-white scale-110' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Top Left: Hired Badge or Match Score Badge */}
          {isHired ? (
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-slate-900/90 text-white backdrop-blur-xs flex items-center gap-1 shadow-md">
                🔒 Hired &bull; In Active Service
              </span>
            </div>
          ) : matchScorePct !== undefined ? (
            <div className="absolute top-3 left-3">
              <Badge variant="match" size="md" icon="sparkles" className="shadow-md font-bold">
                {matchScorePct}% Match
              </Badge>
            </div>
          ) : null}

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
                Partner: <strong className="text-slate-700">{partnerNameResolved}</strong>
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
            ) : isHired ? (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-80"
              >
                Position Filled
              </Button>
            ) : hasApplied ? (
              <Link href="/driver/applications">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 text-[11px]"
                >
                  Applied ✓ Track
                </Button>
              </Link>
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
        partnerName={partnerNameResolved}
      />
    </>
  );
}

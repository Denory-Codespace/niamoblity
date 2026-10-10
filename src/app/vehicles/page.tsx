'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { VehicleCard } from '@/components/marketplace/VehicleCard';
import { marketplaceStore } from '@/lib/db/store';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { NAIROBI_SUBCOUNTIES, SUPPORTED_MOBILITY_PLATFORMS } from '@/lib/utils';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Sparkles,
  MapPin,
  Car,
  Layers,
  Fuel,
  CheckCircle2,
  X,
} from 'lucide-react';

export default function VehiclesMarketplacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] py-12 text-center text-slate-500">Loading Nairobi Marketplace...</div>}>
      <VehiclesMarketplaceContent />
    </Suspense>
  );
}

function VehiclesMarketplaceContent() {
  const { driverProfile, role } = useAuth();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubcounty, setSelectedSubcounty] = useState<string>('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('ALL');
  const [maxDailyTarget, setMaxDailyTarget] = useState<number>(5000);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'MATCH' | 'LATEST' | 'TARGET_ASC' | 'TARGET_DESC'>('LATEST');

  const [mounted, setMounted] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const q = searchParams.get('q') || searchParams.get('search');
    if (q) setSearchTerm(q);
    const sub = searchParams.get('subcounty') || searchParams.get('area');
    if (sub) setSelectedSubcounty(sub);
  }, [searchParams]);

  useEffect(() => {
    setMounted(true);
    setListings(marketplaceStore.getListings(driverProfile || undefined));
    setSavedIds([...marketplaceStore.savedListingIds]);

    const unsubscribe = marketplaceStore.subscribe(() => {
      setListings(marketplaceStore.getListings(driverProfile || undefined));
      setSavedIds([...marketplaceStore.savedListingIds]);
    });
    return unsubscribe;
  }, [driverProfile]);

  // Filter listings
  const filteredListings = listings.filter((item) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.vehicle?.make.toLowerCase().includes(q) ||
      item.vehicle?.model.toLowerCase().includes(q) ||
      item.vehicle?.registrationNumber?.toLowerCase().includes(q) ||
      item.county?.toLowerCase().includes(q) ||
      item.subcounty?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.vehicle?.transmission?.toLowerCase().includes(q) ||
      item.vehicle?.fuelType?.toLowerCase().includes(q);

    const matchesSubcounty =
      selectedSubcounty === 'ALL' ||
      (item.subcounty && item.subcounty.toLowerCase().includes(selectedSubcounty.toLowerCase()));

    const matchesPlatform =
      selectedPlatform === 'ALL' ||
      item.preferredPlatforms.includes(selectedPlatform) ||
      (item.vehicle?.supportedPlatforms && item.vehicle.supportedPlatforms.includes(selectedPlatform));

    const matchesType =
      selectedVehicleType === 'ALL' ||
      item.vehicle?.vehicleType === selectedVehicleType;

    const matchesTarget =
      item.arrangementType === 'WEEKLY_TARGET'
        ? item.targetAmountKes / 7 <= maxDailyTarget
        : item.targetAmountKes <= maxDailyTarget;

    const matchesVerified = !verifiedOnly || item.vehicle?.verificationStatus === 'VERIFIED';

    return matchesSearch && matchesSubcounty && matchesPlatform && matchesType && matchesTarget && matchesVerified;
  });

  // Sort listings based on selected mode
  const sortedAndFilteredListings = [...filteredListings].sort((a, b) => {
    if (sortBy === 'LATEST') {
      const dateA = new Date(a.createdAt || a.publishedAt || 0).getTime();
      const dateB = new Date(b.createdAt || b.publishedAt || 0).getTime();
      return dateB - dateA;
    }
    if (sortBy === 'TARGET_ASC') {
      return (a.targetAmountKes || 0) - (b.targetAmountKes || 0);
    }
    if (sortBy === 'TARGET_DESC') {
      return (b.targetAmountKes || 0) - (a.targetAmountKes || 0);
    }
    return (b.matchScorePct || 0) - (a.matchScorePct || 0);
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="verified" size="sm" icon="shield">
                Verified Kenyan Assets
              </Badge>
              {role === 'DRIVER' && (
                <Badge variant="match" size="sm" icon="sparkles">
                  Ranked by Algorithmic Compatibility
                </Badge>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#102A43] font-heading">
              Nairobi Vehicle Opportunities
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Discover verified cars available for Uber, Bolt, Little, and Faras operations in Nairobi.
            </p>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Marketplace Liquidity
            </span>
            <span className="text-sm font-extrabold text-[#102A43]">
              {mounted ? sortedAndFilteredListings.length : 0} Vehicles Available
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-soft space-y-4">
          {/* Main Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by make, model, reg plate, zone (e.g. Fielder, Axio, Demio, Westlands, KDD)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#102A43]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {/* Sort by Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Display Order
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full text-xs p-2 rounded-lg border border-blue-200 bg-blue-50/50 text-[#102A43] font-bold focus:outline-none focus:ring-2 focus:ring-[#102A43]"
              >
                <option value="LATEST">🆕 Latest Posted</option>
                {role === 'DRIVER' && <option value="MATCH">✨ Best Compatibility</option>}
                <option value="TARGET_ASC">💰 Target: Low to High</option>
                <option value="TARGET_DESC">💰 Target: High to Low</option>
              </select>
            </div>

            {/* Area Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Nairobi Zone
              </label>
              <select
                value={selectedSubcounty}
                onChange={(e) => setSelectedSubcounty(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#102A43]"
              >
                <option value="ALL">All Nairobi Zones</option>
                {NAIROBI_SUBCOUNTIES.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            {/* Platform Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Mobility Platform
              </label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#102A43]"
              >
                <option value="ALL">All Platforms</option>
                {SUPPORTED_MOBILITY_PLATFORMS.map((plat) => (
                  <option key={plat} value={plat}>
                    {plat}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Body Type
              </label>
              <select
                value={selectedVehicleType}
                onChange={(e) => setSelectedVehicleType(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#102A43]"
              >
                <option value="ALL">All Body Types</option>
                <option value="SEDAN">Sedan (Fielder / Axio / Premio)</option>
                <option value="HATCHBACK">Hatchback (Note / Demio / Vitz)</option>
                <option value="SUV">SUV</option>
                <option value="VAN">Van / Shuttle</option>
              </select>
            </div>

            {/* Max Daily Target */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Max Target: KES {maxDailyTarget.toLocaleString()}
              </label>
              <input
                type="range"
                min="1500"
                max="5000"
                step="100"
                value={maxDailyTarget}
                onChange={(e) => setMaxDailyTarget(Number(e.target.value))}
                className="w-full accent-[#102A43] cursor-pointer mt-1"
              />
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {sortedAndFilteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAndFilteredListings.map((listing) => (
              <VehicleCard
                key={listing.id}
                listing={listing}
                matchScorePct={listing.matchScorePct || 90}
                isSaved={savedIds.includes(listing.id)}
                onSaveToggle={() => marketplaceStore.toggleSaveListing(listing.id)}
              />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-soft max-w-lg mx-auto space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
              <Car className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-[#102A43]">No Vehicles Listed Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                The marketplace currently has 0 active listings. Register your vehicle as a Partner to publish the first driver opportunity in Nairobi!
              </p>
            </div>
            <div className="pt-2">
              <a href="/partner/listings/new">
                <Button variant="primary" size="md">
                  List a Vehicle Opportunity
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Car className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#102A43]">No Vehicles Match Filters</h3>
              <p className="text-xs text-slate-500">
                Try expanding your budget target or selecting All Nairobi Zones.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedSubcounty('ALL');
                setSelectedPlatform('ALL');
                setSelectedVehicleType('ALL');
                setMaxDailyTarget(5000);
              }}
            >
              Reset All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

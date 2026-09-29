'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VehicleCard } from '@/components/marketplace/VehicleCard';
import { marketplaceStore } from '@/lib/db/store';
import { useAuth } from '@/lib/auth/auth-context';
import {
  Car,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  TrendingUp,
  Award,
  Users,
  Building2,
  MapPin,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  const { role, driverProfile } = useAuth();
  const [listings, setListings] = useState(marketplaceStore.getListings(driverProfile || undefined));
  const [savedIds, setSavedIds] = useState<string[]>(marketplaceStore.savedListingIds);

  useEffect(() => {
    const unsubscribe = marketplaceStore.subscribe(() => {
      setListings(marketplaceStore.getListings(driverProfile || undefined));
      setSavedIds([...marketplaceStore.savedListingIds]);
    });
    return unsubscribe;
  }, [driverProfile]);

  const featuredListings = listings.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#DCEEFF]/40 via-[#F8FAFC] to-[#F8FAFC] pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DDF5E3] border border-[#A7F3D0] text-[#065F46] text-xs font-bold tracking-wide animate-in fade-in slide-in-from-bottom-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Kenya&apos;s Verified Driver ↔ Partner Mobility Marketplace</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#102A43] tracking-tight font-heading leading-[1.1]">
                Find a Car. <br className="hidden sm:inline" />
                Find a Driver. <br />
                <span className="text-blue-600">Drive &amp; Earn.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Connect directly with verified vehicle owners and professional drivers across Nairobi. No middlemen, transparent daily targets, structured digital agreements, and algorithmic matching.
              </p>

              {/* Primary Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link href="/vehicles" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto shadow-md"
                    leftIcon={<Search className="w-5 h-5 text-[#DCEEFF]" />}
                  >
                    Find a Vehicle
                  </Button>
                </Link>
                <Link href="/partner/listings/new" className="w-full sm:w-auto">
                  <Button
                    variant="soft-yellow"
                    size="lg"
                    className="w-full sm:w-auto font-bold"
                    leftIcon={<Car className="w-5 h-5 text-[#92400E]" />}
                  >
                    List My Vehicle
                  </Button>
                </Link>
              </div>

              {/* Live Trust Metrics Bar */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <span className="block text-2xl font-black text-[#102A43]">100%</span>
                  <span className="text-xs text-slate-500 font-medium">Verified Kenyan DLs</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-[#102A43]">KES 0</span>
                  <span className="text-xs text-slate-500 font-medium">Middleman Fees</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-emerald-600">94%</span>
                  <span className="text-xs text-slate-500 font-medium">Avg Match Score</span>
                </div>
              </div>
            </div>

            {/* Right Hero Graphic: Live Interactive Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-floating border border-slate-200/90 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Live Nairobi Opportunity</span>
                  </div>
                  <Badge variant="match" size="sm" icon="sparkles">
                    94% Top Match
                  </Badge>
                </div>

                {/* Card vehicle preview */}
                <div className="rounded-2xl overflow-hidden aspect-[16/10] relative">
                  <img
                    src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80"
                    alt="Toyota Fielder Nairobi"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="verified" size="sm" icon="shield" className="bg-white/95">
                      NTSA Inspected
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#102A43]">Toyota Fielder 2018 (Auto)</h3>
                    <span className="text-sm font-extrabold text-blue-700">KES 2,800/day</span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> Kasarani &bull; Uber / Bolt / Little
                  </p>
                </div>

                <div className="p-3 bg-[#DCEEFF]/50 border border-[#BFDBFE] rounded-xl flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-900">David Kamau (Apex Fleets)</span>
                  <span className="text-emerald-700 font-bold">&starf; 4.9 (32 Reviews)</span>
                </div>

                <Link href="/vehicles" className="block">
                  <Button variant="primary" size="md" className="w-full">
                    Explore All Available Cars
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="yellow" size="md">
              Simple &amp; Transparent Process
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-[#102A43] font-heading">
              How nia mobility Works
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              A structured, 4-step framework designed for the realities of the Kenyan digital mobility sector.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200/80 space-y-3 relative group hover:border-blue-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#DCEEFF] text-blue-700 flex items-center justify-center font-black text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-[#102A43]">Register &amp; Verify</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Drivers verify Kenyan DL &amp; PSV credentials. Vehicle partners submit NTSA logbook and commercial insurance details.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200/80 space-y-3 relative group hover:border-blue-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF1B8] text-amber-900 flex items-center justify-center font-black text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-[#102A43]">Algorithmic Match</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our 7-factor engine pairs drivers and vehicles based on Nairobi zones, platform preference, targets, and experience.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200/80 space-y-3 relative group hover:border-blue-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#DDF5E3] text-emerald-800 flex items-center justify-center font-black text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-[#102A43]">Chat &amp; Interview</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Communicate safely in-app once shortlisted. Align on operating hours, servicing schedules, and deposit terms.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200/80 space-y-3 relative group hover:border-blue-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#102A43] text-white flex items-center justify-center font-black text-lg">
                4
              </div>
              <h3 className="text-lg font-bold text-[#102A43]">Sign &amp; Drive</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Digitally sign a structured commercial operating agreement. Start driving on Uber, Bolt, or Little with peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED NAIROBI VEHICLES */}
      <section className="py-16 bg-[#F8FAFC] border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" /> Live Opportunities
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#102A43] font-heading">
                Available Vehicles in Nairobi
              </h2>
            </div>
            <Link href="/vehicles">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All {listings.length} Vehicles
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <VehicleCard
                key={listing.id}
                listing={listing}
                matchScorePct={listing.matchScorePct || 92}
                isSaved={savedIds.includes(listing.id)}
                onSaveToggle={() => marketplaceStore.toggleSaveListing(listing.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. TWO-SIDED VALUE PROPOSITIONS */}
      <section className="py-16 sm:py-24 bg-white border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* For Drivers Card */}
            <div className="bg-gradient-to-br from-[#DCEEFF]/50 to-white rounded-3xl p-8 sm:p-10 border border-[#BFDBFE] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-[#102A43] font-heading">
                  For Professional Drivers
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Looking to drive on Uber, Bolt, Little, or Faras without vehicle ownership barriers? Access clean, verified vehicles with clear targets and fair owners.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Verified logbooks &amp; active comprehensive insurance.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    No unfair middlemen cuts or surprise charges.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Transparent daily and weekly remittance schedules.
                  </li>
                </ul>
              </div>
              <Link href="/vehicles" className="pt-4">
                <Button variant="primary" size="md" className="w-full">
                  Browse Vehicles &amp; Apply
                </Button>
              </Link>
            </div>

            {/* For Vehicle Partners Card */}
            <div className="bg-gradient-to-br from-[#FFF1B8]/40 to-white rounded-3xl p-8 sm:p-10 border border-[#FDE68A] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-[#102A43] font-heading">
                  For Vehicle Partners &amp; Owners
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Have an idle or commercial vehicle? Find disciplined, verified drivers with vetted driving records, referees, and background checks.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Strict KYC verification of Kenyan Driving Licenses.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Structured, digitally signed operating agreements.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Direct M-PESA target remittance and tracking.
                  </li>
                </ul>
              </div>
              <Link href="/partner/listings/new" className="pt-4">
                <Button variant="soft-yellow" size="md" className="w-full font-bold">
                  List Your Vehicle Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. KDPA 2019 TRUST & SECURITY BANNER */}
      <section className="bg-[#102A43] text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6 text-[#DDF5E3]" />
              </div>
              <div>
                <h4 className="text-lg font-bold">Kenya Data Protection Act (KDPA 2019) Compliant</h4>
                <p className="text-xs text-slate-300">
                  Your identity documents and logbooks are encrypted in a private vault with time-limited signed access.
                </p>
              </div>
            </div>
            <Link href="/privacy">
              <Button variant="soft-green" size="sm" className="shrink-0 font-bold">
                Learn About Privacy &amp; Safety
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

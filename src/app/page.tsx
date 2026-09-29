'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VehicleCard } from '@/components/marketplace/VehicleCard';
import { marketplaceStore } from '@/lib/db/store';
import { useAuth } from '@/lib/auth/auth-context';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  Car,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  TrendingUp,
  Users,
  Building2,
  MapPin,
  Lock,
  PlusCircle,
} from 'lucide-react';

export default function HomePage() {
  const { role, driverProfile, isAuthenticated } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultRole, setAuthDefaultRole] = useState<'DRIVER' | 'PARTNER'>('DRIVER');

  useEffect(() => {
    setListings(marketplaceStore.getListings(driverProfile || undefined));
    setSavedIds([...marketplaceStore.savedListingIds]);

    const unsubscribe = marketplaceStore.subscribe(() => {
      setListings(marketplaceStore.getListings(driverProfile || undefined));
      setSavedIds([...marketplaceStore.savedListingIds]);
    });
    return unsubscribe;
  }, [driverProfile]);

  const featuredListings = listings.slice(0, 3);

  const openAuth = (targetRole: 'DRIVER' | 'PARTNER') => {
    setAuthDefaultRole(targetRole);
    setAuthModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#DCEEFF]/40 via-[#F8FAFC] to-[#F8FAFC] pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DDF5E3] border border-[#A7F3D0] text-[#065F46] text-xs font-bold tracking-wide">
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

                {isAuthenticated && role === 'PARTNER' ? (
                  <Link href="/partner/listings/new" className="w-full sm:w-auto">
                    <Button
                      variant="soft-yellow"
                      size="lg"
                      className="w-full sm:w-auto font-bold"
                      leftIcon={<Car className="w-5 h-5 text-[#92400E]" />}
                    >
                      Post Vehicle Listing
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="soft-yellow"
                    size="lg"
                    className="w-full sm:w-auto font-bold"
                    onClick={() => openAuth('PARTNER')}
                    leftIcon={<Car className="w-5 h-5 text-[#92400E]" />}
                  >
                    List My Vehicle
                  </Button>
                )}
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
                  <span className="block text-2xl font-black text-emerald-600">Nairobi</span>
                  <span className="text-xs text-slate-500 font-medium">Launch Market</span>
                </div>
              </div>
            </div>

            {/* Right Hero: Dynamic Clean Action Box */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-floating border border-slate-200/90 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Live Platform Status</span>
                  </div>
                  <Badge variant="verified" size="sm" icon="shield">
                    Zero Fraud Escrow
                  </Badge>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#DCEEFF] text-blue-700 flex items-center justify-center mx-auto">
                    <Car className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#102A43]">
                      {listings.length > 0 ? `${listings.length} Active Vehicles Available` : 'Start Your First Engagement'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {listings.length > 0
                        ? 'Explore live opportunities posted by verified vehicle partners in Nairobi.'
                        : 'Register your driver profile or list your commercial vehicle to connect immediately.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Link href="/vehicles" className="block">
                    <Button variant="primary" size="md" className="w-full">
                      Browse Available Vehicles
                    </Button>
                  </Link>
                  {!isAuthenticated && (
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full"
                      onClick={() => openAuth('DRIVER')}
                    >
                      Register as New Driver
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED VEHICLES OR ONBOARDING CTA */}
      <section className="py-16 bg-[#F8FAFC] border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" /> Nairobi Opportunities
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#102A43] font-heading">
                Marketplace Inventory
              </h2>
            </div>
            {listings.length > 0 && (
              <Link href="/vehicles">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View All ({listings.length})
                </Button>
              </Link>
            )}
          </div>

          {listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredListings.map((listing) => (
                <VehicleCard
                  key={listing.id}
                  listing={listing}
                  matchScorePct={listing.matchScorePct}
                  isSaved={savedIds.includes(listing.id)}
                  onSaveToggle={() => marketplaceStore.toggleSaveListing(listing.id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200/80 shadow-soft max-w-xl mx-auto space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
                <Car className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-[#102A43]">No Vehicles Listed Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Be the first vehicle owner to publish an opportunity in Nairobi, or register as a driver to receive matches as listings are added!
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  variant="soft-yellow"
                  size="md"
                  className="font-bold w-full sm:w-auto"
                  onClick={() => openAuth('PARTNER')}
                  leftIcon={<PlusCircle className="w-4 h-4 text-[#92400E]" />}
                >
                  List Your Vehicle
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="w-full sm:w-auto"
                  onClick={() => openAuth('DRIVER')}
                >
                  Register as Driver
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
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
            <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#DCEEFF] text-blue-700 flex items-center justify-center font-black text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-[#102A43]">Register &amp; Verify</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Drivers verify Kenyan DL &amp; PSV credentials. Vehicle partners submit NTSA logbook and insurance.
              </p>
            </div>

            <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF1B8] text-amber-900 flex items-center justify-center font-black text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-[#102A43]">Algorithmic Match</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our 7-factor engine pairs drivers and vehicles based on Nairobi zones, platform preference, and targets.
              </p>
            </div>

            <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#DDF5E3] text-emerald-800 flex items-center justify-center font-black text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-[#102A43]">Screen &amp; Chat</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Communicate safely once shortlisted. Align on operating hours, servicing schedules, and deposit terms.
              </p>
            </div>

            <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#102A43] text-white flex items-center justify-center font-black text-lg">
                4
              </div>
              <h3 className="text-lg font-bold text-[#102A43]">Sign &amp; Drive</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Digitally sign a structured commercial operating agreement. Start driving on Uber, Bolt, or Little.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KDPA 2019 TRUST BANNER */}
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

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultRole={authDefaultRole}
      />
    </div>
  );
}

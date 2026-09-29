'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { marketplaceStore } from '@/lib/db/store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatKes, formatDateEAT } from '@/lib/utils';
import {
  Car,
  Users,
  FileCheck2,
  TrendingUp,
  PlusCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function PartnerDashboardPage() {
  const { currentProfile, partnerProfile } = useAuth();
  const [vehicles, setVehicles] = useState(marketplaceStore.vehicles);
  const [listings, setListings] = useState(marketplaceStore.listings);
  const [applications, setApplications] = useState(marketplaceStore.applications);
  const [agreements, setAgreements] = useState(marketplaceStore.agreements);

  useEffect(() => {
    const unsubscribe = marketplaceStore.subscribe(() => {
      setVehicles([...marketplaceStore.vehicles]);
      setListings([...marketplaceStore.listings]);
      setApplications([...marketplaceStore.applications]);
      setAgreements([...marketplaceStore.agreements]);
    });
    return unsubscribe;
  }, []);

  const pendingApps = applications.filter(a => a.status === 'SUBMITTED' || a.status === 'VIEWED');

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Partner Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="yellow" size="sm" icon="shield">
                Verified Fleet Partner &bull; Apex Fleets Kenya
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-[#102A43] font-heading">
              Partner Fleet Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage your Nairobi vehicles, screen driver applicants, and track active agreements.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/partner/listings/new">
              <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4 text-[#FFF1B8]" />}>
                Post Vehicle Opportunity
              </Button>
            </Link>
          </div>
        </div>

        {/* Fleet KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Fleet Assets</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Car className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl font-black text-[#102A43] block">{vehicles.length} Vehicles</span>
            <span className="text-[11px] text-emerald-600 font-medium">100% NTSA Inspected</span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Listings</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl font-black text-[#102A43] block">{listings.length} Published</span>
            <span className="text-[11px] text-slate-500">In Nairobi Marketplace</span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Applicants</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl font-black text-blue-600 block">{pendingApps.length} Drivers</span>
            <Link href="/partner/applications" className="text-[11px] text-blue-600 font-bold hover:underline">
              Screen Applicants &rarr;
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Drivers</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl font-black text-emerald-700 block">{agreements.length} Active</span>
            <span className="text-[11px] text-emerald-600 font-medium">Daily M-PESA Target Tracking</span>
          </div>
        </div>

        {/* Section: Pending Driver Applications Screener */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-bold text-[#102A43]">Driver Screening Pipeline</h3>
              <p className="text-xs text-slate-500">Review experience, match compatibility scores, and cover notes.</p>
            </div>
            <Link href="/partner/applications">
              <Button variant="outline" size="sm">
                View All Applicants ({applications.length})
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {applications.length > 0 ? (
              applications.slice(0, 3).map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#102A43] text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-100 overflow-hidden shrink-0">
                      {app.driver?.avatarUrl ? (
                        <img src={app.driver.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        'DR'
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#102A43]">{app.driver?.fullName}</span>
                        <Badge variant="verified" size="sm" icon="check">Verified DL</Badge>
                        <Badge variant="match" size="sm">{app.matchScorePct}% Match</Badge>
                      </div>
                      <span className="text-xs text-slate-500 block">
                        Target: {app.listing?.title} &bull; {app.driver?.experienceYears} yrs exp &bull; {app.driver?.locationSubcounty || "Nairobi"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Link href="/partner/applications">
                      <Button variant="primary" size="sm">
                        Review &amp; Shortlist
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                No driver applications received yet. They will appear here once drivers apply to your listings.
              </div>
            )}
          </div>
        </div>

        {/* Section: Fleet Asset Inventory */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-bold text-[#102A43]">Fleet Asset Inventory</h3>
              <p className="text-xs text-slate-500">Track vehicle status, plates, and inspection status.</p>
            </div>
            <Link href="/partner/listings/new">
              <Button variant="soft-yellow" size="sm" className="font-bold">
                Add Vehicle
              </Button>
            </Link>
          </div>

          {vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {vehicles.map((v) => (
                <div key={v.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-200">
                    <img src={v.photos[0]} alt={v.make} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {v.registrationNumber}
                      </span>
                      <Badge variant="verified" size="sm">Verified</Badge>
                    </div>
                    <h4 className="font-bold text-sm text-[#102A43] mt-1">{v.make} {v.model} ({v.year})</h4>
                    <span className="text-[11px] text-slate-500 block">{v.primarySubcounty || "Nairobi"} &bull; {v.transmission}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500 space-y-3">
              <p>No vehicles registered in your fleet yet.</p>
              <Link href="/partner/listings/new">
                <Button variant="primary" size="sm">
                  Register Your First Vehicle
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

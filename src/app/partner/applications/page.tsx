'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { marketplaceStore } from '@/lib/db/store';
import { Application, ApplicationStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatKes, formatDateEAT } from '@/lib/utils';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  Phone,
  MessageSquare,
  ArrowRight,
  Smartphone,
  Lock,
  Search,
} from 'lucide-react';
import { ChatModal } from '@/components/chat/ChatModal';
import { MpesaModal } from '@/components/payments/MpesaModal';
import { DriverProfileModal } from '@/components/profile/DriverProfileModal';

export default function PartnerApplicationsPage() {
  const { currentProfile, partnerProfile, currentUser, isAuthenticated, role } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [activeChatApp, setActiveChatApp] = useState<Application | null>(null);
  const [viewingDriverApp, setViewingDriverApp] = useState<Application | null>(null);
  const [mpesaModalOpen, setMpesaModalOpen] = useState(false);
  const [unlockTargetAppId, setUnlockTargetAppId] = useState<string | null>(null);
  const [unlockedApps, setUnlockedApps] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const partnerId = partnerProfile?.id;
  const userId = currentProfile?.userId;

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const pid = partnerProfile?.id;
      const uid = currentProfile?.userId;

      const raw = marketplaceStore.applications.filter(a => {
        if (pid && a.partnerId === pid) return true;
        if (uid && a.partnerId === uid) return true;
        if (!pid && !uid) return true;
        return false;
      });

      // Enrich driver and listing details if needed
      const enriched = raw.map(app => {
        const listing = app.listing || marketplaceStore.listings.find(l => l.id === app.listingId);
        const driver = marketplaceStore.drivers.find(d => d.id === app.driverId);
        const driverProf = marketplaceStore.profiles.find(p => p.userId === driver?.userId);
        const driverUser = marketplaceStore.users.find(u => u.id === driver?.userId);
        return {
          ...app,
          listing: listing || app.listing,
          driver: {
            id: app.driver?.id || app.driverId,
            fullName: app.driver?.fullName || driverProf?.fullName || 'Verified Driver',
            experienceYears: app.driver?.experienceYears || driver?.drivingExperienceYears || 3,
            locationSubcounty: app.driver?.locationSubcounty || driverProf?.locationSubcounty || 'Nairobi',
            ratingAvg: app.driver?.ratingAvg || driver?.ratingAvg || 4.9,
            isVerified: app.driver?.isVerified ?? driver?.identityVerified ?? true,
            preferredPlatforms: app.driver?.preferredPlatforms || driver?.preferredPlatforms || ['Uber', 'Bolt'],
            phone: app.driver?.phone || driverUser?.phone,
            avatarUrl: app.driver?.avatarUrl || driverProf?.avatarUrl,
          },
        };
      });

      setApplications(enriched);
    };

    update();
    const unsubscribe = marketplaceStore.subscribe(update);
    return unsubscribe;
  }, [partnerId, userId, partnerProfile?.id, currentProfile?.userId]);

  const handleStatusChange = (appId: string, newStatus: ApplicationStatus, reason?: string) => {
    const reviewerId = currentProfile?.userId || '';
    marketplaceStore.updateApplicationStatus(appId, newStatus, reviewerId, reason);
  };

  const filteredApps = applications.filter(a => {
    if (activeFilter === 'PENDING' && !(a.status === 'SUBMITTED' || a.status === 'VIEWED')) return false;
    if (activeFilter === 'SHORTLISTED' && !(a.status === 'SHORTLISTED' || a.status === 'INTERVIEW')) return false;
    if (activeFilter === 'ACCEPTED' && a.status !== 'ACCEPTED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = a.driver?.fullName?.toLowerCase().includes(q);
      const matchListing = a.listing?.title?.toLowerCase().includes(q);
      const matchArea = a.driver?.locationSubcounty?.toLowerCase().includes(q) || a.listing?.subcounty?.toLowerCase().includes(q);
      return matchName || matchListing || matchArea;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-[#102A43] font-heading">
              Driver Screening Room
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Evaluate applicant experience scores, verified licenses, and manage the approval pipeline.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search applicants */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates by name, area..."
                className="pl-9 pr-3 py-1.5 text-xs rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#102A43] w-full sm:w-64"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm text-xs">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activeFilter === 'ALL' ? 'bg-[#102A43] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All ({applications.length})
              </button>
              <button
                onClick={() => setActiveFilter('PENDING')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activeFilter === 'PENDING' ? 'bg-[#102A43] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Pending Review
              </button>
              <button
                onClick={() => setActiveFilter('ACCEPTED')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activeFilter === 'ACCEPTED' ? 'bg-[#102A43] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Accepted
              </button>
            </div>
          </div>
        </div>

        {/* Applicants List */}
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const driverInitials = (app.driver?.fullName || 'Driver')
              .split(' ')
              .filter(Boolean)
              .map((n: string) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase() || 'DR';

            return (
              <div
                key={app.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft hover:shadow-card transition-all space-y-5"
              >
                {/* Applicant Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div
                    className="flex items-center gap-4 cursor-pointer group"
                    onClick={() => setViewingDriverApp(app)}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#102A43] text-white flex items-center justify-center font-bold text-sm ring-4 ring-blue-50 group-hover:ring-blue-200 transition-all overflow-hidden shrink-0">
                      {app.driver?.avatarUrl ? (
                        <img src={app.driver.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        driverInitials
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-black text-[#102A43] group-hover:text-blue-600 transition-colors">
                          {app.driver?.fullName}
                        </h3>
                        <Badge variant="verified" size="sm" icon="shield">Verified Driver</Badge>
                        <Badge variant="match" size="sm" icon="sparkles">{app.matchScorePct}% Match</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">
                          Applied for <strong>{app.listing?.title}</strong> &bull; {formatDateEAT(app.createdAt)}
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 underline">View Vetting Profile &amp; Documents &rarr;</span>
                      </div>
                    </div>
                  </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Status:</span>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-slate-100 text-slate-800">
                    {app.status}
                  </span>
                </div>
              </div>

              {/* Cover Note & Credentials */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <span className="font-bold text-slate-700 block">Driver Cover Letter / Introduction:</span>
                  <p className="text-slate-600 leading-relaxed italic">
                    &quot;{app.coverNote || 'Looking forward to driving your vehicle with highest diligence.'}&quot;
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <span className="font-bold text-slate-700 block">Vetting &amp; Contact:</span>
                  <ul className="space-y-1.5 text-slate-600">
                    <li>&bull; Experience: <strong>{app.driver?.experienceYears} Years</strong></li>
                    <li>&bull; Base: <strong>{app.driver?.locationSubcounty || 'Nairobi'}</strong></li>
                    <li>&bull; Rating: <strong>&starf; {app.driver?.ratingAvg || 4.9} / 5.0</strong></li>
                    <li>&bull; Platforms: <strong>{app.driver?.preferredPlatforms?.join(', ') || 'Uber, Bolt'}</strong></li>
                    <li className="pt-1 border-t border-slate-200">
                      {unlockedApps[app.id] ? (
                        <div className="flex items-center gap-2 text-emerald-700 font-bold">
                          <Phone className="w-3.5 h-3.5" />
                          <a href={`tel:${app.driver?.phone || '+254712345678'}`} className="hover:underline">
                            {app.driver?.phone || '+254 712 345 678'}
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-slate-400 text-[11px]">+254 7•• ••• ••</span>
                          <button
                            type="button"
                            onClick={() => {
                              setUnlockTargetAppId(app.id);
                              setMpesaModalOpen(true);
                            }}
                            className="px-2 py-1 bg-[#00A859] hover:bg-[#008f4c] text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <Smartphone className="w-3 h-3" /> Unlock (KES 300)
                          </button>
                        </div>
                      )}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Interactive State Machine Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500">
                  {app.status === 'ACCEPTED' ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Operating agreement created and sent to driver.
                    </span>
                  ) : (
                    <span>Advance candidate through the marketplace workflow.</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {app.status === 'SUBMITTED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(app.id, 'SHORTLISTED', 'Partner reviewed profile and shortlisted.')}
                    >
                      Shortlist Candidate
                    </Button>
                  )}

                  <Button
                    variant="soft-blue"
                    size="sm"
                    onClick={() => {
                      if (app.status === 'SUBMITTED') {
                        handleStatusChange(app.id, 'INTERVIEW', 'Interview and chat opened by partner.');
                      }
                      setActiveChatApp(app);
                    }}
                    leftIcon={<MessageSquare className="w-4 h-4 text-blue-600" />}
                  >
                    Chat with Driver
                  </Button>

                  {app.status !== 'ACCEPTED' && app.status !== 'REJECTED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusChange(app.id, 'ACCEPTED', 'Application accepted by partner.')}
                      leftIcon={<CheckCircle2 className="w-4 h-4 text-[#FFF1B8]" />}
                    >
                      Accept &amp; Generate Agreement
                    </Button>
                  )}

                  {app.status === 'ACCEPTED' && (
                    <Link href="/partner/agreements">
                      <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                        View Agreement Details
                      </Button>
                    </Link>
                  )}

                  {app.status !== 'REJECTED' && app.status !== 'ACCEPTED' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50"
                      onClick={() => handleStatusChange(app.id, 'REJECTED', 'Opportunity filled or terms mismatched.')}
                    >
                      Decline
                    </Button>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Real-time Direct Chat Modal */}
        {activeChatApp && (
          <ChatModal
            isOpen={!!activeChatApp}
            onClose={() => setActiveChatApp(null)}
            driverId={activeChatApp.driverId}
            partnerId={activeChatApp.partnerId}
            driverName={activeChatApp.driver?.fullName || 'Driver'}
            partnerName={activeChatApp.listing?.partner?.fullName || activeChatApp.partner?.fullName || currentProfile?.fullName || 'Vehicle Partner'}
            listingId={activeChatApp.listingId}
            listingTitle={activeChatApp.listing?.title}
            otherUserPhone={activeChatApp.driver?.phone}
          />
        )}

        <MpesaModal
          isOpen={mpesaModalOpen}
          onClose={() => setMpesaModalOpen(false)}
          serviceType="PARTNER_APPLICANT_UNLOCK"
          userId={currentProfile?.userId || ''}
          userRole="PARTNER"
          referenceId={unlockTargetAppId || undefined}
          defaultPhone={currentUser?.phone || ''}
          onSuccess={() => {
            if (unlockTargetAppId) {
              setUnlockedApps((prev) => ({ ...prev, [unlockTargetAppId]: true }));
            }
          }}
        />

        {viewingDriverApp && (
          <DriverProfileModal
            isOpen={!!viewingDriverApp}
            onClose={() => setViewingDriverApp(null)}
            driverId={viewingDriverApp.driverId}
            driverName={viewingDriverApp.driver?.fullName}
            avatarUrl={viewingDriverApp.driver?.avatarUrl}
            isUnlocked={!!unlockedApps[viewingDriverApp.id]}
            onUnlockSuccess={() => {
              setUnlockedApps((prev) => ({ ...prev, [viewingDriverApp.id]: true }));
            }}
          />
        )}
      </div>
    </div>
  );
}

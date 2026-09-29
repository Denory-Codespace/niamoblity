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
} from 'lucide-react';

export default function PartnerApplicationsPage() {
  const { currentProfile } = useAuth();
  const [applications, setApplications] = useState<Application[]>(marketplaceStore.applications);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  useEffect(() => {
    const unsubscribe = marketplaceStore.subscribe(() => {
      setApplications([...marketplaceStore.applications]);
    });
    return unsubscribe;
  }, []);

  const handleStatusChange = (appId: string, newStatus: ApplicationStatus, reason?: string) => {
    marketplaceStore.updateApplicationStatus(appId, newStatus, 'usr-partner-01', reason);
  };

  const filteredApps = applications.filter(a => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'PENDING') return a.status === 'SUBMITTED' || a.status === 'VIEWED';
    if (activeFilter === 'SHORTLISTED') return a.status === 'SHORTLISTED' || a.status === 'INTERVIEW';
    if (activeFilter === 'ACCEPTED') return a.status === 'ACCEPTED';
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

        {/* Applicants List */}
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft hover:shadow-card transition-all space-y-5"
            >
              {/* Applicant Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#102A43] text-white flex items-center justify-center font-bold text-sm ring-4 ring-blue-50 overflow-hidden shrink-0">
                    {app.driver?.avatarUrl ? (
                      <img src={app.driver.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      'DR'
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-[#102A43]">{app.driver?.fullName}</h3>
                      <Badge variant="verified" size="sm" icon="shield">Verified Driver</Badge>
                      <Badge variant="match" size="sm" icon="sparkles">{app.matchScorePct}% Match</Badge>
                    </div>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      Applied for <strong>{app.listing?.title}</strong> &bull; {formatDateEAT(app.createdAt)}
                    </span>
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
                  <span className="font-bold text-slate-700 block">Vetting Summary:</span>
                  <ul className="space-y-1 text-slate-600">
                    <li>&bull; Experience: <strong>{app.driver?.experienceYears} Years</strong></li>
                    <li>&bull; Base: <strong>{app.driver?.locationSubcounty || 'Nairobi'}</strong></li>
                    <li>&bull; Rating: <strong>&starf; {app.driver?.ratingAvg || 4.9} / 5.0</strong></li>
                    <li>&bull; Platforms: <strong>{app.driver?.preferredPlatforms?.join(', ') || 'Uber, Bolt'}</strong></li>
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

                  {(app.status === 'SUBMITTED' || app.status === 'SHORTLISTED') && (
                    <Button
                      variant="soft-blue"
                      size="sm"
                      onClick={() => handleStatusChange(app.id, 'INTERVIEW', 'Interview invited.')}
                    >
                      Invite to Interview / Chat
                    </Button>
                  )}

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
                    <Link href="/driver/agreements">
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
          ))}
        </div>
      </div>
    </div>
  );
}

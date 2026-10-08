'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { marketplaceStore } from '@/lib/db/store';
import { Application } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatKes, formatDateEAT } from '@/lib/utils';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { ChatModal } from '@/components/chat/ChatModal';

export default function DriverApplicationsPage() {
  const { driverProfile, isAuthenticated, role, loginAsRole } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeChatApp, setActiveChatApp] = useState<Application | null>(null);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      if (driverProfile) {
        setApplications(marketplaceStore.applications.filter(a => a.driverId === driverProfile.id));
      } else {
        setApplications([...marketplaceStore.applications]);
      }
    };
    update();
    const unsubscribe = marketplaceStore.subscribe(update);
    return unsubscribe;
  }, [driverProfile]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <Badge variant="neutral" icon="clock">Submitted</Badge>;
      case 'VIEWED':
        return <Badge variant="neutral" icon="clock">Viewed by Partner</Badge>;
      case 'SHORTLISTED':
        return <Badge variant="yellow" icon="sparkles">Shortlisted</Badge>;
      case 'INTERVIEW':
        return <Badge variant="match" icon="sparkles">Interview / Chat Open</Badge>;
      case 'ACCEPTED':
        return <Badge variant="verified" icon="check">Accepted 🎉</Badge>;
      case 'REJECTED':
        return <Badge variant="rejected" icon="alert">Declined</Badge>;
      case 'WITHDRAWN':
        return <Badge variant="neutral">Withdrawn</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  if (!isAuthenticated || role !== 'DRIVER') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto shadow-sm">
          <FileText className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-[#102A43]">Driver Sign-In Required</h2>
          <p className="text-slate-500 text-xs leading-relaxed">
            Sign in as a Driver to view and track your submitted vehicle applications.
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2.5">
          <Link href="/login">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
            >
              Sign In to Your Account
            </Button>
          </Link>
          <div className="flex items-center justify-center gap-4 text-xs pt-1">
            <span className="text-slate-400">No account?</span>
            <Link href="/register" className="font-bold text-blue-600 hover:underline">
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-[#102A43] font-heading">
              My Vehicle Applications
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Track the live review status and partner responses for your applications.
            </p>
          </div>
          <Link href="/vehicles">
            <Button variant="outline" size="sm">
              Browse More Cars
            </Button>
          </Link>
        </div>

        {/* Applications List */}
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft hover:shadow-card transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Application #{app.id} &bull; Applied {formatDateEAT(app.createdAt)}
                    </span>
                    <h3 className="text-lg font-bold text-[#102A43]">
                      {app.listing?.title || "Vehicle Opportunity"}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="match" size="sm">
                      {app.matchScorePct}% Match
                    </Badge>
                    {getStatusBadge(app.status)}
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-2xl">
                    <span className="text-slate-400 block font-medium mb-0.5">Vehicle Partner</span>
                    <span className="font-bold text-slate-800">{app.listing?.partner?.fullName || "David Kamau"}</span>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl">
                    <span className="text-slate-400 block font-medium mb-0.5">Target &amp; Deposit</span>
                    <span className="font-bold text-slate-800">
                      {formatKes(app.listing?.targetAmountKes)}/day &bull; Dep: {formatKes(app.listing?.depositAmountKes)}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl">
                    <span className="text-slate-400 block font-medium mb-0.5">Location</span>
                    <span className="font-bold text-slate-800">{app.listing?.county} ({app.listing?.subcounty || "Nairobi"})</span>
                  </div>
                </div>

                {/* Cover Note Snippet */}
                {app.coverNote && (
                  <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl text-xs text-slate-600">
                    <span className="font-bold text-slate-700 block mb-0.5">Your Note:</span>
                    &quot;{app.coverNote}&quot;
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-500">
                    {app.statusReason && <span>Status update: <strong className="text-slate-700">{app.statusReason}</strong></span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="soft-blue"
                      size="sm"
                      onClick={() => setActiveChatApp(app)}
                      leftIcon={<MessageSquare className="w-4 h-4 text-blue-600" />}
                    >
                      Chat with Partner
                    </Button>

                    {app.status === 'ACCEPTED' && (
                      <Link href="/driver/agreements">
                        <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4 text-[#FFF1B8]" />}>
                          View Operating Agreement
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#102A43]">No Applications Submitted Yet</h3>
              <p className="text-xs text-slate-500">
                Explore available vehicles in Nairobi and submit an application with your verified profile.
              </p>
            </div>
            <Link href="/vehicles">
              <Button variant="primary" size="sm">
                Explore Vehicles
              </Button>
            </Link>
          </div>
        )}

        {/* Real-time Direct Chat Modal */}
        {activeChatApp && (
          <ChatModal
            isOpen={!!activeChatApp}
            onClose={() => setActiveChatApp(null)}
            driverId={activeChatApp.driverId}
            partnerId={activeChatApp.partnerId}
            driverName={activeChatApp.driver?.fullName || 'Driver'}
            partnerName={activeChatApp.listing?.partner?.fullName || activeChatApp.partner?.fullName || 'Vehicle Partner'}
            listingId={activeChatApp.listingId}
            listingTitle={activeChatApp.listing?.title}
            otherUserPhone={activeChatApp.partner?.phone}
          />
        )}
      </div>
    </div>
  );
}

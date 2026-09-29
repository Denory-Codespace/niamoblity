'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldCheck,
  Search,
  FileCheck2,
  Car,
  Users,
  CheckCircle,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center space-y-3">
          <Badge variant="yellow" size="md">
            Product &amp; Workflow Architecture
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-[#102A43] font-heading">
            How nia mobility Works
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
            A comprehensive, trust-first guide to finding a verified driver or vehicle in Kenya.
          </p>
        </div>

        {/* Section 1: For Drivers vs For Partners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Driver Workflow */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#DCEEFF] text-blue-700 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#102A43]">The Driver Journey</h3>
                <span className="text-xs text-slate-500 font-medium">From Zero Vehicle to On-Road Earning</span>
              </div>
            </div>

            <ol className="space-y-4 text-xs text-slate-600">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 bg-blue-50 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-slate-900 block text-sm">KYC &amp; DL Verification</strong>
                  Submit your Kenyan National ID, valid DL, and PSV badge to gain the &quot;Verified Driver&quot; badge.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 bg-blue-50 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-slate-900 block text-sm">Deterministic Matching</strong>
                  Our 7-factor engine surfaces vehicles matching your preferred platforms (Uber, Bolt, Little) and target budget.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 bg-blue-50 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-slate-900 block text-sm">Direct Application &amp; Chat</strong>
                  Submit a customized cover note directly to vehicle owners. Chat safely once shortlisted.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 bg-blue-50 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                  4
                </span>
                <div>
                  <strong className="text-slate-900 block text-sm">Structured Digital Sign-off</strong>
                  Review clear terms for daily remittance, fuel, and servicing, then sign your digital agreement.
                </div>
              </li>
            </ol>

            <Link href="/vehicles" className="block pt-2">
              <Button variant="primary" size="md" className="w-full">
                Find Your Vehicle
              </Button>
            </Link>
          </div>

          {/* Partner Workflow */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF1B8] text-amber-900 flex items-center justify-center font-bold">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#102A43]">The Partner Journey</h3>
                <span className="text-xs text-slate-500 font-medium">Monetize Your Mobility Assets</span>
              </div>
            </div>

            <ol className="space-y-4 text-xs text-slate-600">
              <li className="flex gap-3">
                <span className="font-bold text-amber-700 bg-amber-50 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-slate-900 block text-sm">Fleet Asset Registration</strong>
                  Register your vehicle make, registration number, insurance, and NTSA inspection status.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-amber-700 bg-amber-50 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-slate-900 block text-sm">Publish Opportunity</strong>
                  Define your daily/weekly target (e.g., KES 2,800/day), deposit, and maintenance responsibilities.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-amber-700 bg-amber-50 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-slate-900 block text-sm">Screen Applicants</strong>
                  Review driver experience scores, ratings, and verified licenses in your partner dashboard.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-amber-700 bg-amber-50 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                  4
                </span>
                <div>
                  <strong className="text-slate-900 block text-sm">Deploy &amp; Remit</strong>
                  Accept application, generate agreement, hand over car, and collect daily remittance via M-PESA.
                </div>
              </li>
            </ol>

            <Link href="/partner/listings/new" className="block pt-2">
              <Button variant="soft-yellow" size="md" className="w-full font-bold">
                List a Vehicle
              </Button>
            </Link>
          </div>
        </div>

        {/* Section 2: Trust & Safety Pillars */}
        <div className="bg-[#102A43] text-white rounded-3xl p-8 sm:p-12 space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold font-heading">Our 4 Trust &amp; Safety Pillars</h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Built specifically to eliminate the traditional risks of Kenyan car-hire operations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Strict KYC Verification</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every driver DL and partner logbook is authenticated prior to badge award.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Algorithmic Matching</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Objective 7-factor scoring ensures realistic commercial expectations.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Audit Trail Agreements</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Immutable digital logs of all terms, dates, and sign-offs for legal clarity.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Two-Sided Reviews</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Verified reviews ensure disciplined drivers and responsible fleet owners thrive.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

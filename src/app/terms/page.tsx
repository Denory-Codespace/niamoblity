import React from 'react';
import { Badge } from '@/components/ui/Badge';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-soft">
        <div className="space-y-2 border-b border-slate-100 pb-6">
          <Badge variant="yellow" size="sm">
            Legal Terms of Service
          </Badge>
          <h1 className="text-3xl font-black text-[#102A43] font-heading">
            Terms of Service &amp; Marketplace Operating Rules
          </h1>
          <p className="text-xs text-slate-500">
            Last updated: January 2026 &bull; Developed by Denory Codespace
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#102A43]">1. Marketplace Facilitation Boundary</h2>
            <p className="text-xs text-slate-600">
              nia mobility is a technology marketplace connecting independent vehicle partners with verified professional drivers. nia mobility does not own vehicles, does not employ drivers, and does not operate as a digital transport dispatch operator (TNC).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#102A43]">2. Verification &amp; Roadworthiness Standards</h2>
            <p className="text-xs text-slate-600">
              Vehicle partners must ensure all listed vehicles maintain valid NTSA inspection certificates and commercial PSV comprehensive insurance. Drivers must possess an unexpired Kenyan driving license.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#102A43]">3. Digital Agreements &amp; Remittance</h2>
            <p className="text-xs text-slate-600">
              Operating agreements signed on the platform represent structured commercial agreements between the respective driver and partner.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

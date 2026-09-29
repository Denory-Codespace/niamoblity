import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-soft">
        <div className="space-y-2 border-b border-slate-100 pb-6">
          <Badge variant="verified" size="sm" icon="shield">
            Republic of Kenya &bull; KDPA 2019
          </Badge>
          <h1 className="text-3xl font-black text-[#102A43] font-heading">
            Privacy &amp; Document Security Policy
          </h1>
          <p className="text-xs text-slate-500">
            Last updated: January 2026 &bull; Developed by Denory Codespace
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#102A43]">1. Commitment to Kenya Data Protection Act, 2019</h2>
            <p className="text-xs text-slate-600">
              nia mobility operates in full compliance with the Kenya Data Protection Act, 2019. We process Personally Identifiable Information (PII) solely for the purpose of identity verification, road safety, and structured operating agreement facilitation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#102A43]">2. Statutory Document Storage &amp; Encryption</h2>
            <p className="text-xs text-slate-600">
              National IDs, Kenyan Driving Licenses, PSV Badges, Vehicle Logbooks, and Insurance certificates uploaded to nia mobility are stored in private, encrypted object vaults. No raw statutory documents are ever exposed publicly. Access is granted exclusively to authorized compliance personnel via time-limited (15-minute) signed cryptographic URLs.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#102A43]">3. Contact Number Privacy &amp; Masking</h2>
            <p className="text-xs text-slate-600">
              Personal telephone numbers are not publicly displayed on listings or marketplace searches. Phone and direct contact details are shared only after an application advances to shortlisted or interview stages with mutual consent.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#102A43]">4. User Rights (Access, Rectification &amp; Erasure)</h2>
            <p className="text-xs text-slate-600">
              Users retain the right to request a digital copy of their data, update incorrect records, or request account anonymization in accordance with statutory retention mandates.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

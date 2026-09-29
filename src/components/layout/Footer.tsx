import React from 'react';
import Link from 'next/link';
import { Car, ShieldCheck, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#102A43] text-white border-t border-slate-800 pt-12 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <Car className="w-5 h-5 text-[#FFF1B8]" />
              </div>
              <span className="text-xl font-black tracking-tight font-heading">
                nia<span className="text-blue-400">mobility</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Kenya&apos;s trusted marketplace connecting vehicle partners and professional drivers for digital mobility work in Nairobi and beyond.
            </p>
            <div className="pt-2 text-xs font-semibold text-[#FFF1B8]">
              &quot;Find a Car. Find a Driver. Drive &amp; Earn.&quot;
            </div>
          </div>

          {/* Col 2: For Drivers & Partners */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/vehicles" className="hover:text-white transition-colors">
                  Find a Vehicle
                </Link>
              </li>
              <li>
                <Link href="/driver/matches" className="hover:text-white transition-colors">
                  Algorithmic Matching
                </Link>
              </li>
              <li>
                <Link href="/partner/listings/new" className="hover:text-white transition-colors">
                  List Your Vehicle
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How Agreements Work
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Operational Regions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Supported Locations
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-1.5 font-medium text-emerald-400">
                <MapPin className="w-3.5 h-3.5" /> Nairobi (Active Launch Hub)
              </li>
              <li className="text-slate-400 pl-5">Kasarani &bull; Westlands &bull; Embakasi</li>
              <li className="text-slate-400 pl-5">CBD &bull; Kilimani &bull; Roysambu</li>
              <li className="text-slate-500 pl-5 pt-1 text-[11px]">Kiambu, Mombasa &amp; Kisumu (Expansion Ready)</li>
            </ul>
          </div>

          {/* Col 4: Trust & Compliance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Trust &amp; Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>KDPA 2019 Compliant</span>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy &amp; Document Security
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-white transition-colors">
                  Safety &amp; Verification Standards
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} <strong className="text-white">nia mobility</strong>. All rights reserved.
          </div>
          <div className="flex items-center gap-1 font-medium text-slate-300">
            <span>Built with precision by</span>
            <span className="text-[#FFF1B8] font-bold">Denory Codespace</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { marketplaceStore } from '@/lib/db/store';
import { useAuth } from '@/lib/auth/auth-context';
import { DocumentType, VerificationDocument } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDateEAT } from '@/lib/utils';
import {
  ShieldCheck,
  Upload,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  FileText,
} from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VerificationModal({ isOpen, onClose }: VerificationModalProps) {
  const { currentProfile, role, currentUser } = useAuth();
  const [docs, setDocs] = useState<VerificationDocument[]>([]);
  const [docType, setDocType] = useState<DocumentType>('NATIONAL_ID');
  const [docNumber, setDocNumber] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const isDriver = role === 'DRIVER';
  const userId = currentUser?.id || currentProfile?.userId || 'usr-temp';

  useEffect(() => {
    if (!isOpen) return;
    const update = () => {
      setDocs(marketplaceStore.getVerificationDocs(userId));
    };
    update();
    const unsubscribe = marketplaceStore.subscribe(update);
    return unsubscribe;
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber) return;

    setIsSubmitting(true);
    const mockFile = fileName || `${docType.toLowerCase()}_scan_${Date.now()}.pdf`;

    marketplaceStore.submitVerificationDocument({
      userId,
      documentType: docType,
      fileName: mockFile,
      documentNumber: docNumber,
    });

    setIsSubmitting(false);
    setDocNumber('');
    setFileName('');
    setSuccessMsg('Document successfully uploaded and queued for verification.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const getRequiredDocs = (): { type: DocumentType; label: string; desc: string }[] => {
    if (isDriver) {
      return [
        { type: 'NATIONAL_ID', label: 'Kenyan National ID', desc: 'Front and back scan of your National ID card' },
        { type: 'DRIVING_LICENSE', label: 'NTSA Driving License', desc: 'Valid Class B / PSV Smart DL' },
        { type: 'PSV_BADGE', label: 'PSV / Digital Mobility Badge', desc: 'NTSA PSV Driver Special Badge' },
        { type: 'POLICE_CLEARANCE', label: 'DCI Police Clearance Certificate', desc: 'Certificate of Good Conduct' },
      ];
    }
    return [
      { type: 'NATIONAL_ID', label: 'National ID / Passport', desc: 'Owner identity verification document' },
      { type: 'LOGBOOK', label: 'NTSA Vehicle Logbook', desc: 'Official proof of vehicle ownership or lease authority' },
      { type: 'COMMERCIAL_INSURANCE', label: 'PSV Commercial Insurance Certificate', desc: 'Valid comprehensive or commercial cover' },
      { type: 'INSPECTION_CERTIFICATE', label: 'NTSA Inspection Sticker / Report', desc: 'Roadworthiness inspection certificate' },
    ];
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 bg-[#102A43] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {isDriver ? 'Driver Verification & Trust Badge' : 'Partner & Asset Compliance'}
              </h3>
              <p className="text-xs text-slate-300">
                Kenya Data Protection Act (KDPA) 2019 encrypted document pipeline.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 bg-[#F8FAFC]">
          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Document Upload Form */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft space-y-4">
            <h4 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              Submit Document for Verification
            </h4>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Document Category
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as DocumentType)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                  >
                    {getRequiredDocs().map((item) => (
                      <option key={item.type} value={item.type}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Document / Certificate Number
                  </label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="e.g. ID No / DL No / Reg No"
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Scanned Copy / PDF
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50">
                  <input
                    type="file"
                    id="docFile"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  <label htmlFor="docFile" className="cursor-pointer block space-y-1">
                    <FileText className="w-6 h-6 text-slate-400 mx-auto" />
                    <span className="text-xs font-semibold text-blue-600 block">
                      {fileName ? fileName : 'Click to select PDF or image file (Max 10MB)'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      PNG, JPG, or PDF accepted
                    </span>
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center"
                disabled={isSubmitting}
              >
                Submit for Automated &amp; Admin Review
              </Button>
            </form>
          </div>

          {/* Uploaded Documents Status */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Submitted Documents &amp; Verification Status
            </h4>

            {docs.length === 0 ? (
              <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                No documents uploaded yet. Submit your documents above to unlock verified status and direct match priority.
              </div>
            ) : (
              <div className="space-y-2">
                {docs.map((d) => (
                  <div
                    key={d.id}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-slate-900">
                            {d.documentType.replace('_', ' ')}
                          </h5>
                          {d.documentNumber && (
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              #{d.documentNumber}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          Submitted {formatDateEAT(d.createdAt)} &bull; {d.fileName}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {d.status === 'VERIFIED' && (
                        <Badge variant="verified" size="sm" icon="shield">
                          Verified
                        </Badge>
                      )}
                      {d.status === 'UNDER_REVIEW' && (
                        <Badge variant="yellow" size="sm" icon="clock">
                          Under Review
                        </Badge>
                      )}
                      {d.status === 'REJECTED' && (
                        <Badge variant="rejected" size="sm" icon="alert">
                          Rejected
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Standard verification turnaround: &lt; 2 hours</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

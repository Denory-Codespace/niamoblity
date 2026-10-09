'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Agreement, Vehicle, DriverProfile, PartnerProfile } from '@/types';
import { marketplaceStore } from '@/lib/db/store';
import { useAuth } from '@/lib/auth/auth-context';
import { formatKes, formatDateEAT } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  Printer,
  PenTool,
  X,
  Car,
  User,
  Building2,
  AlertTriangle,
  RotateCcw,
  Check,
  Lock,
} from 'lucide-react';

interface AgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  agreement: Agreement;
  signerRole: 'PARTNER' | 'DRIVER';
  onSignedSuccess?: () => void;
}

export function AgreementModal({
  isOpen,
  onClose,
  agreement,
  signerRole,
  onSignedSuccess,
}: AgreementModalProps) {
  const { currentProfile, currentUser } = useAuth();
  const [signatureMode, setSignatureMode] = useState<'DRAW' | 'TYPE'>('DRAW');
  const [typedSignature, setTypedSignature] = useState(currentProfile?.fullName || '');
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  // Vehicle and participant details
  const listing = marketplaceStore.listings.find((l) => l.id === agreement.listingId);
  const vehicle =
    agreement.vehicle ||
    listing?.vehicle ||
    marketplaceStore.vehicles.find((v) => v.id === agreement.vehicleId);

  const partner = marketplaceStore.partners.find((p) => p.id === agreement.partnerId);
  const partnerProfile = marketplaceStore.profiles.find((p) => p.userId === partner?.userId);
  const partnerName = partnerProfile?.fullName || partner?.companyName || 'Verified Vehicle Partner';

  const driver = marketplaceStore.drivers.find((d) => d.id === agreement.driverId);
  const driverProfile = marketplaceStore.profiles.find((p) => p.userId === driver?.userId);
  const driverName = agreement.driverName || driverProfile?.fullName || 'Verified Driver';

  const isPartner = signerRole === 'PARTNER';
  const isDriver = signerRole === 'DRIVER';

  const alreadySigned =
    (isPartner && !!agreement.partnerSignedAt) || (isDriver && !!agreement.driverSignedAt);

  // Setup drawing canvas
  useEffect(() => {
    if (!isOpen || signatureMode !== 'DRAW') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [isOpen, signatureMode]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasDrawnSignature(true);
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  const handleExecuteSign = async () => {
    if (!agreedToTerms) return;
    setIsSubmitting(true);

    try {
      await marketplaceStore.signAgreement(agreement.id, signerRole);
      setIsSigned(true);
      if (onSignedSuccess) onSignedSuccess();
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1500);
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-[#102A43] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5 text-[#FFF1B8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Commercial Vehicle Operating Agreement</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-slate-200">
                  Kenya Legal Standard
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                Contract Ref: {agreement.id.toUpperCase().slice(0, 16)} &bull; Jurisdiction: Republic of Kenya
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Print / Save PDF"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Agreement Document Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 text-slate-800 text-xs sm:text-sm leading-relaxed bg-[#FAFCFF] print:p-0 print:bg-white">
          {/* Document Branding Header */}
          <div className="border-b-2 border-slate-900 pb-5 text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Nia Mobility Technologies Limited &bull; Verified Legal Master Contract</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#102A43] tracking-tight font-heading uppercase">
              Commercial Motor Vehicle Lease &amp; Operating Agreement
            </h1>
            <p className="text-xs text-slate-500 max-w-xl mx-auto">
              Governing commercial passenger transport, daily revenue remittances, vehicle maintenance allocations, and legal responsibilities under the Laws of Kenya.
            </p>
          </div>

          {/* Section 1: Parties */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              1. Contracting Parties
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200/60">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" /> PARTY A: VEHICLE OWNER (PARTNER)
                </span>
                <p className="font-semibold text-slate-800">{partnerName}</p>
                <p className="text-slate-500">Status: Verified Fleet Partner (Kenya)</p>
                <p className="text-slate-500">Registration / Base: {partnerProfile?.locationCounty || 'Nairobi County'}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200/60">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" /> PARTY B: PROFESSIONAL DRIVER (LESSEE)
                </span>
                <p className="font-semibold text-slate-800">{driverName}</p>
                <p className="text-slate-500">Credentials: NTSA Class B / PSV Certified</p>
                <p className="text-slate-500">Primary Zone: {driverProfile?.locationSubcounty || 'Nairobi Metropolitan'}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Subject Vehicle */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              2. Subject Vehicle Specifications
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Make &amp; Model</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : 'Mazda Demio 2020'}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Registration Plate</span>
                <p className="font-bold text-slate-800 font-mono mt-0.5">
                  {vehicle?.registrationNumber || 'KDD 123A'}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Transmission / Fuel</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {vehicle?.transmission || 'Automatic'} &bull; {vehicle?.fuelType || 'Petrol'}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Operating Territory</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {vehicle?.primaryCounty || 'Nairobi'} ({vehicle?.primarySubcounty || 'Westlands'})
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Commercial & Remittance Terms */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              3. Commercial Remittance &amp; Financial Terms
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-blue-700 uppercase">Agreed Remittance Target</span>
                <p className="text-base font-black text-[#102A43]">
                  {formatKes(agreement.targetAmountKes)}
                  <span className="text-xs font-normal text-slate-600"> / {agreement.paymentFrequency.toLowerCase()}</span>
                </p>
                <p className="text-[10px] text-slate-500">Cut-off time: 10:00 PM EAT daily via M-Pesa</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Security Deposit (Escrow)</span>
                <p className="text-base font-black text-slate-800">
                  {formatKes(agreement.depositAmountKes || 10000)}
                </p>
                <p className="text-[10px] text-slate-500">Refundable upon vehicle return</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Contract Duration</span>
                <p className="text-base font-black text-slate-800">Ongoing (Open)</p>
                <p className="text-[10px] text-slate-500">Subject to 48-hour mutual notice</p>
              </div>
            </div>
          </div>

          {/* Section 4: Operational Responsibilities */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-slate-400">
              4. Operational &amp; Maintenance Obligations
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-700">
              <li>
                <strong>Fuel Responsibilities:</strong> The Driver agrees to bear 100% of fuel costs required for vehicle operation.
              </li>
              <li>
                <strong>Mechanical Maintenance:</strong> The Partner warrants vehicle mechanical soundness and shall finance engine, gearbox, brake pads, and routine 5,000 km services.
              </li>
              <li>
                <strong>Driver Care &amp; Punctures:</strong> The Driver shall maintain vehicle cleanliness, daily fluid checks (oil &amp; coolant), and puncture repairs.
              </li>
              <li>
                <strong>Comprehensive Insurance:</strong> The Partner maintains a valid Comprehensive Commercial/PSV policy with passenger liability coverage.
              </li>
              <li>
                <strong>Traffic &amp; Council Fines:</strong> The Driver is personally responsible for any traffic violations, speeding tickets, or parking fines incurred during custody.
              </li>
              <li>
                <strong>GPS Tracking:</strong> The vehicle is equipped with active 24/7 telematics. Tampering with telematics constitutes immediate breach and repossession.
              </li>
            </ul>
          </div>

          {/* Section 5: Signatures Status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              5. Execution &amp; Digital Signatures
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Partner Signature Box */}
              <div className={`p-4 rounded-xl border ${agreement.partnerSignedAt ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Partner Execution</span>
                  {agreement.partnerSignedAt ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Check className="w-3 h-3" /> Signed &amp; Sealed
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">
                      Pending Partner Signature
                    </span>
                  )}
                </div>
                <div className="border-b border-dashed border-slate-300 py-3 text-center">
                  <span className="font-serif italic text-base text-slate-700">
                    {agreement.partnerSignedAt ? partnerName : '(Unsigned)'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  {agreement.partnerSignedAt ? `Executed on ${formatDateEAT(agreement.partnerSignedAt)}` : 'Awaiting signature'}
                </p>
              </div>

              {/* Driver Signature Box */}
              <div className={`p-4 rounded-xl border ${agreement.driverSignedAt ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Driver Execution</span>
                  {agreement.driverSignedAt ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Check className="w-3 h-3" /> Signed &amp; Sealed
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">
                      Pending Driver Signature
                    </span>
                  )}
                </div>
                <div className="border-b border-dashed border-slate-300 py-3 text-center">
                  <span className="font-serif italic text-base text-slate-700">
                    {agreement.driverSignedAt ? driverName : '(Unsigned)'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  {agreement.driverSignedAt ? `Executed on ${formatDateEAT(agreement.driverSignedAt)}` : 'Awaiting signature'}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Signing Pad (If current user has not signed yet) */}
          {!alreadySigned && !isSigned && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-[#102A43] flex items-center gap-1.5">
                    <PenTool className="w-4 h-4 text-blue-600" />
                    Sign Contract as {isPartner ? 'Vehicle Partner' : 'Professional Driver'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Draw your signature below or adopt a legal typed signature.
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setSignatureMode('DRAW')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      signatureMode === 'DRAW' ? 'bg-[#102A43] text-white' : 'text-slate-600'
                    }`}
                  >
                    Draw
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignatureMode('TYPE')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      signatureMode === 'TYPE' ? 'bg-[#102A43] text-white' : 'text-slate-600'
                    }`}
                  >
                    Type
                  </button>
                </div>
              </div>

              {signatureMode === 'DRAW' ? (
                <div className="space-y-2">
                  <div className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-white overflow-hidden shadow-inner">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={120}
                      className="w-full h-28 touch-none cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    {!hasDrawnSignature && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-300 text-xs font-semibold">
                        Sign here with finger or mouse
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                    >
                      <RotateCcw className="w-3 h-3" /> Clear Signature
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder="Type your full legal name"
                    className="w-full p-3 rounded-xl border border-slate-300 font-serif italic text-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                  />
                  <p className="text-[11px] text-slate-400">
                    Your typed full legal name serves as a binding electronic signature under KICA 2009.
                  </p>
                </div>
              )}

              {/* Legal Confirmation Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-slate-200">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#102A43] focus:ring-[#102A43]"
                />
                <span className="text-xs text-slate-700 leading-tight">
                  I confirm that I have reviewed the operating terms of this agreement and hereby execute my electronic signature pursuant to the Kenya Information and Communications Act (KICA 2009).
                </span>
              </label>
            </div>
          )}

          {isSigned && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-sm text-emerald-900">Agreement Successfully Signed!</h4>
              <p className="text-xs text-emerald-700">The counterparty and marketplace database have been notified.</p>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <Button variant="ghost" size="md" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Export Copy
            </Button>

            {!alreadySigned && !isSigned && (
              <Button
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                disabled={
                  !agreedToTerms ||
                  (signatureMode === 'DRAW' ? !hasDrawnSignature : !typedSignature.trim())
                }
                onClick={handleExecuteSign}
                leftIcon={<FileCheck2 className="w-4 h-4 text-[#FFF1B8]" />}
              >
                Sign &amp; Seal Agreement
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

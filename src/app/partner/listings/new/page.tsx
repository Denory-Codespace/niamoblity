'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { marketplaceStore } from '@/lib/db/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { NAIROBI_SUBCOUNTIES, generateUUID } from '@/lib/utils';
import {
  Car,
  PlusCircle,
  ShieldCheck,
  LogIn,
  AlertCircle,
  Camera,
  X,
  ImagePlus,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle2,
  Upload,
} from 'lucide-react';

export default function NewListingPage() {
  const router = useRouter();
  const { partnerProfile, currentProfile, currentUser, isAuthenticated, role } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear() - 2);
  const [regNumber, setRegNumber] = useState('');
  const [color, setColor] = useState('');
  const [transmission, setTransmission] = useState<'AUTOMATIC' | 'MANUAL'>('AUTOMATIC');
  const [fuelType, setFuelType] = useState<'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC'>('PETROL');
  const [vehicleType, setVehicleType] = useState<string>('SEDAN');
  const [subcounty, setSubcounty] = useState('Westlands');
  const [targetAmountKes, setTargetAmountKes] = useState(2500);
  const [depositAmountKes, setDepositAmountKes] = useState(10000);
  const [arrangementType, setArrangementType] = useState<'DAILY_TARGET' | 'WEEKLY_TARGET'>('DAILY_TARGET');
  const [description, setDescription] = useState('');
  const [minExp, setMinExp] = useState(2);
  const [photos, setPhotos] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Vehicle Compliance Documents (Logbook, Comprehensive Insurance, NTSA Inspection)
  const [logbookFileName, setLogbookFileName] = useState<string | null>(null);
  const [logbookUrl, setLogbookUrl] = useState<string | null>(null);
  const [insuranceFileName, setInsuranceFileName] = useState<string | null>(null);
  const [insuranceUrl, setInsuranceUrl] = useState<string | null>(null);
  const [inspectionFileName, setInspectionFileName] = useState<string | null>(null);
  const [inspectionUrl, setInspectionUrl] = useState<string | null>(null);

  const handleDocFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'LOGBOOK' | 'INSURANCE' | 'INSPECTION'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (type === 'LOGBOOK') {
        setLogbookFileName(file.name);
        setLogbookUrl(url);
      } else if (type === 'INSURANCE') {
        setInsuranceFileName(file.name);
        setInsuranceUrl(url);
      } else if (type === 'INSPECTION') {
        setInspectionFileName(file.name);
        setInspectionUrl(url);
      }
    };
    reader.readAsDataURL(file);
  };

  // Photo upload — base64 encode for immediate use
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = 4 - photos.length;
    const toProcess = files.slice(0, remaining);

    const newUrls: string[] = await Promise.all(
      toProcess.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target?.result as string);
            reader.readAsDataURL(file);
          })
      )
    );
    setPhotos((prev) => [...prev, ...newUrls]);
    if (e.target) e.target.value = '';
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (previewIndex >= next.length && next.length > 0) setPreviewIndex(next.length - 1);
      else if (next.length === 0) setPreviewIndex(0);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim() || !regNumber.trim()) {
      setErrorMessage('Please fill in the vehicle model and registration number.');
      return;
    }
    if (photos.length === 0) {
      setErrorMessage('Please upload at least one vehicle photo before publishing.');
      return;
    }
    if (!logbookFileName) {
      setErrorMessage('Vehicle Logbook is mandatory to prove ownership before posting a vehicle.');
      return;
    }
    if (!insuranceFileName) {
      setErrorMessage('Comprehensive Commercial/PSV Insurance certificate is mandatory before posting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let partnerId = partnerProfile?.id;
      if (!partnerId) {
        const found = marketplaceStore.partners.find(p => p.userId === currentUser?.id) || marketplaceStore.partners[0];
        partnerId = found?.id || generateUUID();
      }

      const partnerName = currentProfile?.fullName || 'Verified Vehicle Partner';
      const finalPhotos = photos;

      // Register vehicle compliance docs in store
      const userId = currentUser?.id || currentProfile?.userId || '';
      if (userId && logbookFileName) {
        marketplaceStore.submitVerificationDocument({
          userId,
          documentType: 'VEHICLE_LOGBOOK' as any,
          documentNumber: regNumber.trim().toUpperCase(),
          fileName: logbookFileName,
          fileUrl: logbookUrl || undefined,
        });
      }
      if (userId && insuranceFileName) {
        marketplaceStore.submitVerificationDocument({
          userId,
          documentType: 'INSURANCE_CERTIFICATE' as any,
          documentNumber: `INS-${Date.now().toString().slice(-6)}`,
          fileName: insuranceFileName,
          fileUrl: insuranceUrl || undefined,
        });
      }

      // 1. Add Vehicle
      const newVehicle = await marketplaceStore.addVehicle({
        partnerId,
        make,
        model: model.trim(),
        year,
        registrationNumber: regNumber.trim().toUpperCase(),
        vehicleType: vehicleType as any,
        transmission,
        fuelType,
        seatingCapacity: 4,
        color: color.trim() || 'White',
        primaryCounty: 'Nairobi',
        primarySubcounty: subcounty,
        supportedPlatforms: ['Uber', 'Bolt', 'Little'],
        photos: finalPhotos,
        verificationStatus: 'VERIFIED',
        availabilityStatus: 'AVAILABLE',
      });

      // 2. Add Listing
      await marketplaceStore.addListing({
        vehicleId: newVehicle.id,
        partnerId,
        title: `${make} ${model.trim()} ${year} - ${subcounty} Driver Opportunity`,
        description: description.trim(),
        county: 'Nairobi',
        subcounty,
        arrangementType,
        targetAmountKes,
        depositAmountKes,
        paymentFrequency: arrangementType === 'WEEKLY_TARGET' ? 'WEEKLY' : 'DAILY',
        fuelResponsibility: 'DRIVER',
        maintenanceResponsibility: 'PARTNER',
        insuranceResponsibility: 'PARTNER',
        preferredPlatforms: ['Uber', 'Bolt', 'Little'],
        driverMinExperienceYears: minExp,
        driverRequirementsSummary: 'Valid DL, Good conduct certificate, Nairobi resident.',
        availableFrom: new Date().toISOString(),
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString(),
        vehicle: newVehicle,
        partner: {
          id: partnerId,
          fullName: partnerName,
          ratingAvg: 5.0,
          ratingCount: 0,
          isVerified: true,
        },
      });

      setIsSubmitting(false);
      router.push('/partner/vehicles');
    } catch (err: any) {
      console.error(err);
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to publish vehicle listing.');
    }
  };

  if (!isAuthenticated || role !== 'PARTNER') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-16 px-4 flex justify-center items-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-soft text-center space-y-6">
          <div className="w-16 h-16 bg-amber-50 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Car className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#102A43] font-heading">Partner Account Required</h2>
            <p className="text-xs text-slate-500">Only verified Vehicle Partners can publish opportunities to the Nairobi driver marketplace.</p>
          </div>
          <Link href="/login">
            <Button variant="primary" size="lg" className="w-full justify-center" leftIcon={<LogIn className="w-4 h-4 text-[#FFF1B8]" />}>
              Sign In to Your Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="yellow" size="sm" icon="shield">Partner Vehicle Builder</Badge>
          </div>
          <h1 className="text-3xl font-black text-[#102A43] font-heading">Post a Vehicle Opportunity</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Publish your vehicle specifications, daily target, and driver requirements to the Nairobi marketplace.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-8">

          {/* SECTION 0: Photo Upload */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-500" />
              Vehicle Photos (up to 4)
            </h3>
            <p className="text-xs text-slate-500">
              Upload exterior, interior, and side photos to attract serious drivers. Clear, well-lit photos get 3× more enquiries.
            </p>

            {/* Photo preview carousel */}
            {photos.length > 0 && (
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-slate-100 group">
                <img
                  src={photos[previewIndex]}
                  alt={`Vehicle photo ${previewIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(previewIndex)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setPreviewIndex((i) => (i - 1 + photos.length) % photos.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow hover:bg-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewIndex((i) => (i + 1) % photos.length)}
                      className="absolute right-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow hover:bg-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPreviewIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === previewIndex ? 'bg-white scale-110' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
                <div className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/40 text-white px-2 py-0.5 rounded-full">
                  {previewIndex + 1} / {photos.length}
                </div>
              </div>
            )}

            {/* Thumbnail strip */}
            {photos.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {photos.map((p, i) => (
                  <div
                    key={i}
                    onClick={() => setPreviewIndex(i)}
                    className={`relative w-16 h-12 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${i === previewIndex ? 'border-[#102A43]' : 'border-transparent'}`}
                  >
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {photos.length < 4 && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2.5 px-5 py-2.5 border-2 border-dashed border-slate-300 rounded-2xl text-xs font-semibold text-slate-600 hover:border-[#102A43] hover:text-[#102A43] transition-colors w-full justify-center"
                >
                  <ImagePlus className="w-4 h-4" />
                  {photos.length === 0 ? 'Upload Vehicle Photos' : `Add More Photos (${4 - photos.length} remaining)`}
                </button>
                <p className="text-[10px] text-slate-400 mt-1 text-center">
                  Recommend: front exterior, rear, driver side, interior — JPG/PNG up to 10MB each
                </p>
              </div>
            )}
          </div>

          {/* SECTION 1: Vehicle Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              1. Vehicle Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Make</label>
                <select
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43]"
                >
                  <option>Toyota</option>
                  <option>Nissan</option>
                  <option>Honda</option>
                  <option>Mazda</option>
                  <option>Suzuki</option>
                  <option>Mitsubishi</option>
                  <option>Subaru</option>
                  <option>Hyundai</option>
                  <option>Volkswagen</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Model <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fielder, Axio, Demio"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Year of Manufacture</label>
                <input
                  type="number"
                  required
                  min={2012}
                  max={2026}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NTSA Registration Plate <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. KDD 123A"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Body Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                >
                  <option value="SEDAN">Sedan (Fielder / Axio / Premio)</option>
                  <option value="HATCHBACK">Hatchback (Note / Demio / Vitz)</option>
                  <option value="SUV">SUV / Crossover</option>
                  <option value="VAN">Van / Shuttle</option>
                  <option value="MINIBUS">Minibus / Matatu</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Color</label>
                <input
                  type="text"
                  placeholder="e.g. White, Silver, Black"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Transmission</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                >
                  <option value="AUTOMATIC">Automatic</option>
                  <option value="MANUAL">Manual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fuel Type</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                >
                  <option value="PETROL">Petrol</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="ELECTRIC">Electric (EV)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Vehicle Compliance Documents (Mandatory for Uber/Bolt & Nia) */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="border-b border-slate-100 pb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  2. Mandatory Vehicle Compliance Documents
                </h3>
                <span className="text-[10px] font-bold text-slate-400">NTSA &amp; Commercial Ride-Hailing Standard</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                To protect drivers and ensure legitimate ownership, logbook and commercial insurance must be provided prior to publication.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Logbook */}
              <div className={`p-4 rounded-2xl border ${logbookFileName ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'} space-y-2.5`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Vehicle Logbook <span className="text-red-500">*</span>
                  </span>
                  {logbookFileName ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Attached
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  {logbookFileName ? `File: ${logbookFileName}` : 'Clear scan or photo of NTSA logbook showing chassis & ownership'}
                </p>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#102A43] hover:bg-[#1f3f60] text-white text-xs font-bold rounded-xl transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{logbookFileName ? 'Replace Logbook' : 'Upload Logbook'}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => handleDocFile(e, 'LOGBOOK')}
                  />
                </label>
              </div>

              {/* 2. Insurance Certificate */}
              <div className={`p-4 rounded-2xl border ${insuranceFileName ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'} space-y-2.5`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Commercial / PSV Insurance <span className="text-red-500">*</span>
                  </span>
                  {insuranceFileName ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Attached
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  {insuranceFileName ? `File: ${insuranceFileName}` : 'Valid comprehensive or commercial passenger certificate/sticker'}
                </p>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#102A43] hover:bg-[#1f3f60] text-white text-xs font-bold rounded-xl transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{insuranceFileName ? 'Replace Insurance' : 'Upload Insurance'}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => handleDocFile(e, 'INSURANCE')}
                  />
                </label>
              </div>
            </div>

            {/* 3. NTSA Inspection (Optional) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span>NTSA Motor Inspection Report</span>
                  <span className="text-[10px] font-semibold text-slate-400">(Optional / Recommended)</span>
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {inspectionFileName ? `Attached: ${inspectionFileName}` : 'Annual inspection certificate for commercial vehicles'}
                </span>
              </div>
              <label className="cursor-pointer text-xs font-bold text-blue-600 hover:underline shrink-0">
                {inspectionFileName ? 'Change File' : 'Attach File'}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleDocFile(e, 'INSPECTION')}
                />
              </label>
            </div>
          </div>

          {/* SECTION 3: Commercial Terms */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              3. Commercial Target &amp; Terms (KES)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Arrangement Type</label>
                <select
                  value={arrangementType}
                  onChange={(e) => setArrangementType(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                >
                  <option value="DAILY_TARGET">Daily Target</option>
                  <option value="WEEKLY_TARGET">Weekly Target</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Amount ({arrangementType === 'WEEKLY_TARGET' ? 'Weekly' : 'Daily'} KES)
                </label>
                <input
                  type="number"
                  required
                  step={100}
                  value={targetAmountKes}
                  onChange={(e) => setTargetAmountKes(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Refundable Security Deposit (KES)</label>
                <input
                  type="number"
                  required
                  step={1000}
                  value={depositAmountKes}
                  onChange={(e) => setDepositAmountKes(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Min Driver Experience (Years)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={minExp}
                  onChange={(e) => setMinExp(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Operating Zone</label>
              <select
                value={subcounty}
                onChange={(e) => setSubcounty(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              >
                {NAIROBI_SUBCOUNTIES.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Listing Description &amp; Terms <span className="text-red-500">*</span></label>
              <textarea
                rows={4}
                required
                placeholder="Describe your vehicle's condition, any extras (tracker, insurance, etc.), your expectations of the driver, and any other relevant terms. Be honest and clear."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43]"
              />
              <p className="text-[10px] text-slate-400 mt-1">Drivers can read this before applying — clear listings attract better candidates.</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" size="md" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              leftIcon={<PlusCircle className="w-5 h-5 text-[#FFF1B8]" />}
            >
              Publish Opportunity to Nairobi Marketplace
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

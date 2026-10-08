'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { marketplaceStore } from '@/lib/db/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { NAIROBI_SUBCOUNTIES, generateUUID } from '@/lib/utils';
import { Car, PlusCircle, ShieldCheck, CheckCircle, LogIn, AlertCircle } from 'lucide-react';

export default function NewListingPage() {
  const router = useRouter();
  const { partnerProfile, currentProfile, currentUser, isAuthenticated, role, loginAsRole } = useAuth();

  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('Fielder');
  const [year, setYear] = useState(2018);
  const [regNumber, setRegNumber] = useState('KDG 789P');
  const [transmission, setTransmission] = useState<'AUTOMATIC' | 'MANUAL'>('AUTOMATIC');
  const [fuelType, setFuelType] = useState<'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC'>('PETROL');
  const [subcounty, setSubcounty] = useState('Westlands');
  const [targetAmountKes, setTargetAmountKes] = useState(2800);
  const [depositAmountKes, setDepositAmountKes] = useState(15000);
  const [arrangementType, setArrangementType] = useState<'DAILY_TARGET' | 'WEEKLY_TARGET'>('DAILY_TARGET');
  const [description, setDescription] = useState(
    'Well maintained vehicle with comprehensive insurance and tracker. Looking for a disciplined driver for Uber/Bolt in Nairobi.'
  );
  const [minExp, setMinExp] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let partnerId = partnerProfile?.id;
      if (!partnerId) {
        const found = marketplaceStore.partners.find(p => p.userId === currentUser?.id) || marketplaceStore.partners[0];
        partnerId = found?.id || generateUUID();
      }

      const partnerName = currentProfile?.fullName || 'Verified Vehicle Partner';

      // 1. Add Vehicle with verified UUID
      const newVehicle = await marketplaceStore.addVehicle({
        partnerId,
        make,
        model,
        year,
        registrationNumber: regNumber,
        vehicleType: 'SEDAN',
        transmission,
        fuelType,
        seatingCapacity: 4,
        color: 'White',
        primaryCounty: 'Nairobi',
        primarySubcounty: subcounty,
        supportedPlatforms: ['Uber', 'Bolt', 'Little'],
        photos: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80'],
        verificationStatus: 'VERIFIED',
        availabilityStatus: 'AVAILABLE',
      });

      // 2. Add Listing
      await marketplaceStore.addListing({
        vehicleId: newVehicle.id,
        partnerId,
        title: `${make} ${model} ${year} - ${subcounty} Driver Opportunity`,
        description,
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
      router.push('/vehicles');
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
            <h2 className="text-2xl font-black text-[#102A43] font-heading">
              Partner Account Required
            </h2>
            <p className="text-xs text-slate-500">
              Only verified Vehicle Partners can publish opportunities to the Nairobi driver marketplace.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link href="/login">
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center"
                leftIcon={<LogIn className="w-4 h-4 text-[#FFF1B8]" />}
              >
                Sign In to Your Account
              </Button>
            </Link>
            <div className="flex items-center justify-center gap-4 text-xs">
              <Link href="/register" className="font-bold text-blue-600 hover:underline">
                Register as Partner
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="yellow" size="sm" icon="shield">
              Partner Vehicle Builder
            </Badge>
          </div>
          <h1 className="text-3xl font-black text-[#102A43] font-heading">
            Post a Vehicle Opportunity
          </h1>
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

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
          {/* Section 1: Vehicle Details */}
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
                  <option value="Toyota">Toyota</option>
                  <option value="Nissan">Nissan</option>
                  <option value="Honda">Honda</option>
                  <option value="Mazda">Mazda</option>
                  <option value="Suzuki">Suzuki</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Model</label>
                <input
                  type="text"
                  required
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
                  min={2014}
                  max={2026}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NTSA Registration Plate</label>
                <input
                  type="text"
                  required
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. KDG 789P"
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

          {/* Section 2: Commercial Terms */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              2. Commercial Target &amp; Terms (KES)
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Listing Description &amp; Terms</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43]"
              />
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

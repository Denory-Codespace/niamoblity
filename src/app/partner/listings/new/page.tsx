'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { marketplaceStore } from '@/lib/db/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { NAIROBI_SUBCOUNTIES, VEHICLE_MAKE_MODELS } from '@/lib/utils';
import { Car, PlusCircle, ShieldCheck, CheckCircle } from 'lucide-react';

export default function NewListingPage() {
  const router = useRouter();
  const { partnerProfile } = useAuth();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      // 1. Add Vehicle
      const newVehicle = marketplaceStore.addVehicle({
        partnerId: partnerProfile?.id || 'prt-01',
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
      marketplaceStore.addListing({
        vehicleId: newVehicle.id,
        partnerId: partnerProfile?.id || 'prt-01',
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
          id: partnerProfile?.id || 'prt-01',
          fullName: 'David Kamau (Apex Fleets)',
          ratingAvg: 4.9,
          ratingCount: 32,
          isVerified: true,
        },
      });

      setIsSubmitting(false);
      router.push('/vehicles');
    }, 600);
  };

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
                  placeholder="e.g. Fielder, Axio, Demio, Note..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Registration Plate</label>
                <input
                  type="text"
                  required
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-[#102A43]"
                  placeholder="e.g. KDG 123X"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Year of Manufacture</label>
                <input
                  type="number"
                  required
                  min="2012"
                  max="2026"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43]"
                />
              </div>

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
                  <option value="HYBRID">Hybrid</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="ELECTRIC">Electric</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Commercial Terms */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              2. Commercial Arrangement &amp; Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Arrangement Type</label>
                <select
                  value={arrangementType}
                  onChange={(e) => setArrangementType(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                >
                  <option value="DAILY_TARGET">Daily Target (KES)</option>
                  <option value="WEEKLY_TARGET">Weekly Target (KES)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Amount (KES)</label>
                <input
                  type="number"
                  required
                  step="100"
                  value={targetAmountKes}
                  onChange={(e) => setTargetAmountKes(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold text-blue-700"
                  placeholder="e.g. 2800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Security Deposit (KES)</label>
                <input
                  type="number"
                  required
                  step="1000"
                  value={depositAmountKes}
                  onChange={(e) => setDepositAmountKes(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold"
                  placeholder="e.g. 15000"
                />
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

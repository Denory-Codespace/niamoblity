'use client';

import React, { useState } from 'react';
import { VehicleListing } from '@/types';
import { marketplaceStore } from '@/lib/db/store';
import { Button } from '@/components/ui/Button';
import { NAIROBI_SUBCOUNTIES, formatKes } from '@/lib/utils';
import { X, CheckCircle2, Sliders, DollarSign, MapPin, Fuel, Wrench, Shield, FileText } from 'lucide-react';

interface EditOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: VehicleListing;
  onUpdated?: () => void;
}

export function EditOpportunityModal({
  isOpen,
  onClose,
  listing,
  onUpdated,
}: EditOpportunityModalProps) {
  const [title, setTitle] = useState(listing.title);
  const [targetAmountKes, setTargetAmountKes] = useState(listing.targetAmountKes);
  const [depositAmountKes, setDepositAmountKes] = useState(listing.depositAmountKes || 0);
  const [arrangementType, setArrangementType] = useState(listing.arrangementType);
  const [subcounty, setSubcounty] = useState(listing.subcounty || 'Westlands');
  const [fuelResponsibility, setFuelResponsibility] = useState(listing.fuelResponsibility || 'DRIVER');
  const [maintenanceResponsibility, setMaintenanceResponsibility] = useState(listing.maintenanceResponsibility || 'PARTNER');
  const [insuranceResponsibility, setInsuranceResponsibility] = useState(listing.insuranceResponsibility || 'PARTNER');
  const [minExp, setMinExp] = useState(listing.driverMinExperienceYears || 1);
  const [description, setDescription] = useState(listing.description);
  const [status, setStatus] = useState(listing.status || 'PUBLISHED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await marketplaceStore.updateListing(listing.id, {
        title: title.trim(),
        targetAmountKes: Number(targetAmountKes),
        depositAmountKes: Number(depositAmountKes),
        arrangementType,
        subcounty,
        fuelResponsibility,
        maintenanceResponsibility,
        insuranceResponsibility,
        driverMinExperienceYears: Number(minExp),
        description: description.trim(),
        status,
      });
      setIsSubmitting(false);
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#102A43] text-white flex items-center justify-center shadow-md">
              <Sliders className="w-5 h-5 text-[#FFF1B8]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#102A43]">Edit Opportunity Parameters</h3>
              <p className="text-xs text-slate-500">Adjust hesabu targets, deposit, responsibilities and terms.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Opportunity Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Daily / Target Remittance (KES)</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={500}
                  step={50}
                  value={targetAmountKes}
                  onChange={(e) => setTargetAmountKes(Number(e.target.value))}
                  className="w-full text-xs p-3 pl-8 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43] font-bold"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">K</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Refundable Deposit (KES)</label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={depositAmountKes}
                  onChange={(e) => setDepositAmountKes(Number(e.target.value))}
                  className="w-full text-xs p-3 pl-8 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43]"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">K</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Arrangement Model</label>
              <select
                value={arrangementType}
                onChange={(e) => setArrangementType(e.target.value as any)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white"
              >
                <option value="DAILY_TARGET">Daily Target (Hesabu)</option>
                <option value="WEEKLY_TARGET">Weekly Target</option>
                <option value="REVENUE_SHARE">Revenue Share</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Operating Subcounty</label>
              <select
                value={subcounty}
                onChange={(e) => setSubcounty(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white"
              >
                {NAIROBI_SUBCOUNTIES.map((sc) => (
                  <option key={sc} value={sc}>{sc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Listing Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white font-bold"
              >
                <option value="PUBLISHED">Active &bull; Published</option>
                <option value="PAUSED">Paused &bull; Hidden</option>
                <option value="HIRED">Hired &bull; In Service</option>
                <option value="CLOSED">Closed &bull; Archived</option>
              </select>
            </div>
          </div>

          {/* Operational Responsibilities */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <span className="text-xs font-bold text-[#102A43] block">Operational Responsibilities</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fuel</label>
                <select
                  value={fuelResponsibility}
                  onChange={(e) => setFuelResponsibility(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="DRIVER">Driver Pays</option>
                  <option value="PARTNER">Partner Pays</option>
                  <option value="SHARED">Shared (50/50)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Maintenance</label>
                <select
                  value={maintenanceResponsibility}
                  onChange={(e) => setMaintenanceResponsibility(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="PARTNER">Partner Pays</option>
                  <option value="DRIVER">Driver Pays</option>
                  <option value="SHARED">Shared</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Insurance</label>
                <select
                  value={insuranceResponsibility}
                  onChange={(e) => setInsuranceResponsibility(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="PARTNER">Partner Covers</option>
                  <option value="DRIVER">Driver Covers</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Opportunity Description &amp; Requirements</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-4 h-4 text-[#FFF1B8]" />}
            >
              Save Parameters
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

// ==============================================================================
// nia mobility - Partner Vehicle Fleet Management (CRUD)
// Developed by Denory Codespace
// ==============================================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { marketplaceStore } from '@/lib/db/store';
import { Vehicle, FuelType, TransmissionType } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Car,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
  Gauge,
  Fuel,
  MapPin,
  Save,
  ChevronRight,
  ChevronLeft,
  Eye,
  Camera,
  Search,
  FileText,
  ShieldCheck,
  Download,
} from 'lucide-react';

export default function PartnerVehiclesPage() {
  const { partnerProfile, currentUser } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  const [viewPhotoIndex, setViewPhotoIndex] = useState(0);
  const [viewingDocUrl, setViewingDocUrl] = useState<{ url: string; name: string } | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const partnerId = partnerProfile?.id;

  useEffect(() => {
    const update = () => {
      if (partnerId) {
        setVehicles(marketplaceStore.vehicles.filter((v) => v.partnerId === partnerId));
      } else {
        setVehicles(marketplaceStore.vehicles);
      }
    };

    update();
    const unsub = marketplaceStore.subscribe(update);
    return unsub;
  }, [partnerId]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotificationMsg({ type, text });
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleEditClick = (v: Vehicle) => {
    setEditingVehicle({ ...v });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    setIsSaving(true);
    try {
      await marketplaceStore.updateVehicle(editingVehicle.id, {
        make: editingVehicle.make,
        model: editingVehicle.model,
        year: Number(editingVehicle.year),
        registrationNumber: editingVehicle.registrationNumber,
        vehicleType: editingVehicle.vehicleType,
        transmission: editingVehicle.transmission,
        fuelType: editingVehicle.fuelType,
        color: editingVehicle.color,
        mileageKm: editingVehicle.mileageKm ? Number(editingVehicle.mileageKm) : undefined,
        primaryCounty: editingVehicle.primaryCounty,
        primarySubcounty: editingVehicle.primarySubcounty,
        availabilityStatus: editingVehicle.availabilityStatus,
      });

      showNotification('success', `Vehicle ${editingVehicle.registrationNumber} updated successfully!`);
      setEditingVehicle(null);
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to update vehicle');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to remove this vehicle from your fleet?')) return;
    setIsDeletingId(vehicleId);
    try {
      await marketplaceStore.deleteVehicle(vehicleId);
      showNotification('success', 'Vehicle removed from your fleet.');
    } catch (err: any) {
      showNotification('error', 'Failed to delete vehicle.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return (
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.registrationNumber.toLowerCase().includes(q) ||
      (v.primarySubcounty && v.primarySubcounty.toLowerCase().includes(q)) ||
      v.availabilityStatus.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link href="/partner/dashboard" className="hover:text-[#102A43]">
                Partner Portal
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#102A43]">Fleet Management</span>
            </div>
            <h1 className="text-3xl font-black text-[#102A43] font-heading">
              Vehicle Fleet Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage your registered assets, update specifications, and track active deployments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/partner/listings/new">
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4 text-[#FFF1B8]" />}
                className="shadow-md"
              >
                Add / Post Vehicle
              </Button>
            </Link>
          </div>
        </div>

        {/* Notification Toast */}
        {notificationMsg && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 border animate-in fade-in duration-200 ${
              notificationMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {notificationMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-semibold">{notificationMsg.text}</span>
          </div>
        )}

        {/* Stats summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
            <span className="text-xs font-bold text-slate-400 block mb-1">TOTAL FLEET</span>
            <span className="text-2xl font-black text-[#102A43]">{vehicles.length}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
            <span className="text-xs font-bold text-emerald-600 block mb-1">AVAILABLE</span>
            <span className="text-2xl font-black text-emerald-600">
              {vehicles.filter((v) => v.availabilityStatus === 'AVAILABLE').length}
            </span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
            <span className="text-xs font-bold text-blue-600 block mb-1">ASSIGNED</span>
            <span className="text-2xl font-black text-blue-600">
              {vehicles.filter((v) => v.availabilityStatus === 'ASSIGNED').length}
            </span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
            <span className="text-xs font-bold text-amber-600 block mb-1">MAINTENANCE</span>
            <span className="text-2xl font-black text-amber-600">
              {vehicles.filter((v) => v.availabilityStatus === 'MAINTENANCE').length}
            </span>
          </div>
        </div>

        {/* Fleet Search Bar */}
        {vehicles.length > 0 && (
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search fleet by make, model, registration plate (e.g. Demio, KDD 123A)..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#102A43] shadow-soft"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Vehicles List */}
        <div className="space-y-4">
          {vehicles.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-soft space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Car className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#102A43]">No Vehicles in Fleet</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  You have not registered any vehicles yet. Post a vehicle opportunity to add your first asset to the marketplace.
                </p>
              </div>
              <Link href="/partner/listings/new">
                <Button variant="primary" leftIcon={<Plus className="w-4 h-4 text-[#FFF1B8]" />}>
                  Post Your First Vehicle
                </Button>
              </Link>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-soft space-y-2">
              <p className="text-sm font-bold text-slate-700">No fleet vehicles match &ldquo;{searchTerm}&rdquo;</p>
              <button onClick={() => setSearchTerm('')} className="text-xs text-blue-600 font-bold underline">
                Clear search filter
              </button>
            </div>
          ) : (
            filteredVehicles.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft hover:shadow-card hover:scale-[1.01] transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start sm:items-center gap-4 cursor-pointer" onClick={() => { setViewingVehicle(v); setViewPhotoIndex(0); }}>
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                    {v.photos && v.photos[0] ? (
                      <img src={v.photos[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Car className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-[#102A43]">
                        {v.make} {v.model} ({v.year})
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-amber-50 text-amber-800 border border-amber-200">
                        {v.registrationNumber}
                      </span>
                      <Badge
                        variant={
                          v.availabilityStatus === 'AVAILABLE'
                            ? 'verified'
                            : v.availabilityStatus === 'ASSIGNED'
                            ? 'match'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {v.availabilityStatus}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-slate-400" />
                        {v.transmission}
                      </span>
                      <span className="flex items-center gap-1">
                        <Fuel className="w-3.5 h-3.5 text-slate-400" />
                        {v.fuelType}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {v.primaryCounty}
                        {v.primarySubcounty ? `, ${v.primarySubcounty}` : ''}
                      </span>
                      <span>Color: {v.color}</span>
                      {v.photos && v.photos.length > 0 && (
                        <span className="flex items-center gap-1 text-blue-500">
                          <Camera className="w-3.5 h-3.5" />
                          {v.photos.length} photo{v.photos.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setViewingVehicle(v); setViewPhotoIndex(0); }}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(v)}
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:bg-rose-50"
                    disabled={isDeletingId === v.id}
                    onClick={() => handleDelete(v.id)}
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    {isDeletingId === v.id ? 'Removing...' : 'Delete'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Vehicle Detail View Modal */}
        {viewingVehicle && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
              {/* Photo Carousel */}
              <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden rounded-t-3xl">
                {viewingVehicle.photos && viewingVehicle.photos.length > 0 ? (
                  <img
                    src={viewingVehicle.photos[viewPhotoIndex]}
                    alt="Vehicle"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="w-16 h-16 text-slate-300" />
                  </div>
                )}
                {viewingVehicle.photos && viewingVehicle.photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setViewPhotoIndex(i => (i - 1 + (viewingVehicle.photos?.length || 1)) % (viewingVehicle.photos?.length || 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow hover:bg-white"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewPhotoIndex(i => (i + 1) % (viewingVehicle.photos?.length || 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow hover:bg-white"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {viewingVehicle.photos?.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setViewPhotoIndex(i)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            i === viewPhotoIndex ? 'bg-white scale-125' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="absolute bottom-3 right-3 text-[10px] font-bold bg-black/40 text-white px-2 py-0.5 rounded-full">
                      {viewPhotoIndex + 1} / {viewingVehicle.photos?.length}
                    </div>
                  </>
                )}
                <button
                  onClick={() => setViewingVehicle(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-slate-700 hover:bg-white shadow"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute top-3 left-3">
                  <Badge
                    variant={viewingVehicle.availabilityStatus === 'AVAILABLE' ? 'verified' : viewingVehicle.availabilityStatus === 'ASSIGNED' ? 'match' : 'neutral'}
                    size="sm"
                  >
                    {viewingVehicle.availabilityStatus}
                  </Badge>
                </div>
              </div>

              {/* Thumbnail strip */}
              {viewingVehicle.photos && viewingVehicle.photos.length > 1 && (
                <div className="px-5 pt-3 flex gap-2 overflow-x-auto no-scrollbar">
                  {viewingVehicle.photos.map((p, i) => (
                    <div
                      key={i}
                      onClick={() => setViewPhotoIndex(i)}
                      className={`shrink-0 w-14 h-10 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        i === viewPhotoIndex ? 'border-[#102A43]' : 'border-transparent'
                      }`}
                    >
                      <img src={p} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Vehicle Info */}
              <div className="p-5 sm:p-6 space-y-4">
                <div>
                  <h2 className="text-xl font-black text-[#102A43]">
                    {viewingVehicle.make} {viewingVehicle.model} ({viewingVehicle.year})
                  </h2>
                  <p className="text-xs text-slate-500 font-mono font-bold">{viewingVehicle.registrationNumber}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Transmission', value: viewingVehicle.transmission },
                    { label: 'Fuel Type', value: viewingVehicle.fuelType },
                    { label: 'Color', value: viewingVehicle.color },
                    { label: 'Base County', value: viewingVehicle.primaryCounty },
                    { label: 'Sub-County', value: viewingVehicle.primarySubcounty || '—' },
                    { label: 'Seating', value: `${viewingVehicle.seatingCapacity || 4} Seats` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Uploaded Compliance Documents Tracker */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#102A43] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Uploaded Documents &amp; Verification Progress
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">NTSA Standard</span>
                  </div>

                  {(() => {
                    const docs = marketplaceStore.verificationDocs.filter(d =>
                      (d.documentNumber && viewingVehicle.registrationNumber &&
                        d.documentNumber.toUpperCase() === viewingVehicle.registrationNumber.toUpperCase()) ||
                      d.userId === currentUser?.id ||
                      d.userId === partnerProfile?.userId
                    );

                    if (docs.length === 0) {
                      return (
                        <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 text-center">
                          No uploaded documents attached to this vehicle yet.
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-1.5">
                        {docs.map(doc => {
                          const isVerified = doc.status === 'VERIFIED';
                          const isRejected = doc.status === 'REJECTED';
                          const typeLabel = (doc.documentType as string) === 'LOGBOOK' || (doc as any).documentType === 'VEHICLE_LOGBOOK'
                            ? 'NTSA Vehicle Logbook'
                            : (doc.documentType as string) === 'COMMERCIAL_INSURANCE' || (doc as any).documentType === 'INSURANCE' || (doc as any).documentType === 'INSURANCE_CERTIFICATE'
                            ? 'Commercial PSV Insurance'
                            : (doc.documentType as string) === 'INSPECTION_CERTIFICATE'
                            ? 'NTSA Inspection Certificate'
                            : doc.documentType.replace(/_/g, ' ');

                          return (
                            <div
                              key={doc.id}
                              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-bold text-[#102A43] truncate">{typeLabel}</p>
                                  <p className="text-[10px] text-slate-400 truncate">{doc.fileName}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <Badge
                                  variant={isVerified ? 'verified' : isRejected ? 'rejected' : 'yellow'}
                                  size="sm"
                                >
                                  {isVerified ? 'Approved' : isRejected ? 'Action Needed' : 'In Review'}
                                </Badge>
                                {doc.fileUrl && (
                                  <button
                                    type="button"
                                    onClick={() => setViewingDocUrl({ url: doc.fileUrl!, name: doc.fileName })}
                                    className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-[#102A43] rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                                  >
                                    <Eye className="w-3 h-3 text-blue-600" /> View
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setEditingVehicle(viewingVehicle); setViewingVehicle(null); }}
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    className="flex-1"
                  >
                    Edit Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:bg-rose-50 flex-1"
                    disabled={isDeletingId === viewingVehicle.id}
                    onClick={() => { handleDelete(viewingVehicle.id); setViewingVehicle(null); }}
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Delete Vehicle
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {editingVehicle && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#102A43]">Edit Vehicle Details</h3>
                    <p className="text-xs text-slate-500">Update specifications and operating county</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingVehicle(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Make</label>
                    <input
                      type="text"
                      value={editingVehicle.make}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, make: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Model</label>
                    <input
                      type="text"
                      value={editingVehicle.model}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, model: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
                    <input
                      type="number"
                      value={editingVehicle.year}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, year: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Plate Number</label>
                    <input
                      type="text"
                      value={editingVehicle.registrationNumber}
                      onChange={(e) =>
                        setEditingVehicle({ ...editingVehicle, registrationNumber: e.target.value.toUpperCase() })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Transmission</label>
                    <select
                      value={editingVehicle.transmission}
                      onChange={(e) =>
                        setEditingVehicle({ ...editingVehicle, transmission: e.target.value as TransmissionType })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                    >
                      <option value="AUTOMATIC">AUTOMATIC</option>
                      <option value="MANUAL">MANUAL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Fuel Type</label>
                    <select
                      value={editingVehicle.fuelType}
                      onChange={(e) =>
                        setEditingVehicle({ ...editingVehicle, fuelType: e.target.value as FuelType })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                    >
                      <option value="PETROL">PETROL</option>
                      <option value="DIESEL">DIESEL</option>
                      <option value="HYBRID">HYBRID</option>
                      <option value="ELECTRIC">ELECTRIC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                    <select
                      value={editingVehicle.availabilityStatus}
                      onChange={(e) =>
                        setEditingVehicle({ ...editingVehicle, availabilityStatus: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Primary County</label>
                    <input
                      type="text"
                      value={editingVehicle.primaryCounty || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, primaryCounty: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subcounty / Base</label>
                    <input
                      type="text"
                      value={editingVehicle.primarySubcounty || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, primarySubcounty: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button variant="outline" type="button" onClick={() => setEditingVehicle(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSaving}
                    leftIcon={<Save className="w-4 h-4 text-[#FFF1B8]" />}
                  >
                    {isSaving ? 'Saving Changes...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Document Preview Lightbox Modal */}
        {viewingDocUrl && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setViewingDocUrl(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                  <span className="font-bold text-sm text-[#102A43] truncate">{viewingDocUrl.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = viewingDocUrl.url;
                      a.download = viewingDocUrl.name || 'compliance-doc.pdf';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    className="px-3 py-1.5 bg-[#102A43] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-blue-900 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingDocUrl(null)}
                    className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 flex-1 overflow-auto flex items-center justify-center min-h-[300px] bg-slate-100">
                {viewingDocUrl.url.startsWith('data:image/') || viewingDocUrl.url.endsWith('.jpg') || viewingDocUrl.url.endsWith('.png') || viewingDocUrl.url.endsWith('.jpeg') ? (
                  <img src={viewingDocUrl.url} alt={viewingDocUrl.name} className="max-h-[60vh] max-w-full object-contain rounded-xl" />
                ) : (
                  <div className="text-center p-8 space-y-3">
                    <FileText className="w-16 h-16 text-blue-500 mx-auto" />
                    <p className="font-bold text-slate-800 text-sm">{viewingDocUrl.name}</p>
                    <p className="text-xs text-slate-500">Document ready for download and verification inspect.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

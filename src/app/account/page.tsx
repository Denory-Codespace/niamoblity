
'use client';

// ==============================================================================
// nia mobility – Account Settings & Profile CRUD
// Developed by Denory Codespace
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { marketplaceStore } from '@/lib/db/store';
import { NAIROBI_SUBCOUNTIES } from '@/lib/utils';
import {
  User,
  Phone,
  MapPin,
  Save,
  LogOut,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  ShieldCheck,
  Car,
  FileText,
  X,
} from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const { currentUser, currentProfile, driverProfile, partnerProfile, role, logout, isAuthenticated } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [locationCounty, setLocationCounty] = useState('Nairobi');
  const [locationSubcounty, setLocationSubcounty] = useState('');

  useEffect(() => {
    if (currentProfile) {
      setFullName(currentProfile.fullName || '');
      setBio(currentProfile.bio || '');
      setLocationCounty(currentProfile.locationCounty || 'Nairobi');
      setLocationSubcounty(currentProfile.locationSubcounty || '');
    }
    if (currentUser) {
      setPhone(currentUser.phone || '');
    }
  }, [currentProfile, currentUser]);

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 shadow-soft border border-slate-200 text-center max-w-sm w-full space-y-4">
          <User className="w-10 h-10 text-slate-400 mx-auto" />
          <h2 className="text-xl font-black text-[#102A43] font-heading">Sign In Required</h2>
          <p className="text-xs text-slate-500">Please sign in to access your account settings.</p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-2.5 bg-[#102A43] text-white text-sm font-bold rounded-xl"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    try {
      await marketplaceStore.updateProfile(currentUser.id, {
        fullName: fullName.trim(),
        bio: bio.trim(),
        locationCounty,
        locationSubcounty,
        phone: phone.trim(),
      });
      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput.trim().toLowerCase() !== 'delete my account') return;
    setIsDeleting(true);
    try {
      await marketplaceStore.deleteUserAccount(currentUser.id, currentUser.role as any);
      logout();
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  const roleLabel = role === 'DRIVER' ? 'Driver' : 'Vehicle Partner';
  const dashboardLink = role === 'DRIVER' ? '/driver/applications' : '/partner/dashboard';
  const memberSince = new Date(currentUser.createdAt).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#102A43] font-heading">Account Settings</h1>
          <p className="text-sm text-slate-500">Manage your profile, contact details, and account preferences.</p>
        </div>

        {/* Success / Error Alerts */}
        {successMsg && (
          <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
          <div className="bg-gradient-to-r from-[#102A43] to-[#1a3a5c] px-6 py-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner">
              {role === 'DRIVER'
                ? <Car className="w-7 h-7 text-white" />
                : <FileText className="w-7 h-7 text-white" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-black text-lg truncate">{currentProfile?.fullName || 'Your Name'}</h2>
              <p className="text-white/70 text-xs font-medium">{roleLabel} &middot; Member since {memberSince}</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Edit profile"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="07XX XXX XXX"
                        className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">County</label>
                    <select
                      value={locationCounty}
                      onChange={e => setLocationCounty(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43] focus:outline-none"
                    >
                      <option value="Nairobi">Nairobi</option>
                      <option value="Kiambu">Kiambu</option>
                      <option value="Machakos">Machakos</option>
                      <option value="Kajiado">Kajiado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sub-County / Area</label>
                    <select
                      value={locationSubcounty}
                      onChange={e => setLocationSubcounty(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43] focus:outline-none"
                    >
                      <option value="">Select area</option>
                      {NAIROBI_SUBCOUNTIES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bio / About You</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder={role === 'DRIVER'
                      ? 'Tell vehicle partners a little about yourself — your driving style, experience, reliability...'
                      : 'Tell drivers about your fleet, what you look for in a driver, and your management style...'}
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#102A43] focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-[#102A43] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-60"
                  >
                    {isSaving ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm font-semibold text-slate-800">{currentUser.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                    <p className="text-sm font-semibold text-slate-800">{currentUser.phone || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {currentProfile?.locationSubcounty
                        ? `${currentProfile.locationSubcounty}, ${currentProfile.locationCounty}`
                        : currentProfile?.locationCounty || 'Nairobi'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Role</p>
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      {roleLabel}
                    </p>
                  </div>
                </div>
                {currentProfile?.bio && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">About</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{currentProfile.bio}</p>
                  </div>
                )}

                {/* Role-specific stats */}
                {role === 'DRIVER' && driverProfile && (
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-3">
                    <div className="text-center bg-blue-50 rounded-xl p-3">
                      <p className="text-lg font-black text-[#102A43]">{driverProfile.drivingExperienceYears}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Years Exp.</p>
                    </div>
                    <div className="text-center bg-emerald-50 rounded-xl p-3">
                      <p className="text-lg font-black text-[#102A43]">{driverProfile.completedEngagementsCount}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Completed</p>
                    </div>
                    <div className="text-center bg-amber-50 rounded-xl p-3">
                      <p className="text-lg font-black text-[#102A43]">{driverProfile.ratingAvg.toFixed(1)}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Rating</p>
                    </div>
                  </div>
                )}
                {role === 'PARTNER' && partnerProfile && (
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-3">
                    <div className="text-center bg-blue-50 rounded-xl p-3">
                      <p className="text-lg font-black text-[#102A43]">{partnerProfile.totalVehiclesCount}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Vehicles</p>
                    </div>
                    <div className="text-center bg-emerald-50 rounded-xl p-3">
                      <p className="text-lg font-black text-[#102A43]">{partnerProfile.activeAgreementsCount}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Active Agr.</p>
                    </div>
                    <div className="text-center bg-amber-50 rounded-xl p-3">
                      <p className="text-lg font-black text-[#102A43]">{partnerProfile.ratingAvg.toFixed(1)}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Rating</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Quick Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => router.push(dashboardLink)}
              className="text-left p-4 rounded-2xl border border-slate-200 hover:border-[#102A43] hover:bg-slate-50 transition-all group"
            >
              <p className="text-xs font-bold text-slate-800 group-hover:text-[#102A43]">My Dashboard</p>
              <p className="text-[10px] text-slate-500 mt-0.5">View your active applications &amp; agreements</p>
            </button>
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="text-left p-4 rounded-2xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all group flex items-start gap-3"
            >
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-slate-700 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-800">Sign Out</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Log out of your account on this device</p>
              </div>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-3xl border border-red-200 shadow-soft p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-red-700">Danger Zone</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Deleting your account is <strong>permanent and irreversible</strong>. All your profile information,
            {role === 'DRIVER' ? ' applications, and agreements' : ' vehicles, listings, applications, and agreements'} will be removed.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-red-300 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete My Account
            </button>
          ) : (
            <div className="space-y-4 p-4 bg-red-50 rounded-2xl border border-red-200 animate-in fade-in">
              <p className="text-xs text-red-800 font-semibold">
                To confirm, type <span className="font-black font-mono bg-red-100 px-1.5 py-0.5 rounded">delete my account</span> below:
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder="delete my account"
                className="w-full text-xs p-2.5 rounded-xl border border-red-300 focus:ring-2 focus:ring-red-400 focus:outline-none bg-white"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput.trim().toLowerCase() !== 'delete my account' || isDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  Permanently Delete Account
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

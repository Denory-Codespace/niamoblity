'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { marketplaceStore } from '@/lib/db/store';
import { dbService } from '@/lib/db/db-service';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateEAT, formatKes } from '@/lib/utils';
import { MpesaTransaction } from '@/types';
import {
  ShieldCheck,
  Users,
  Car,
  FileCheck2,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  FileText,
  Download,
  X,
  Trash2,
  Search,
  LayoutDashboard,
  RefreshCw,
  DollarSign,
  Layers,
  Key,
} from 'lucide-react';

type AdminTab = 'overview' | 'users' | 'vehicles' | 'listings' | 'finance' | 'kyc' | 'matching';

export default function AdminDashboardPage() {
  const { currentProfile } = useAuth();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState(marketplaceStore.getPlatformStats());
  const [users, setUsers] = useState(marketplaceStore.users);
  const [vehicles, setVehicles] = useState(marketplaceStore.vehicles);
  const [listings, setListings] = useState(marketplaceStore.listings);
  const [transactions, setTransactions] = useState<MpesaTransaction[]>(marketplaceStore.transactions);
  const [verificationDocs, setVerificationDocs] = useState(marketplaceStore.verificationDocs);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');
  const [financeSearch, setFinanceSearch] = useState('');
  const [isDeletingUserId, setIsDeletingUserId] = useState<string | null>(null);
  const [isDeletingVehicleId, setIsDeletingVehicleId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [weights, setWeights] = useState({ location: 20, platform: 20, vehicleType: 15, experience: 10, availability: 10, financial: 15, preferences: 10 });
  const [isSavedWeights, setIsSavedWeights] = useState(false);

  useEffect(() => {
    const unsubscribe = marketplaceStore.subscribe(() => {
      setStats(marketplaceStore.getPlatformStats());
      setUsers([...marketplaceStore.users]);
      setVehicles([...marketplaceStore.vehicles]);
      setListings([...marketplaceStore.listings]);
      setTransactions([...marketplaceStore.transactions]);
      setVerificationDocs([...marketplaceStore.verificationDocs]);
    });
    return unsubscribe;
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDocAction = (docId: string, status: 'VERIFIED' | 'REJECTED') => {
    const doc = marketplaceStore.verificationDocs.find(d => d.id === docId);
    if (doc) {
      doc.status = status;
      if (status === 'VERIFIED') doc.verifiedAt = new Date().toISOString();
      setVerificationDocs([...marketplaceStore.verificationDocs]);
      setStats(marketplaceStore.getPlatformStats());
    }
  };

  const handleDeleteUser = async (userId: string, role: any) => {
    if (!confirm('Permanently delete this user and all their data? This cannot be undone.')) return;
    setIsDeletingUserId(userId);
    try {
      await marketplaceStore.deleteUserAccount(userId, role);
      showNotification('success', 'User and all associated data deleted.');
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to delete user.');
    } finally {
      setIsDeletingUserId(null);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Delete this vehicle and all its listings?')) return;
    setIsDeletingVehicleId(vehicleId);
    try {
      await marketplaceStore.deleteVehicle(vehicleId);
      showNotification('success', 'Vehicle deleted.');
    } catch (err: any) {
      showNotification('error', 'Failed to delete vehicle.');
    } finally {
      setIsDeletingVehicleId(null);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Remove this listing from the marketplace?')) return;
    try {
      await marketplaceStore.deleteListing(listingId);
      showNotification('success', 'Listing removed.');
    } catch (err: any) {
      showNotification('error', 'Failed to remove listing.');
    }
  };

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedWeights(true);
    setTimeout(() => setIsSavedWeights(false), 2000);
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + Number(b), 0);

  const filteredUsers = users.filter(u => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    const profile = marketplaceStore.profiles.find(p => p.userId === u.id);
    return (
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      profile?.fullName?.toLowerCase().includes(q)
    );
  });

  const filteredVehicles = vehicles.filter(v => {
    if (!vehicleSearch.trim()) return true;
    const q = vehicleSearch.toLowerCase();
    return (
      v.make?.toLowerCase().includes(q) ||
      v.model?.toLowerCase().includes(q) ||
      v.registrationNumber?.toLowerCase().includes(q)
    );
  });

  const TABS = [
    { id: 'overview' as AdminTab, label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'users' as AdminTab, label: `Users (${users.length})`, icon: <Users className="w-4 h-4" /> },
    { id: 'vehicles' as AdminTab, label: `Fleet (${vehicles.length})`, icon: <Car className="w-4 h-4" /> },
    { id: 'listings' as AdminTab, label: `Listings (${listings.length})`, icon: <Layers className="w-4 h-4" /> },
    { id: 'finance' as AdminTab, label: `M-Pesa (${transactions.length})`, icon: <DollarSign className="w-4 h-4" /> },
    { id: 'kyc' as AdminTab, label: `KYC (${verificationDocs.filter(d => d.status === 'UNDER_REVIEW').length})`, icon: <FileCheck2 className="w-4 h-4" /> },
    { id: 'matching' as AdminTab, label: 'Algorithm', icon: <Sliders className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="verified" size="sm" icon="shield">
                Super Admin Access &bull; Denory Codespace
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-[#102A43] font-heading">
              Platform Administration Control
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Full CRUD over users, vehicles, KYC documents, and the algorithmic matching engine.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => marketplaceStore.initStore()}
          >
            Refresh Data
          </Button>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 border animate-in fade-in duration-200 ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" /> : <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />}
            <span className="text-sm font-semibold">{notification.text}</span>
          </div>
        )}

        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats.totalUsers, sub: `${stats.totalDrivers} Drivers / ${stats.totalPartners} Partners`, color: 'text-[#102A43]' },
            { label: 'Fleet Assets', value: stats.totalVehicles, sub: `${stats.activeListings} Published Listings`, color: 'text-blue-700' },
            { label: 'Active Agreements', value: stats.activeAgreements, sub: 'Legally Structured', color: 'text-emerald-700' },
            { label: 'Avg Match Quality', value: `${stats.averageMatchScore}%`, sub: '7-Factor Normalization', color: 'text-purple-700' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{kpi.label}</span>
              <span className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</span>
              <span className="text-[10px] text-slate-500 font-semibold block">{kpi.sub}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 border border-slate-200 shadow-soft overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${tab === t.id ? 'bg-[#102A43] text-white shadow-md' : 'text-slate-500 hover:text-[#102A43] hover:bg-slate-50'}`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
              <h3 className="text-lg font-bold text-[#102A43] border-b border-slate-100 pb-3">Recent Registrations</h3>
              <div className="space-y-2">
                {users.slice(0, 8).map(u => {
                  const profile = marketplaceStore.profiles.find(p => p.userId === u.id);
                  return (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{profile?.fullName || 'No Profile Name'}</p>
                        <p className="text-slate-400 truncate">{u.email} · {u.phone}</p>
                      </div>
                      <Badge variant={u.role === 'PARTNER' ? 'match' : 'verified'} size="sm">{u.role}</Badge>
                    </div>
                  );
                })}
                {users.length === 0 && <p className="text-xs text-slate-500 text-center py-6">No users yet.</p>}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
              <h3 className="text-lg font-bold text-[#102A43] border-b border-slate-100 pb-3">Platform Health Metrics</h3>
              <div className="space-y-3">
                {[
                  { label: 'Total Applications', value: marketplaceStore.applications.length, color: 'bg-blue-500' },
                  { label: 'Pending KYC Review', value: stats.verificationQueueCount, color: 'bg-amber-500' },
                  { label: 'Active Agreements', value: stats.activeAgreements, color: 'bg-emerald-500' },
                  { label: 'Total Conversations', value: marketplaceStore.conversations.length, color: 'bg-purple-500' },
                  { label: 'Notifications Sent', value: marketplaceStore.notifications.length, color: 'bg-slate-400' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="text-xs text-slate-600 font-medium">{item.label}</span>
                    </div>
                    <span className="text-sm font-black text-[#102A43]">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-rose-600 hover:bg-rose-50 border-rose-200"
                  onClick={() => {
                    if (confirm('Clear all local store data and reset browser cache to 0? (Database unchanged)')) {
                      marketplaceStore.clearAllData();
                      window.location.reload();
                    }
                  }}
                >
                  Clear Local Browser Cache (Reset)
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#102A43]">User Management</h3>
                <p className="text-xs text-slate-500">Search, view, and permanently delete users. Deletion cascades all related data.</p>
              </div>
              <Badge variant="yellow" size="sm">{users.length} Total Users</Badge>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search by name, email, phone, or role..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#102A43] bg-slate-50"
              />
            </div>

            <div className="space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400">No users match your search.</div>
              ) : (
                filteredUsers.map(u => {
                  const profile = marketplaceStore.profiles.find(p => p.userId === u.id);
                  const driverRecord = marketplaceStore.drivers.find(d => d.userId === u.id);
                  const partnerRecord = marketplaceStore.partners.find(p => p.userId === u.id);
                  return (
                    <div key={u.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-[#102A43]">{profile?.fullName || '—'}</span>
                          <Badge variant={u.role === 'PARTNER' ? 'match' : u.role === 'ADMIN' ? 'verified' : 'neutral'} size="sm">{u.role}</Badge>
                          {u.isVerified && <Badge variant="verified" size="sm">Verified</Badge>}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-slate-500">
                          <span>{u.email}</span>
                          <span>{u.phone}</span>
                          {profile?.locationCounty && <span>📍 {profile.locationCounty}{profile.locationSubcounty ? `, ${profile.locationSubcounty}` : ''}</span>}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {u.role === 'DRIVER' && driverRecord && `Exp: ${driverRecord.drivingExperienceYears}yr · Rating: ${driverRecord.ratingAvg}★`}
                          {u.role === 'PARTNER' && partnerRecord && `Vehicles: ${partnerRecord.totalVehiclesCount} · ${partnerRecord.companyName}`}
                          {u.createdAt && ` · Joined: ${formatDateEAT(u.createdAt)}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {/* Superadmin Role Changer */}
                        <select
                          value={u.role}
                          onChange={async (e) => {
                            const newRole = e.target.value as any;
                            u.role = newRole;
                            marketplaceStore.notify();
                            showNotification('success', `User ${u.email} role updated to ${newRole}`);
                          }}
                          className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700"
                        >
                          <option value="DRIVER">DRIVER</option>
                          <option value="PARTNER">PARTNER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>

                        {/* Superadmin Password Reset */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-700 border-blue-200 bg-blue-50/50 hover:bg-blue-100/50"
                          onClick={async () => {
                            const newPass = prompt(`Set new temporary password for ${u.email}:`, 'Nia2026!');
                            if (newPass && newPass.trim().length >= 6) {
                              const success = await dbService.updateUserPassword(u.id, newPass.trim());
                              if (success) {
                                showNotification('success', `Password for ${u.email} updated successfully!`);
                              } else {
                                showNotification('error', `Failed to update password for ${u.email}`);
                              }
                            }
                          }}
                          leftIcon={<Key className="w-3.5 h-3.5" />}
                        >
                          Reset Pass
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:bg-rose-50"
                          disabled={isDeletingUserId === u.id}
                          onClick={() => handleDeleteUser(u.id, u.role)}
                          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          {isDeletingUserId === u.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Vehicles & Listings Tab */}
        {tab === 'vehicles' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#102A43]">Vehicle & Listing Management</h3>
                <p className="text-xs text-slate-500">Oversee all registered vehicles and published marketplace listings.</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="neutral" size="sm">{vehicles.length} Vehicles</Badge>
                <Badge variant="verified" size="sm">{listings.filter(l => l.status === 'PUBLISHED').length} Active</Badge>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={vehicleSearch}
                onChange={e => setVehicleSearch(e.target.value)}
                placeholder="Search by make, model, plate number..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#102A43] bg-slate-50"
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-600">Fleet Vehicles ({filteredVehicles.length})</h4>
              {filteredVehicles.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">No vehicles found.</div>
              ) : (
                filteredVehicles.map(v => {
                  const partner = marketplaceStore.partners.find(p => p.id === v.partnerId);
                  const prof = partner ? marketplaceStore.profiles.find(pr => pr.userId === partner.userId) : null;
                  return (
                    <div key={v.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                          {v.photos?.[0] ? <img src={v.photos[0]} alt="" className="w-full h-full object-cover" /> : <Car className="w-6 h-6 text-slate-400" />}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[#102A43]">{v.make} {v.model} ({v.year})</span>
                            <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg">{v.registrationNumber}</span>
                            <Badge variant={v.availabilityStatus === 'AVAILABLE' ? 'verified' : 'neutral'} size="sm">{v.availabilityStatus}</Badge>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {v.transmission} · {v.fuelType} · {v.primaryCounty}
                            {prof && ` · Owner: ${prof.fullName}`}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50 shrink-0"
                        disabled={isDeletingVehicleId === v.id}
                        onClick={() => handleDeleteVehicle(v.id)}
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      >
                        {isDeletingVehicleId === v.id ? 'Removing...' : 'Delete'}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h4 className="text-sm font-bold text-slate-600">Marketplace Listings ({listings.length})</h4>
              {listings.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">No listings yet.</div>
              ) : (
                listings.map(l => (
                  <div key={l.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#102A43] truncate max-w-xs">{l.title}</span>
                        <Badge variant={l.status === 'PUBLISHED' ? 'verified' : l.status === 'HIRED' ? 'match' : 'neutral'} size="sm">{l.status}</Badge>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {l.county} · {l.subcounty} · KES {l.targetAmountKes?.toLocaleString()}/day · {l.applicationsCount || 0} applications
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50 shrink-0"
                      onClick={() => handleDeleteListing(l.id)}
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* KYC Tab */}
        {tab === 'kyc' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#102A43]">KYC & Statutory Document Queue</h3>
                <p className="text-xs text-slate-500">Review driver DLs, PSV badges, and partner logbooks.</p>
              </div>
              <Badge variant="yellow" size="sm">
                {verificationDocs.filter(d => d.status === 'UNDER_REVIEW').length} Pending
              </Badge>
            </div>

            <div className="space-y-3">
              {verificationDocs.length > 0 ? (
                verificationDocs.map((doc) => (
                  <div key={doc.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#102A43] font-mono">{doc.documentType}</span>
                        <span className="text-xs font-bold text-slate-600">({doc.documentNumber || 'Ref doc'})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-500 block">
                          User #{doc.userId.slice(0, 8)}... · <strong className="text-blue-600">{doc.fileName}</strong>
                        </span>
                        {doc.fileUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewDoc({ url: doc.fileUrl!, name: doc.fileName })}
                            className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> Inspect
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.status === 'UNDER_REVIEW' ? (
                        <>
                          <Button variant="soft-green" size="sm" onClick={() => handleDocAction(doc.id, 'VERIFIED')} leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                            Approve
                          </Button>
                          <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50" onClick={() => handleDocAction(doc.id, 'REJECTED')} leftIcon={<XCircle className="w-3.5 h-3.5" />}>
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Badge variant={doc.status === 'VERIFIED' ? 'verified' : 'rejected'} size="sm">{doc.status}</Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                  No documents currently in the verification queue.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Listings & Opportunities Tab */}
        {tab === 'listings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#102A43]">Marketplace Listings Control</h3>
                <p className="text-xs text-slate-500">Superadmin oversight of all posted driver opportunities in Nairobi.</p>
              </div>
              <Badge variant="yellow" size="sm">{listings.length} Total Listings</Badge>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={listingSearch}
                onChange={e => setListingSearch(e.target.value)}
                placeholder="Search listings by title, sub-county, partner..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#102A43] bg-slate-50"
              />
            </div>

            <div className="space-y-3">
              {listings.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400">No opportunities published yet.</div>
              ) : (
                listings
                  .filter(l => !listingSearch || l.title?.toLowerCase().includes(listingSearch.toLowerCase()) || l.subcounty?.toLowerCase().includes(listingSearch.toLowerCase()))
                  .map(l => (
                    <div key={l.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-[#102A43] truncate">{l.title}</span>
                          <Badge variant={l.status === 'PUBLISHED' ? 'verified' : l.status === 'HIRED' ? 'match' : 'neutral'} size="sm">
                            {l.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                          <span>Target: <strong className="text-slate-800">{formatKes(l.targetAmountKes)}/day</strong></span>
                          <span>Deposit: <strong className="text-slate-800">{formatKes(l.depositAmountKes)}</strong></span>
                          <span>Location: {l.subcounty || 'Nairobi'}</span>
                          <span>Partner: {l.partner?.fullName || 'Verified Partner'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={async () => {
                            const newStatus = l.status === 'PUBLISHED' ? 'PAUSED' : 'PUBLISHED';
                            await marketplaceStore.updateListing(l.id, { status: newStatus });
                            showNotification('success', `Listing status updated to ${newStatus}`);
                          }}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                            l.status === 'PUBLISHED'
                              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {l.status === 'PUBLISHED' ? 'Pause Listing' : 'Publish Listing'}
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* M-Pesa Finance & Monetization Audit Tab */}
        {tab === 'finance' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#102A43]">M-Pesa Finance &amp; Revenue Audit</h3>
                <p className="text-xs text-slate-500">Track all unlock fees, verified driver trust badges, and partner listing boosts.</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="verified" size="sm">
                  Total Collected: {formatKes(transactions.reduce((sum, t) => sum + (t.amountKes || 0), 0))}
                </Badge>
              </div>
            </div>

            {/* Finance Revenue KPI Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Total M-Pesa Revenue</span>
                <span className="text-2xl font-black text-emerald-900">
                  {formatKes(transactions.reduce((sum, t) => sum + (t.amountKes || 0), 0))}
                </span>
                <span className="text-[10px] text-emerald-700 block">From {transactions.length} total payments</span>
              </div>
              <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Contact Unlocks</span>
                <span className="text-2xl font-black text-blue-900">
                  {transactions.filter(t => t.serviceType === 'DRIVER_CONTACT_UNLOCK' || t.serviceType === 'PARTNER_APPLICANT_UNLOCK').length}
                </span>
                <span className="text-[10px] text-blue-700 block">Driver &amp; Partner Fast-Tracks</span>
              </div>
              <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Trust Badges &amp; Boosts</span>
                <span className="text-2xl font-black text-amber-900">
                  {transactions.filter(t => t.serviceType === 'DRIVER_KYC_VERIFICATION' || t.serviceType === 'PARTNER_LISTING_BOOST').length}
                </span>
                <span className="text-[10px] text-amber-700 block">Premium fleet monetizations</span>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={financeSearch}
                onChange={e => setFinanceSearch(e.target.value)}
                placeholder="Search by M-Pesa receipt, phone, description..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#102A43] bg-slate-50"
              />
            </div>

            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400">
                  No M-Pesa transactions recorded yet. Payments completed via the M-Pesa modal will appear here in real-time.
                </div>
              ) : (
                transactions
                  .filter(t => {
                    if (!financeSearch.trim()) return true;
                    const q = financeSearch.toLowerCase();
                    return (
                      t.mpesaReceiptNumber?.toLowerCase().includes(q) ||
                      t.phoneNumber?.includes(q) ||
                      t.description?.toLowerCase().includes(q)
                    );
                  })
                  .map(t => (
                    <div key={t.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-900">
                            {t.mpesaReceiptNumber}
                          </span>
                          <span className="font-bold text-sm text-[#102A43]">{t.description}</span>
                          <Badge variant="verified" size="sm">{t.status}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                          <span>Phone: <strong className="text-slate-800">{t.phoneNumber}</strong></span>
                          <span>Role: {t.userRole}</span>
                          <span>Date: {formatDateEAT(t.createdAt)}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-lg font-black text-emerald-800 block">
                          +{formatKes(t.amountKes)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Safaricom Confirmed</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* Matching Algorithm Tab */}
        {tab === 'matching' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6 max-w-2xl">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-[#102A43]">Matching Algorithm Weights</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">Tune the deterministic 7-factor weights across the live Kenyan marketplace.</p>
            </div>

            <form onSubmit={handleSaveWeights} className="space-y-4">
              <div className="space-y-3">
                {[
                  { key: 'location', label: 'Location Compatibility' },
                  { key: 'platform', label: 'Platform Overlap (Uber/Bolt)' },
                  { key: 'financial', label: 'Financial Target Compatibility' },
                  { key: 'vehicleType', label: 'Vehicle Body Preference' },
                  { key: 'experience', label: 'Experience & Track Record' },
                  { key: 'availability', label: 'Availability Match' },
                  { key: 'preferences', label: 'Soft Preferences' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>{label}</span><span>{(weights as any)[key]}%</span>
                    </div>
                    <input
                      type="range" min="5" max="40"
                      value={(weights as any)[key]}
                      onChange={e => setWeights({ ...weights, [key]: Number(e.target.value) })}
                      className="w-full accent-[#102A43]"
                    />
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">Total Normalized Weight:</span>
                <span className={`font-black ${totalWeight === 100 ? 'text-emerald-700' : 'text-amber-700'}`}>{totalWeight}%</span>
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full">
                {isSavedWeights ? 'Saved & Applied to Engine! ✓' : 'Save Algorithm Settings'}
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Document Preview Lightbox */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setPreviewDoc(null)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="font-bold text-sm text-[#102A43] truncate">{previewDoc.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { const a = document.createElement('a'); a.href = previewDoc.url; a.download = previewDoc.name || 'document.pdf'; document.body.appendChild(a); a.click(); document.body.removeChild(a); }} className="px-3 py-1.5 bg-[#102A43] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-blue-900 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button type="button" onClick={() => setPreviewDoc(null)} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center min-h-[300px] bg-slate-100">
              {previewDoc.url.startsWith('data:image/') || /\.(jpg|jpeg|png|webp)$/i.test(previewDoc.url) ? (
                <img src={previewDoc.url} alt={previewDoc.name} className="max-h-[60vh] max-w-full object-contain rounded-xl" />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <FileText className="w-16 h-16 text-blue-500 mx-auto" />
                  <p className="font-bold text-slate-800 text-sm">{previewDoc.name}</p>
                  <p className="text-xs text-slate-500">Document authenticated under Kenyan compliance standards.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




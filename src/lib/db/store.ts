// ==============================================================================
// nia mobility - Unified Real Database & Reactive Data Store (Clean Zero-State)
// Developed by Denory Codespace
// ==============================================================================

import {
  User,
  Profile,
  DriverProfile,
  PartnerProfile,
  Vehicle,
  VehicleListing,
  Application,
  Agreement,
  Conversation,
  Message,
  Review,
  VerificationDocument,
  NotificationItem,
  ApplicationStatus,
  AgreementStatus,
  UserRole,
} from '@/types';
import { matchingService } from '../matching/matching-service';
import { dbService } from './db-service';

class MarketplaceStore {
  public users: User[] = [];
  public profiles: Profile[] = [];
  public drivers: DriverProfile[] = [];
  public partners: PartnerProfile[] = [];
  public vehicles: Vehicle[] = [];
  public listings: VehicleListing[] = [];
  public applications: Application[] = [];
  public agreements: Agreement[] = [];
  public conversations: Conversation[] = [];
  public messages: Message[] = [];
  public verificationDocs: VerificationDocument[] = [];
  public notifications: NotificationItem[] = [];
  public savedListingIds: string[] = [];

  private listeners: Set<() => void> = new Set();
  private isLoaded = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initStore();
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    if (typeof window !== 'undefined') {
      this.saveToStorage();
    }
    this.listeners.forEach(fn => fn());
  }

  private async initStore() {
    this.loadFromStorage();
    try {
      // Pull fresh data from Supabase
      const [remoteUsers, remoteProfiles, remoteDrivers, remotePartners, remoteVehicles, remoteListings, remoteApplications, remoteAgreements] = await Promise.all([
        dbService.getUsers(),
        dbService.getProfiles(),
        dbService.getDrivers(),
        dbService.getPartners(),
        dbService.getVehicles(),
        dbService.getListings(),
        dbService.getApplications(),
        dbService.getAgreements(),
      ]);

      if (remoteUsers.length > 0) this.users = remoteUsers;
      if (remoteProfiles.length > 0) this.profiles = remoteProfiles;
      if (remoteDrivers.length > 0) this.drivers = remoteDrivers;
      if (remotePartners.length > 0) this.partners = remotePartners;
      if (remoteVehicles.length > 0) this.vehicles = remoteVehicles;
      if (remoteListings.length > 0) this.listings = remoteListings;
      if (remoteApplications.length > 0) this.applications = remoteApplications;
      if (remoteAgreements.length > 0) this.agreements = remoteAgreements;

      this.notify();
    } catch (e) {
      console.warn('Initial remote fetch notice:', e);
    }
    this.isLoaded = true;
  }

  private saveToStorage() {
    try {
      localStorage.setItem('nia_users', JSON.stringify(this.users));
      localStorage.setItem('nia_profiles', JSON.stringify(this.profiles));
      localStorage.setItem('nia_drivers', JSON.stringify(this.drivers));
      localStorage.setItem('nia_partners', JSON.stringify(this.partners));
      localStorage.setItem('nia_vehicles', JSON.stringify(this.vehicles));
      localStorage.setItem('nia_listings', JSON.stringify(this.listings));
      localStorage.setItem('nia_applications', JSON.stringify(this.applications));
      localStorage.setItem('nia_agreements', JSON.stringify(this.agreements));
      localStorage.setItem('nia_saved', JSON.stringify(this.savedListingIds));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }

  public loadFromStorage() {
    try {
      const u = localStorage.getItem('nia_users');
      if (u) this.users = JSON.parse(u);
      const p = localStorage.getItem('nia_profiles');
      if (p) this.profiles = JSON.parse(p);
      const d = localStorage.getItem('nia_drivers');
      if (d) this.drivers = JSON.parse(d);
      const pr = localStorage.getItem('nia_partners');
      if (pr) this.partners = JSON.parse(pr);
      const v = localStorage.getItem('nia_vehicles');
      if (v) this.vehicles = JSON.parse(v);
      const l = localStorage.getItem('nia_listings');
      if (l) this.listings = JSON.parse(l);
      const a = localStorage.getItem('nia_applications');
      if (a) this.applications = JSON.parse(a);
      const ag = localStorage.getItem('nia_agreements');
      if (ag) this.agreements = JSON.parse(ag);
      const s = localStorage.getItem('nia_saved');
      if (s) this.savedListingIds = JSON.parse(s);
    } catch (e) {
      console.warn('Storage load error:', e);
    }
  }

  // --- Real Registration Flow ---
  public async registerUser(params: {
    fullName: string;
    phone: string;
    email: string;
    role: UserRole;
    county?: string;
    subcounty?: string;
    experienceYears?: number;
    companyName?: string;
  }) {
    // 1. Database call
    const res = await dbService.registerUser(params);

    this.users.unshift(res.user);
    this.profiles.unshift(res.profile);

    if (params.role === 'DRIVER' && res.roleRecord) {
      this.drivers.unshift(res.roleRecord);
    } else if (params.role === 'PARTNER' && res.roleRecord) {
      this.partners.unshift(res.roleRecord);
    }

    this.notify();
    return { user: res.user, profile: res.profile, supabaseSynced: res.supabaseSynced };
  }

  // --- Real Login Flow ---
  public async loginUser(identifier: string) {
    // 1. Try Supabase lookup
    try {
      const remote = await dbService.loginUser(identifier);
      if (remote) {
        if (!this.users.some(u => u.id === remote.user.id)) this.users.unshift(remote.user);
        if (remote.profile && !this.profiles.some(p => p.id === remote.profile!.id)) this.profiles.unshift(remote.profile);
        if (remote.roleRecord) {
          const roleRec = remote.roleRecord;
          if (remote.user.role === 'DRIVER' && !this.drivers.some(d => d.id === roleRec.id)) {
            this.drivers.unshift(roleRec as DriverProfile);
          } else if (remote.user.role === 'PARTNER' && !this.partners.some(p => p.id === roleRec.id)) {
            this.partners.unshift(roleRec as PartnerProfile);
          }
        }
        this.notify();
        return {
          user: remote.user,
          profile: remote.profile || null,
          driverProfile: remote.user.role === 'DRIVER' ? (remote.roleRecord as DriverProfile) : null,
          partnerProfile: remote.user.role === 'PARTNER' ? (remote.roleRecord as PartnerProfile) : null,
        };
      }
    } catch (e) {
      console.warn('Supabase login check error:', e);
    }

    // 2. Fall back to local store
    const clean = identifier.trim().toLowerCase();
    const localUser = this.users.find(u => u.email.toLowerCase() === clean || u.phone.includes(clean));
    if (localUser) {
      const profile = this.profiles.find(p => p.userId === localUser.id) || null;
      const driverProfile = this.drivers.find(d => d.userId === localUser.id) || null;
      const partnerProfile = this.partners.find(p => p.userId === localUser.id) || null;
      return {
        user: localUser,
        profile,
        driverProfile,
        partnerProfile,
      };
    }

    return null;
  }

  // --- Driver & Listing Queries ---
  public getListings(driverProfile?: DriverProfile) {
    if (!driverProfile) {
      return this.listings;
    }
    return matchingService.rankListingsForDriver(driverProfile, this.listings);
  }

  public getListingById(id: string) {
    return this.listings.find(l => l.id === id);
  }

  public async addListing(listing: Omit<VehicleListing, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'applicationsCount'>) {
    // Database call
    const newListing = await dbService.createListing(listing);
    this.listings.unshift(newListing);

    // Update partner stats if exists
    const partner = this.partners.find(p => p.id === listing.partnerId);
    if (partner) {
      partner.totalVehiclesCount = this.vehicles.filter(v => v.partnerId === listing.partnerId).length;
    }

    this.notify();
    return newListing;
  }

  public async deleteListing(id: string) {
    await dbService.deleteListing(id);
    this.listings = this.listings.filter(l => l.id !== id);
    this.notify();
  }

  // --- Vehicles ---
  public getVehiclesByPartner(partnerId: string) {
    return this.vehicles.filter(v => v.partnerId === partnerId);
  }

  public async addVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) {
    // Database call
    const newVehicle = await dbService.createVehicle(vehicle);
    this.vehicles.unshift(newVehicle);
    this.notify();
    return newVehicle;
  }

  public async deleteVehicle(id: string) {
    await dbService.deleteVehicle(id);
    this.vehicles = this.vehicles.filter(v => v.id !== id);
    this.notify();
  }

  // --- Applications ---
  public async applyToListing(listingId: string, driverId: string, coverNote: string) {
    const listing = this.getListingById(listingId);
    const driver = this.drivers.find(d => d.id === driverId);
    const driverProfile = this.profiles.find(p => p.userId === driver?.userId);

    if (!listing || !driver) throw new Error("Listing or driver not found");

    const matchBreakdown = matchingService.calculateMatch(driver, listing);
    
    // Database call
    const newApp = await dbService.createApplication({
      listingId,
      driverId,
      partnerId: listing.partnerId,
      status: "SUBMITTED",
      coverNote,
      matchScorePct: matchBreakdown.totalScorePct,
      lastStatusChangedBy: driver.userId,
      lastStatusChangedAt: new Date().toISOString(),
      listing,
      driver: {
        id: driver.id,
        fullName: driverProfile?.fullName || "Verified Driver",
        experienceYears: driver.drivingExperienceYears,
        ratingAvg: driver.ratingAvg,
        isVerified: driver.identityVerified,
        preferredPlatforms: driver.preferredPlatforms,
        locationSubcounty: driver.preferredOperatingAreas[0] || 'Nairobi',
      }
    });

    listing.applicationsCount += 1;
    this.applications.unshift(newApp);

    this.notify();
    return newApp;
  }

  public async updateApplicationStatus(appId: string, newStatus: ApplicationStatus, actorId: string, reason?: string) {
    const app = this.applications.find(a => a.id === appId);
    if (!app) return;

    await dbService.updateApplicationStatus(appId, newStatus, reason);

    app.status = newStatus;
    app.statusReason = reason;
    app.lastStatusChangedBy = actorId;
    app.lastStatusChangedAt = new Date().toISOString();
    app.updatedAt = new Date().toISOString();

    if (newStatus === "ACCEPTED") {
      const existingAgr = this.agreements.find(agr => agr.applicationId === appId);
      if (!existingAgr && app.listing) {
        const newAgr = await dbService.createAgreement({
          agreementNumber: `NIA-AGR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          applicationId: app.id,
          listingId: app.listingId,
          driverId: app.driverId,
          partnerId: app.partnerId,
          vehicleId: app.listing.vehicleId,
          arrangementType: app.listing.arrangementType,
          targetAmountKes: app.listing.targetAmountKes,
          depositAmountKes: app.listing.depositAmountKes,
          paymentFrequency: app.listing.paymentFrequency,
          fuelTerms: `Fuel cost borne by ${app.listing.fuelResponsibility}.`,
          maintenanceTerms: `Regular servicing borne by ${app.listing.maintenanceResponsibility}.`,
          insuranceTerms: `PSV Commercial Insurance maintained by ${app.listing.insuranceResponsibility}.`,
          operatingArea: `${app.listing.county} (${app.listing.subcounty || 'All Areas'})`,
          startDate: new Date().toISOString(),
          termsAndConditions: "Standard nia mobility commercial framework. Remittance via Safaricom M-PESA Daraja. Digital signature binding.",
          status: "PENDING_DRIVER",
          vehicle: app.listing.vehicle,
          driverName: app.driver?.fullName || "Driver",
          partnerName: app.partner?.fullName || "Partner",
        });
        this.agreements.unshift(newAgr);
      }
    }

    this.notify();
    return app;
  }

  public async signAgreement(agreementId: string, role: 'DRIVER' | 'PARTNER') {
    const agr = this.agreements.find(a => a.id === agreementId);
    if (!agr) return;

    await dbService.signAgreement(agreementId, role);

    const timestamp = new Date().toISOString();
    if (role === 'DRIVER') {
      agr.driverSignedAt = timestamp;
    } else {
      agr.partnerSignedAt = timestamp;
    }

    if (agr.driverSignedAt && (agr.partnerSignedAt || agr.status === 'PENDING_DRIVER')) {
      agr.status = "ACTIVE";
    }

    agr.updatedAt = timestamp;
    this.notify();
    return agr;
  }

  public toggleSaveListing(listingId: string) {
    if (this.savedListingIds.includes(listingId)) {
      this.savedListingIds = this.savedListingIds.filter(id => id !== listingId);
    } else {
      this.savedListingIds.push(listingId);
    }
    this.notify();
  }

  public clearAllData() {
    this.users = [];
    this.profiles = [];
    this.drivers = [];
    this.partners = [];
    this.vehicles = [];
    this.listings = [];
    this.applications = [];
    this.agreements = [];
    this.conversations = [];
    this.messages = [];
    this.verificationDocs = [];
    this.notifications = [];
    this.savedListingIds = [];
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    this.notify();
  }

  public getPlatformStats() {
    return {
      totalUsers: this.users.length,
      totalDrivers: this.drivers.length,
      totalPartners: this.partners.length,
      totalVehicles: this.vehicles.length,
      activeListings: this.listings.filter(l => l.status === 'PUBLISHED').length,
      pendingApplications: this.applications.filter(a => a.status === 'SUBMITTED' || a.status === 'VIEWED').length,
      activeAgreements: this.agreements.filter(a => a.status === 'ACTIVE').length,
      verificationQueueCount: this.verificationDocs.filter(d => d.status === 'UNDER_REVIEW').length,
      averageMatchScore: this.applications.length > 0 
        ? Math.round(this.applications.reduce((acc, a) => acc + a.matchScorePct, 0) / this.applications.length)
        : 0,
      disputesCount: 0,
    };
  }
}

export const marketplaceStore = new MarketplaceStore();

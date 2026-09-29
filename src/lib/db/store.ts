// ==============================================================================
// nia mobility - Unified In-Memory & Local Reactive Data Store
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
} from '@/types';
import {
  MOCK_USERS,
  MOCK_PROFILES,
  MOCK_DRIVER_PROFILES,
  MOCK_PARTNER_PROFILES,
  MOCK_VEHICLES,
  MOCK_LISTINGS,
  MOCK_APPLICATIONS,
  MOCK_AGREEMENTS,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  MOCK_VERIFICATION_DOCS,
  MOCK_NOTIFICATIONS,
} from './mock-data';
import { matchingService } from '../matching/matching-service';

class MarketplaceStore {
  public users: User[] = [...MOCK_USERS];
  public profiles: Profile[] = [...MOCK_PROFILES];
  public drivers: DriverProfile[] = [...MOCK_DRIVER_PROFILES];
  public partners: PartnerProfile[] = [...MOCK_PARTNER_PROFILES];
  public vehicles: Vehicle[] = [...MOCK_VEHICLES];
  public listings: VehicleListing[] = [...MOCK_LISTINGS];
  public applications: Application[] = [...MOCK_APPLICATIONS];
  public agreements: Agreement[] = [...MOCK_AGREEMENTS];
  public conversations: Conversation[] = [...MOCK_CONVERSATIONS];
  public messages: Message[] = [...MOCK_MESSAGES];
  public verificationDocs: VerificationDocument[] = [...MOCK_VERIFICATION_DOCS];
  public notifications: NotificationItem[] = [...MOCK_NOTIFICATIONS];
  public savedListingIds: string[] = ["lst-01"];

  private listeners: Set<() => void> = new Set();

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
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

  public addListing(listing: Omit<VehicleListing, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'applicationsCount'>) {
    const newId = `lst-${Date.now()}`;
    const newListing: VehicleListing = {
      ...listing,
      id: newId,
      viewCount: 0,
      applicationsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.listings.unshift(newListing);
    this.notify();
    return newListing;
  }

  // --- Vehicles ---
  public getVehiclesByPartner(partnerId: string) {
    return this.vehicles.filter(v => v.partnerId === partnerId);
  }

  public addVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) {
    const newId = `veh-${Date.now()}`;
    const newVehicle: Vehicle = {
      ...vehicle,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.vehicles.unshift(newVehicle);
    this.notify();
    return newVehicle;
  }

  // --- Applications ---
  public applyToListing(listingId: string, driverId: string, coverNote: string) {
    const listing = this.getListingById(listingId);
    const driver = this.drivers.find(d => d.id === driverId);
    const driverProfile = this.profiles.find(p => p.userId === driver?.userId);

    if (!listing || !driver) throw new Error("Listing or driver not found");

    const matchBreakdown = matchingService.calculateMatch(driver, listing);
    const newApp: Application = {
      id: `app-${Date.now()}`,
      listingId,
      driverId,
      partnerId: listing.partnerId,
      status: "SUBMITTED",
      coverNote,
      matchScorePct: matchBreakdown.totalScorePct,
      lastStatusChangedBy: driver.userId,
      lastStatusChangedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      listing,
      driver: {
        id: driver.id,
        fullName: driverProfile?.fullName || "Samuel Mwangi",
        experienceYears: driver.drivingExperienceYears,
        ratingAvg: driver.ratingAvg,
        isVerified: driver.identityVerified,
        preferredPlatforms: driver.preferredPlatforms,
        locationSubcounty: driver.preferredOperatingAreas[0],
      }
    };

    listing.applicationsCount += 1;
    this.applications.unshift(newApp);

    // Create notification for partner
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: listing.partnerId,
      title: "New Driver Application! 🚗",
      message: `${driverProfile?.fullName || "A driver"} applied for ${listing.title} (${matchBreakdown.totalScorePct}% Match).`,
      type: "APPLICATION",
      isRead: false,
      linkUrl: "/partner/applications",
      createdAt: new Date().toISOString(),
    });

    this.notify();
    return newApp;
  }

  public updateApplicationStatus(appId: string, newStatus: ApplicationStatus, actorId: string, reason?: string) {
    const app = this.applications.find(a => a.id === appId);
    if (!app) return;

    app.status = newStatus;
    app.statusReason = reason;
    app.lastStatusChangedBy = actorId;
    app.lastStatusChangedAt = new Date().toISOString();
    app.updatedAt = new Date().toISOString();

    // If accepted, auto-generate Draft Agreement if not exists
    if (newStatus === "ACCEPTED") {
      const existingAgr = this.agreements.find(agr => agr.applicationId === appId);
      if (!existingAgr && app.listing) {
        const newAgr: Agreement = {
          id: `agr-${Date.now()}`,
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          vehicle: app.listing.vehicle,
          driverName: app.driver?.fullName || "Driver",
          partnerName: app.partner?.fullName || "Partner",
        };
        this.agreements.unshift(newAgr);
      }
    }

    this.notify();
    return app;
  }

  // --- Agreements ---
  public signAgreement(agreementId: string, role: 'DRIVER' | 'PARTNER') {
    const agr = this.agreements.find(a => a.id === agreementId);
    if (!agr) return;

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

  public updateAgreementStatus(agreementId: string, status: AgreementStatus, reason?: string) {
    const agr = this.agreements.find(a => a.id === agreementId);
    if (!agr) return;
    agr.status = status;
    agr.terminationReason = reason;
    agr.updatedAt = new Date().toISOString();
    this.notify();
    return agr;
  }

  // --- Messaging ---
  public sendMessage(conversationId: string, senderId: string, senderName: string, senderRole: any, content: string) {
    const msg: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId,
      senderName,
      senderRole,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.messages.push(msg);

    const conv = this.conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.lastMessage = content;
      conv.lastMessageAt = msg.createdAt;
    }
    this.notify();
    return msg;
  }

  // --- Bookmarking ---
  public toggleSaveListing(listingId: string) {
    if (this.savedListingIds.includes(listingId)) {
      this.savedListingIds = this.savedListingIds.filter(id => id !== listingId);
    } else {
      this.savedListingIds.push(listingId);
    }
    this.notify();
  }

  // --- Platform Stats ---
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
      averageMatchScore: Math.round(
        this.applications.reduce((acc, a) => acc + a.matchScorePct, 0) / Math.max(1, this.applications.length)
      ),
      disputesCount: 0,
    };
  }
}

export const marketplaceStore = new MarketplaceStore();

// ==============================================================================
// nia mobility - Master Type Definitions & Enums
// Developed by Denory Codespace
// ==============================================================================

export type UserRole = 'DRIVER' | 'PARTNER' | 'ADMIN' | 'SUPPORT';

export type VerificationStatus = 'UNVERIFIED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';

export type ArrangementType = 
  | 'DAILY_TARGET' 
  | 'WEEKLY_TARGET' 
  | 'MONTHLY_TARGET' 
  | 'REVENUE_SHARE' 
  | 'OTHER';

export type PaymentFrequency = 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';

export type ResponsibilityType = 'DRIVER' | 'PARTNER' | 'SHARED' | 'SHARED_50_50';

export type VehicleType = 'SEDAN' | 'HATCHBACK' | 'SUV' | 'VAN' | 'MOTORCYCLE' | 'BOX_TRUCK';

export type TransmissionType = 'AUTOMATIC' | 'MANUAL';

export type FuelType = 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';

export type ListingStatus = 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'CLOSED' | 'EXPIRED';

export type ApplicationStatus = 
  | 'SUBMITTED' 
  | 'VIEWED' 
  | 'SHORTLISTED' 
  | 'INTERVIEW' 
  | 'ACCEPTED' 
  | 'REJECTED' 
  | 'WITHDRAWN' 
  | 'EXPIRED';

export type AgreementStatus = 
  | 'DRAFT' 
  | 'PENDING_DRIVER' 
  | 'PENDING_PARTNER' 
  | 'ACTIVE' 
  | 'SUSPENDED' 
  | 'COMPLETED' 
  | 'TERMINATED' 
  | 'DISPUTED';

export type DocumentType = 
  | 'NATIONAL_ID' 
  | 'DRIVING_LICENSE' 
  | 'PSV_BADGE' 
  | 'POLICE_CLEARANCE' 
  | 'LOGBOOK' 
  | 'COMMERCIAL_INSURANCE' 
  | 'INSPECTION_CERTIFICATE' 
  | 'OTHER';

export type ReportReason = 
  | 'FAKE_LISTING' 
  | 'FAKE_IDENTITY' 
  | 'FRAUD' 
  | 'HARASSMENT' 
  | 'MISLEADING_INFO' 
  | 'PAYMENT_DISPUTE' 
  | 'VEHICLE_CONDITION' 
  | 'OTHER';

// ==============================================================================
// DOMAIN ENTITIES
// ==============================================================================

export interface User {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  locationCounty: string;
  locationSubcounty?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverProfile {
  id: string;
  userId: string;
  drivingExperienceYears: number;
  preferredOperatingAreas: string[];
  preferredPlatforms: string[]; // e.g. ["Uber", "Bolt", "Little", "Faras"]
  preferredVehicleTypes: VehicleType[];
  preferredArrangementTypes: ArrangementType[];
  maxDailyTargetKes?: number;
  availableFrom: string;
  isAvailable: boolean;
  ratingAvg: number;
  ratingCount: number;
  completedEngagementsCount: number;
  identityVerified: boolean;
  licenseVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerProfile {
  id: string;
  userId: string;
  partnerType: 'INDIVIDUAL' | 'COMPANY' | 'FLEET_OPERATOR';
  companyName?: string;
  ratingAvg: number;
  ratingCount: number;
  totalVehiclesCount: number;
  activeAgreementsCount: number;
  identityVerified: boolean;
  businessVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  partnerId: string;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  vehicleType: VehicleType;
  transmission: TransmissionType;
  fuelType: FuelType;
  seatingCapacity: number;
  color: string;
  mileageKm?: number;
  primaryCounty: string;
  primarySubcounty?: string;
  supportedPlatforms: string[];
  photos: string[];
  verificationStatus: VerificationStatus;
  availabilityStatus: 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'DECOMMISSIONED';
  createdAt: string;
  updatedAt: string;
}

export interface VehicleListing {
  id: string;
  vehicleId: string;
  partnerId: string;
  title: string;
  description: string;
  county: string;
  subcounty?: string;
  arrangementType: ArrangementType;
  targetAmountKes: number;
  depositAmountKes: number;
  paymentFrequency: PaymentFrequency;
  fuelResponsibility: ResponsibilityType;
  maintenanceResponsibility: ResponsibilityType;
  insuranceResponsibility: ResponsibilityType;
  preferredPlatforms: string[];
  driverMinExperienceYears: number;
  driverRequirementsSummary?: string;
  availableFrom: string;
  status: ListingStatus;
  viewCount: number;
  applicationsCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Joined fields for display
  vehicle?: Vehicle;
  partner?: {
    id: string;
    fullName: string;
    ratingAvg: number;
    ratingCount: number;
    isVerified: boolean;
  };
  matchScorePct?: number;
}

export interface Application {
  id: string;
  listingId: string;
  driverId: string;
  partnerId: string;
  status: ApplicationStatus;
  coverNote?: string;
  matchScorePct: number;
  statusReason?: string;
  lastStatusChangedBy: string;
  lastStatusChangedAt: string;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  listing?: VehicleListing;
  driver?: {
    id: string;
    fullName: string;
    phone?: string;
    avatarUrl?: string;
    experienceYears: number;
    ratingAvg: number;
    isVerified: boolean;
    preferredPlatforms: string[];
    locationSubcounty?: string;
  };
  partner?: {
    id: string;
    fullName: string;
    phone?: string;
  };
}

export interface MatchScoreBreakdown {
  locationScore: number;       // 0 - 20
  platformScore: number;       // 0 - 20
  vehicleTypeScore: number;    // 0 - 15
  experienceScore: number;     // 0 - 10
  availabilityScore: number;   // 0 - 10
  financialScore: number;      // 0 - 15
  preferencesScore: number;    // 0 - 10
  totalScorePct: number;       // 0 - 100
  factors: {
    locationMatch: boolean;
    platformsShared: string[];
    vehicleTypeMatch: boolean;
    meetsExperience: boolean;
    withinTargetBudget: boolean;
  };
}

export interface Agreement {
  id: string;
  agreementNumber: string;
  applicationId: string;
  listingId: string;
  driverId: string;
  partnerId: string;
  vehicleId: string;
  arrangementType: ArrangementType;
  targetAmountKes: number;
  depositAmountKes: number;
  paymentFrequency: PaymentFrequency;
  fuelTerms: string;
  maintenanceTerms: string;
  insuranceTerms: string;
  operatingArea: string;
  startDate: string;
  endDate?: string;
  termsAndConditions: string;
  status: AgreementStatus;
  partnerSignedAt?: string;
  driverSignedAt?: string;
  terminationReason?: string;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  vehicle?: Vehicle;
  driverName?: string;
  partnerName?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  driverId: string;
  partnerId: string;
  driverName: string;
  partnerName: string;
  listingId?: string;
  listingTitle?: string;
  lastMessage?: string;
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
}

export interface Review {
  id: string;
  agreementId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: 'DRIVER' | 'PARTNER';
  revieweeId: string;
  ratingScore: number;
  communicationScore: number;
  reliabilityScore: number;
  vehicleCareScore: number;
  comment: string;
  createdAt: string;
}

export interface VerificationDocument {
  id: string;
  userId: string;
  documentType: DocumentType;
  documentNumber?: string;
  fileName: string;
  fileUrl: string;
  status: VerificationStatus;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'APPLICATION' | 'AGREEMENT' | 'MESSAGE' | 'VERIFICATION' | 'SYSTEM';
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalDrivers: number;
  totalPartners: number;
  totalVehicles: number;
  activeListings: number;
  pendingApplications: number;
  activeAgreements: number;
  verificationQueueCount: number;
  averageMatchScore: number;
  disputesCount: number;
}

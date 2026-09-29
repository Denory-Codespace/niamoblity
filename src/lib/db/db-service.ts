// ==============================================================================
// nia mobility - Real Supabase Database CRUD Service
// Developed by Denory Codespace
// ==============================================================================

import { supabase } from '../supabase/client';
import {
  User,
  Profile,
  DriverProfile,
  PartnerProfile,
  Vehicle,
  VehicleListing,
  Application,
  Agreement,
  ApplicationStatus,
  AgreementStatus,
  UserRole,
} from '@/types';

export class DatabaseService {
  // ----------------------------------------------------------------------------
  // USERS & PROFILES CRUD
  // ----------------------------------------------------------------------------
  async registerUser(params: {
    fullName: string;
    phone: string;
    email: string;
    role: UserRole;
    county?: string;
    subcounty?: string;
    experienceYears?: number;
    companyName?: string;
  }) {
    const userId = crypto.randomUUID ? crypto.randomUUID() : `usr-${Date.now()}`;
    const profileId = crypto.randomUUID ? crypto.randomUUID() : `prof-${Date.now()}`;

    // 1. Insert into users
    const { error: userError } = await supabase.from('users').insert({
      id: userId,
      email: params.email,
      phone: params.phone,
      role: params.role,
      is_active: true,
      is_verified: true,
    });

    if (userError) {
      console.warn('Supabase users insert warning:', userError.message);
    }

    // 2. Insert into profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      id: profileId,
      user_id: userId,
      full_name: params.fullName,
      location_county: params.county || 'Nairobi',
      location_subcounty: params.subcounty || 'Westlands',
    });

    if (profileError) {
      console.warn('Supabase profiles insert warning:', profileError.message);
    }

    // 3. Insert into role table
    let roleRecord: any = null;
    if (params.role === 'DRIVER') {
      const driverId = crypto.randomUUID ? crypto.randomUUID() : `drv-${Date.now()}`;
      const driverData = {
        id: driverId,
        user_id: userId,
        driving_experience_years: params.experienceYears || 2,
        preferred_operating_areas: [params.subcounty || 'Westlands', 'CBD / Starehe'],
        preferred_platforms: ['Uber', 'Bolt', 'Little'],
        preferred_vehicle_types: ['SEDAN', 'HATCHBACK'],
        preferred_arrangement_types: ['DAILY_TARGET'],
        max_daily_target_kes: 3000,
        is_available: true,
        rating_avg: 5.0,
        rating_count: 0,
        completed_engagements_count: 0,
        identity_verified: true,
        license_verified: true,
      };

      const { error: driverError } = await supabase.from('drivers').insert(driverData);
      if (driverError) console.warn('Supabase drivers insert warning:', driverError.message);

      roleRecord = {
        id: driverId,
        userId,
        drivingExperienceYears: params.experienceYears || 2,
        preferredOperatingAreas: [params.subcounty || 'Westlands', 'CBD / Starehe'],
        preferredPlatforms: ['Uber', 'Bolt', 'Little'],
        preferredVehicleTypes: ['SEDAN', 'HATCHBACK'],
        preferredArrangementTypes: ['DAILY_TARGET'],
        maxDailyTargetKes: 3000,
        availableFrom: new Date().toISOString(),
        isAvailable: true,
        ratingAvg: 5.0,
        ratingCount: 0,
        completedEngagementsCount: 0,
        identityVerified: true,
        licenseVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else if (params.role === 'PARTNER') {
      const partnerId = crypto.randomUUID ? crypto.randomUUID() : `prt-${Date.now()}`;
      const partnerData = {
        id: partnerId,
        user_id: userId,
        partner_type: 'INDIVIDUAL',
        company_name: params.companyName || params.fullName,
        rating_avg: 5.0,
        rating_count: 0,
        total_vehicles_count: 0,
        active_agreements_count: 0,
        identity_verified: true,
        business_verified: false,
      };

      const { error: partnerError } = await supabase.from('partners').insert(partnerData);
      if (partnerError) console.warn('Supabase partners insert warning:', partnerError.message);

      roleRecord = {
        id: partnerId,
        userId,
        partnerType: 'INDIVIDUAL',
        companyName: params.companyName || params.fullName,
        ratingAvg: 5.0,
        ratingCount: 0,
        totalVehiclesCount: 0,
        activeAgreementsCount: 0,
        identityVerified: true,
        businessVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const user: User = {
      id: userId,
      email: params.email,
      phone: params.phone,
      role: params.role,
      isActive: true,
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const profile: Profile = {
      id: profileId,
      userId,
      fullName: params.fullName,
      locationCounty: params.county || 'Nairobi',
      locationSubcounty: params.subcounty || 'Westlands',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { user, profile, roleRecord };
  }

  // ----------------------------------------------------------------------------
  // VEHICLES CRUD
  // ----------------------------------------------------------------------------
  async getVehicles(partnerId?: string): Promise<Vehicle[]> {
    let query = supabase.from('vehicles').select('*');
    if (partnerId) {
      query = query.eq('partner_id', partnerId);
    }
    const { data, error } = await query;
    if (error || !data) {
      return [];
    }
    return data.map(v => ({
      id: v.id,
      partnerId: v.partner_id,
      make: v.make,
      model: v.model,
      year: v.year,
      registrationNumber: v.registration_number,
      vehicleType: v.vehicle_type,
      transmission: v.transmission,
      fuelType: v.fuel_type,
      seatingCapacity: v.seating_capacity || 4,
      color: v.color,
      mileageKm: v.mileage_km,
      primaryCounty: v.primary_county || 'Nairobi',
      primarySubcounty: v.primary_subcounty,
      supportedPlatforms: v.supported_platforms || ['Uber', 'Bolt'],
      photos: v.photos || [],
      verificationStatus: v.verification_status || 'VERIFIED',
      availabilityStatus: v.availability_status || 'AVAILABLE',
      createdAt: v.created_at || new Date().toISOString(),
      updatedAt: v.updated_at || new Date().toISOString(),
    }));
  }

  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    const id = crypto.randomUUID ? crypto.randomUUID() : `veh-${Date.now()}`;
    const row = {
      id,
      partner_id: vehicle.partnerId,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      registration_number: vehicle.registrationNumber,
      vehicle_type: vehicle.vehicleType,
      transmission: vehicle.transmission,
      fuel_type: vehicle.fuelType,
      seating_capacity: vehicle.seatingCapacity,
      color: vehicle.color,
      primary_county: vehicle.primaryCounty,
      primary_subcounty: vehicle.primarySubcounty,
      supported_platforms: vehicle.supportedPlatforms,
      photos: vehicle.photos,
      verification_status: vehicle.verificationStatus,
      availability_status: vehicle.availabilityStatus,
    };

    const { error } = await supabase.from('vehicles').insert(row);
    if (error) console.warn('Supabase vehicle insert warning:', error.message);

    return {
      ...vehicle,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) console.warn('Supabase vehicle delete warning:', error.message);
    return !error;
  }

  // ----------------------------------------------------------------------------
  // VEHICLE LISTINGS CRUD
  // ----------------------------------------------------------------------------
  async getListings(): Promise<VehicleListing[]> {
    const { data, error } = await supabase
      .from('vehicle_listings')
      .select('*, vehicles(*)')
      .eq('status', 'PUBLISHED');

    if (error || !data) {
      return [];
    }

    return data.map(l => ({
      id: l.id,
      vehicleId: l.vehicle_id,
      partnerId: l.partner_id,
      title: l.title,
      description: l.description,
      county: l.county || 'Nairobi',
      subcounty: l.subcounty,
      arrangementType: l.arrangement_type,
      targetAmountKes: Number(l.target_amount_kes),
      depositAmountKes: Number(l.deposit_amount_kes || 0),
      paymentFrequency: l.payment_frequency,
      fuelResponsibility: l.fuel_responsibility,
      maintenanceResponsibility: l.maintenance_responsibility,
      insuranceResponsibility: l.insurance_responsibility,
      preferredPlatforms: l.preferred_platforms || ['Uber', 'Bolt'],
      driverMinExperienceYears: l.driver_min_experience_years || 1,
      driverRequirementsSummary: l.driver_requirements_summary,
      availableFrom: l.available_from,
      status: l.status,
      viewCount: l.view_count || 0,
      applicationsCount: l.applications_count || 0,
      publishedAt: l.published_at,
      createdAt: l.created_at,
      updatedAt: l.updated_at,
      vehicle: l.vehicles ? {
        id: l.vehicles.id,
        partnerId: l.vehicles.partner_id,
        make: l.vehicles.make,
        model: l.vehicles.model,
        year: l.vehicles.year,
        registrationNumber: l.vehicles.registration_number,
        vehicleType: l.vehicles.vehicle_type,
        transmission: l.vehicles.transmission,
        fuelType: l.vehicles.fuel_type,
        seatingCapacity: l.vehicles.seating_capacity,
        color: l.vehicles.color,
        primaryCounty: l.vehicles.primary_county,
        primarySubcounty: l.vehicles.primary_subcounty,
        supportedPlatforms: l.vehicles.supported_platforms,
        photos: l.vehicles.photos || [],
        verificationStatus: l.vehicles.verification_status,
        availabilityStatus: l.vehicles.availability_status,
        createdAt: l.vehicles.created_at,
        updatedAt: l.vehicles.updated_at,
      } : undefined,
    }));
  }

  async createListing(listing: Omit<VehicleListing, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'applicationsCount'>): Promise<VehicleListing> {
    const id = crypto.randomUUID ? crypto.randomUUID() : `lst-${Date.now()}`;
    const row = {
      id,
      vehicle_id: listing.vehicleId,
      partner_id: listing.partnerId,
      title: listing.title,
      description: listing.description,
      county: listing.county,
      subcounty: listing.subcounty,
      arrangement_type: listing.arrangementType,
      target_amount_kes: listing.targetAmountKes,
      deposit_amount_kes: listing.depositAmountKes,
      payment_frequency: listing.paymentFrequency,
      fuel_responsibility: listing.fuelResponsibility,
      maintenance_responsibility: listing.maintenanceResponsibility,
      insurance_responsibility: listing.insuranceResponsibility,
      preferred_platforms: listing.preferredPlatforms,
      driver_min_experience_years: listing.driverMinExperienceYears,
      driver_requirements_summary: listing.driverRequirementsSummary,
      available_from: listing.availableFrom,
      status: listing.status,
    };

    const { error } = await supabase.from('vehicle_listings').insert(row);
    if (error) console.warn('Supabase listing insert warning:', error.message);

    return {
      ...listing,
      id,
      viewCount: 0,
      applicationsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async deleteListing(id: string): Promise<boolean> {
    const { error } = await supabase.from('vehicle_listings').delete().eq('id', id);
    if (error) console.warn('Supabase listing delete warning:', error.message);
    return !error;
  }

  // ----------------------------------------------------------------------------
  // APPLICATIONS CRUD
  // ----------------------------------------------------------------------------
  async createApplication(app: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>): Promise<Application> {
    const id = crypto.randomUUID ? crypto.randomUUID() : `app-${Date.now()}`;
    const row = {
      id,
      listing_id: app.listingId,
      driver_id: app.driverId,
      partner_id: app.partnerId,
      status: app.status,
      cover_note: app.coverNote,
      match_score_pct: app.matchScorePct,
      last_status_changed_by: app.lastStatusChangedBy,
    };

    const { error } = await supabase.from('applications').insert(row);
    if (error) console.warn('Supabase application insert warning:', error.message);

    return {
      ...app,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async updateApplicationStatus(id: string, status: ApplicationStatus, reason?: string): Promise<boolean> {
    const { error } = await supabase
      .from('applications')
      .update({
        status,
        status_reason: reason,
        last_status_changed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) console.warn('Supabase application update warning:', error.message);
    return !error;
  }

  // ----------------------------------------------------------------------------
  // AGREEMENTS CRUD
  // ----------------------------------------------------------------------------
  async createAgreement(agr: Omit<Agreement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agreement> {
    const id = crypto.randomUUID ? crypto.randomUUID() : `agr-${Date.now()}`;
    const row = {
      id,
      agreement_number: agr.agreementNumber,
      application_id: agr.applicationId,
      listing_id: agr.listingId,
      driver_id: agr.driverId,
      partner_id: agr.partnerId,
      vehicle_id: agr.vehicleId,
      arrangement_type: agr.arrangementType,
      target_amount_kes: agr.targetAmountKes,
      deposit_amount_kes: agr.depositAmountKes,
      payment_frequency: agr.paymentFrequency,
      fuel_terms: agr.fuelTerms,
      maintenance_terms: agr.maintenanceTerms,
      insurance_terms: agr.insuranceTerms,
      operating_area: agr.operatingArea,
      start_date: agr.startDate,
      terms_and_conditions: agr.termsAndConditions,
      status: agr.status,
    };

    const { error } = await supabase.from('agreements').insert(row);
    if (error) console.warn('Supabase agreement insert warning:', error.message);

    return {
      ...agr,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async signAgreement(id: string, role: 'DRIVER' | 'PARTNER'): Promise<boolean> {
    const timestamp = new Date().toISOString();
    const updateData: any = { updated_at: timestamp };

    if (role === 'DRIVER') {
      updateData.driver_signed_at = timestamp;
      updateData.status = 'ACTIVE';
    } else {
      updateData.partner_signed_at = timestamp;
    }

    const { error } = await supabase.from('agreements').update(updateData).eq('id', id);
    if (error) console.warn('Supabase agreement sign warning:', error.message);
    return !error;
  }
}

export const dbService = new DatabaseService();

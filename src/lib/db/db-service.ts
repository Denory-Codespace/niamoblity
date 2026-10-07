// ==============================================================================
// nia mobility - Real Supabase Database CRUD Service
// Developed by Denory Codespace
// ==============================================================================

import { supabase } from '../supabase/client';
import { generateUUID } from '@/lib/utils';
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
  }): Promise<{ user: User; profile: Profile; roleRecord: any; supabaseSynced: boolean }> {
    const userId = generateUUID();
    const profileId = generateUUID();
    let supabaseSynced = true;

    // 1. Insert into users
    const { error: userError } = await supabase.from('users').insert({
      id: userId,
      email: params.email.trim().toLowerCase(),
      phone: params.phone.trim(),
      role: params.role,
      is_active: true,
      is_verified: true,
    });

    if (userError) {
      if (userError.code === '23505') {
        throw new Error('An account with this email or phone number already exists. Please log in.');
      }
      if (userError.code === '42501') {
        console.warn('⚠️ Supabase RLS is currently active. Storing locally. Run prisma/rls_fix.sql in Supabase to sync live.');
        supabaseSynced = false;
      } else {
        console.warn('Supabase users insert notice:', userError.message);
        supabaseSynced = false;
      }
    }

    // 2. Insert into profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      id: profileId,
      user_id: userId,
      full_name: params.fullName.trim(),
      location_county: params.county || 'Nairobi',
      location_subcounty: params.subcounty || 'Westlands',
    });

    if (profileError) {
      console.warn('Supabase profiles insert notice:', profileError.message);
    }

    // 3. Insert into role table
    let roleRecord: any = null;
    if (params.role === 'DRIVER') {
      const driverId = generateUUID();
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
      if (driverError) console.warn('Supabase drivers insert notice:', driverError.message);

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
      const partnerId = generateUUID();
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
      if (partnerError) console.warn('Supabase partners insert notice:', partnerError.message);

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
      email: params.email.trim().toLowerCase(),
      phone: params.phone.trim(),
      role: params.role,
      isActive: true,
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const profile: Profile = {
      id: profileId,
      userId,
      fullName: params.fullName.trim(),
      locationCounty: params.county || 'Nairobi',
      locationSubcounty: params.subcounty || 'Westlands',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { user, profile, roleRecord, supabaseSynced };
  }

  async loginUser(identifier: string): Promise<{
    user: User;
    profile?: Profile;
    roleRecord?: DriverProfile | PartnerProfile;
  } | null> {
    const cleanId = identifier.trim().toLowerCase();

    // Look up in Supabase
    const { data: usersData, error: userError } = await supabase
      .from('users')
      .select('*')
      .or(`email.ilike.${cleanId},phone.eq.${cleanId}`)
      .limit(1);

    if (userError || !usersData || usersData.length === 0) {
      return null;
    }

    const u = usersData[0];
    const user: User = {
      id: u.id,
      email: u.email,
      phone: u.phone,
      role: u.role,
      isActive: u.is_active,
      isVerified: u.is_verified,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
    };

    let profile: Profile | undefined = undefined;
    const { data: profData } = await supabase.from('profiles').select('*').eq('user_id', u.id).limit(1);
    if (profData && profData.length > 0) {
      const p = profData[0];
      profile = {
        id: p.id,
        userId: p.user_id,
        fullName: p.full_name,
        avatarUrl: p.avatar_url,
        locationCounty: p.location_county,
        locationSubcounty: p.location_subcounty,
        bio: p.bio,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      };
    }

    let roleRecord: any = null;
    if (u.role === 'DRIVER') {
      const { data: drvData } = await supabase.from('drivers').select('*').eq('user_id', u.id).limit(1);
      if (drvData && drvData.length > 0) {
        const d = drvData[0];
        roleRecord = {
          id: d.id,
          userId: d.user_id,
          drivingExperienceYears: d.driving_experience_years || 0,
          preferredOperatingAreas: d.preferred_operating_areas || [],
          preferredPlatforms: d.preferred_platforms || [],
          preferredVehicleTypes: d.preferred_vehicle_types || [],
          preferredArrangementTypes: d.preferred_arrangement_types || [],
          maxDailyTargetKes: d.max_daily_target_kes ? Number(d.max_daily_target_kes) : undefined,
          availableFrom: d.available_from,
          isAvailable: d.is_available,
          ratingAvg: Number(d.rating_avg || 5.0),
          ratingCount: d.rating_count || 0,
          completedEngagementsCount: d.completed_engagements_count || 0,
          identityVerified: d.identity_verified,
          licenseVerified: d.license_verified,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        };
      }
    } else if (u.role === 'PARTNER') {
      const { data: prtData } = await supabase.from('partners').select('*').eq('user_id', u.id).limit(1);
      if (prtData && prtData.length > 0) {
        const pr = prtData[0];
        roleRecord = {
          id: pr.id,
          userId: pr.user_id,
          partnerType: pr.partner_type || 'INDIVIDUAL',
          companyName: pr.company_name,
          ratingAvg: Number(pr.rating_avg || 5.0),
          ratingCount: pr.rating_count || 0,
          totalVehiclesCount: pr.total_vehicles_count || 0,
          activeAgreementsCount: pr.active_agreements_count || 0,
          identityVerified: pr.identity_verified,
          businessVerified: pr.business_verified,
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
        };
      }
    }

    return { user, profile, roleRecord };
  }

  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error || !data) return [];
    return data.map(u => ({
      id: u.id,
      email: u.email,
      phone: u.phone,
      role: u.role,
      isActive: u.is_active,
      isVerified: u.is_verified,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
    }));
  }

  async getProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error || !data) return [];
    return data.map(p => ({
      id: p.id,
      userId: p.user_id,
      fullName: p.full_name,
      avatarUrl: p.avatar_url,
      locationCounty: p.location_county,
      locationSubcounty: p.location_subcounty,
      bio: p.bio,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
  }

  async getDrivers(): Promise<DriverProfile[]> {
    const { data, error } = await supabase.from('drivers').select('*');
    if (error || !data) return [];
    return data.map(d => ({
      id: d.id,
      userId: d.user_id,
      drivingExperienceYears: d.driving_experience_years || 0,
      preferredOperatingAreas: d.preferred_operating_areas || [],
      preferredPlatforms: d.preferred_platforms || [],
      preferredVehicleTypes: d.preferred_vehicle_types || [],
      preferredArrangementTypes: d.preferred_arrangement_types || [],
      maxDailyTargetKes: d.max_daily_target_kes ? Number(d.max_daily_target_kes) : undefined,
      availableFrom: d.available_from,
      isAvailable: d.is_available,
      ratingAvg: Number(d.rating_avg || 5.0),
      ratingCount: d.rating_count || 0,
      completedEngagementsCount: d.completed_engagements_count || 0,
      identityVerified: d.identity_verified,
      licenseVerified: d.license_verified,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  }

  async getPartners(): Promise<PartnerProfile[]> {
    const { data, error } = await supabase.from('partners').select('*');
    if (error || !data) return [];
    return data.map(p => ({
      id: p.id,
      userId: p.user_id,
      partnerType: p.partner_type || 'INDIVIDUAL',
      companyName: p.company_name,
      ratingAvg: Number(p.rating_avg || 5.0),
      ratingCount: p.rating_count || 0,
      totalVehiclesCount: p.total_vehicles_count || 0,
      activeAgreementsCount: p.active_agreements_count || 0,
      identityVerified: p.identity_verified,
      businessVerified: p.business_verified,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
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
    const id = generateUUID();
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
    if (error) console.warn('Supabase vehicle insert notice:', error.message);

    return {
      ...vehicle,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) console.warn('Supabase vehicle delete notice:', error.message);
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
    const id = generateUUID();
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
    if (error) console.warn('Supabase listing insert notice:', error.message);

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
    if (error) console.warn('Supabase listing delete notice:', error.message);
    return !error;
  }

  // ----------------------------------------------------------------------------
  // APPLICATIONS CRUD
  // ----------------------------------------------------------------------------
  async getApplications(filter?: { driverId?: string; partnerId?: string }): Promise<Application[]> {
    let query = supabase.from('applications').select('*');
    if (filter?.driverId) query = query.eq('driver_id', filter.driverId);
    if (filter?.partnerId) query = query.eq('partner_id', filter.partnerId);
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(a => ({
      id: a.id,
      listingId: a.listing_id,
      driverId: a.driver_id,
      partnerId: a.partner_id,
      status: a.status,
      coverNote: a.cover_note || '',
      matchScorePct: a.match_score_pct || 0,
      statusReason: a.status_reason,
      lastStatusChangedBy: a.last_status_changed_by,
      lastStatusChangedAt: a.last_status_changed_at,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    }));
  }

  async createApplication(app: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>): Promise<Application> {
    const id = generateUUID();
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
    if (error) console.warn('Supabase application insert notice:', error.message);

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

    if (error) console.warn('Supabase application update notice:', error.message);
    return !error;
  }

  // ----------------------------------------------------------------------------
  // AGREEMENTS CRUD
  // ----------------------------------------------------------------------------
  async getAgreements(filter?: { driverId?: string; partnerId?: string }): Promise<Agreement[]> {
    let query = supabase.from('agreements').select('*');
    if (filter?.driverId) query = query.eq('driver_id', filter.driverId);
    if (filter?.partnerId) query = query.eq('partner_id', filter.partnerId);
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(agr => ({
      id: agr.id,
      agreementNumber: agr.agreement_number,
      applicationId: agr.application_id,
      listingId: agr.listing_id,
      driverId: agr.driver_id,
      partnerId: agr.partner_id,
      vehicleId: agr.vehicle_id,
      arrangementType: agr.arrangement_type,
      targetAmountKes: Number(agr.target_amount_kes),
      depositAmountKes: Number(agr.deposit_amount_kes || 0),
      paymentFrequency: agr.payment_frequency,
      fuelTerms: agr.fuel_terms,
      maintenanceTerms: agr.maintenance_terms,
      insuranceTerms: agr.insurance_terms,
      operatingArea: agr.operating_area,
      startDate: agr.start_date,
      endDate: agr.end_date,
      termsAndConditions: agr.terms_and_conditions,
      status: agr.status,
      partnerSignedAt: agr.partner_signed_at,
      driverSignedAt: agr.driver_signed_at,
      terminationReason: agr.termination_reason,
      createdAt: agr.created_at,
      updatedAt: agr.updated_at,
    }));
  }

  async createAgreement(agr: Omit<Agreement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agreement> {
    const id = generateUUID();
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
      operatingArea: agr.operatingArea,
      start_date: agr.startDate,
      terms_and_conditions: agr.termsAndConditions,
      status: agr.status,
    };

    const { error } = await supabase.from('agreements').insert(row);
    if (error) console.warn('Supabase agreement insert notice:', error.message);

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
    if (error) console.warn('Supabase agreement sign notice:', error.message);
    return !error;
  }
}

export const dbService = new DatabaseService();

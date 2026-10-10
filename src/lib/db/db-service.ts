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
    password?: string;
    county?: string;
    subcounty?: string;
    experienceYears?: number;
    companyName?: string;
  }): Promise<{ user: User; profile: Profile; roleRecord: any; supabaseSynced: boolean }> {
    const userId = generateUUID();
    const profileId = generateUUID();
    let supabaseSynced = true;

    // 1. Insert into users (including password if provided)
    const userInsertData: any = {
      id: userId,
      email: params.email.trim().toLowerCase(),
      phone: params.phone.trim(),
      role: params.role,
      is_active: true,
      is_verified: true,
    };
    if (params.password) {
      userInsertData.password = params.password.trim();
    }

    const { error: userError } = await supabase.from('users').insert(userInsertData);

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
      password: params.password?.trim(),
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

  async loginUser(identifier: string, password?: string): Promise<{
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

    // Password validation if password is set on the account
    if (u.password) {
      if (!password || !password.trim()) {
        throw new Error('Please enter your password to sign in.');
      }
      if (u.password !== password.trim()) {
        throw new Error('Incorrect password. Please verify your credentials and try again.');
      }
    }

    const user: User = {
      id: u.id,
      email: u.email,
      phone: u.phone,
      role: u.role,
      password: u.password,
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
      avatarUrl: u.avatar_url,
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

  async updateProfile(userId: string, updates: {
    fullName?: string;
    bio?: string;
    locationCounty?: string;
    locationSubcounty?: string;
    phone?: string;
  }): Promise<boolean> {
    const profileUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.fullName) profileUpdates.full_name = updates.fullName;
    if (updates.bio !== undefined) profileUpdates.bio = updates.bio;
    if (updates.locationCounty) profileUpdates.location_county = updates.locationCounty;
    if (updates.locationSubcounty !== undefined) profileUpdates.location_subcounty = updates.locationSubcounty;

    const { error: profErr } = await supabase.from('profiles').update(profileUpdates).eq('user_id', userId);
    if (profErr) console.warn('Supabase profile update notice:', profErr.message);

    // Update phone on user row if provided
    if (updates.phone) {
      await supabase.from('users').update({ phone: updates.phone, updated_at: new Date().toISOString() }).eq('id', userId);
    }

    return !profErr;
  }

  async deleteUserAccount(userId: string, role: UserRole): Promise<boolean> {
    try {
      // 1. Delete applications referencing this user
      if (role === 'DRIVER') {
        const { data: driver } = await supabase.from('drivers').select('id').eq('user_id', userId).limit(1);
        if (driver && driver[0]) {
          await supabase.from('applications').delete().eq('driver_id', driver[0].id);
          await supabase.from('agreements').delete().eq('driver_id', driver[0].id);
          await supabase.from('drivers').delete().eq('id', driver[0].id);
        }
      } else if (role === 'PARTNER') {
        const { data: partner } = await supabase.from('partners').select('id').eq('user_id', userId).limit(1);
        if (partner && partner[0]) {
          await supabase.from('applications').delete().eq('partner_id', partner[0].id);
          await supabase.from('agreements').delete().eq('partner_id', partner[0].id);
          await supabase.from('vehicle_listings').delete().eq('partner_id', partner[0].id);
          await supabase.from('vehicles').delete().eq('partner_id', partner[0].id);
          await supabase.from('partners').delete().eq('id', partner[0].id);
        }
      }

      // 2. Delete profile, notifications, conversations, messages
      await supabase.from('profiles').delete().eq('user_id', userId);
      await supabase.from('notifications').delete().eq('user_id', userId);

      // 3. Delete the user row
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) console.warn('Supabase user delete notice:', error.message);
      return !error;
    } catch (e) {
      console.warn('Account deletion error:', e);
      return false;
    }
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
      phone: p.phone,
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
      if (error) console.warn('Supabase getVehicles notice:', error.message);
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

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<boolean> {
    const row: Record<string, any> = {};
    if (updates.make !== undefined) row.make = updates.make;
    if (updates.model !== undefined) row.model = updates.model;
    if (updates.year !== undefined) row.year = updates.year;
    if (updates.registrationNumber !== undefined) row.registration_number = updates.registrationNumber;
    if (updates.transmission !== undefined) row.transmission = updates.transmission;
    if (updates.fuelType !== undefined) row.fuel_type = updates.fuelType;
    if (updates.color !== undefined) row.color = updates.color;
    if (updates.primarySubcounty !== undefined) row.primary_subcounty = updates.primarySubcounty;
    if (updates.availabilityStatus !== undefined) row.availability_status = updates.availabilityStatus;
    row.updated_at = new Date().toISOString();

    const { error } = await supabase.from('vehicles').update(row).eq('id', id);
    if (error) console.warn('Supabase vehicle update notice:', error.message);
    return !error;
  }

  // ----------------------------------------------------------------------------
  // VEHICLE LISTINGS CRUD
  // ----------------------------------------------------------------------------
  async getListings(): Promise<VehicleListing[]> {
    let rawListings: any[] = [];
    let vehiclesJoined = false;

    // 1. Try relational joined query
    const { data: joinedData, error: joinErr } = await supabase
      .from('vehicle_listings')
      .select('*, vehicles(*)');

    if (!joinErr && joinedData && joinedData.length > 0) {
      rawListings = joinedData;
      vehiclesJoined = true;
    } else {
      if (joinErr) console.warn('Supabase vehicle_listings join query note, using flat query fallback:', joinErr.message);
      // 2. Safe fallback: query vehicle_listings directly
      const { data: flatData, error: flatErr } = await supabase
        .from('vehicle_listings')
        .select('*');
      if (flatErr) {
        console.warn('Supabase vehicle_listings flat query note:', flatErr.message);
        return [];
      }
      rawListings = flatData || [];
    }

    return rawListings.map(l => ({
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
      status: l.status || 'PUBLISHED',
      viewCount: l.view_count || 0,
      applicationsCount: l.applications_count || 0,
      publishedAt: l.published_at,
      createdAt: l.created_at,
      updatedAt: l.updated_at,
      vehicle: (vehiclesJoined && l.vehicles) ? {
        id: l.vehicles.id,
        partnerId: l.vehicles.partner_id,
        make: l.vehicles.make,
        model: l.vehicles.model,
        year: l.vehicles.year,
        registrationNumber: l.vehicles.registration_number,
        vehicleType: l.vehicles.vehicle_type,
        transmission: l.vehicles.transmission,
        fuelType: l.vehicles.fuel_type,
        seatingCapacity: l.vehicles.seating_capacity || 4,
        color: l.vehicles.color,
        primaryCounty: l.vehicles.primary_county || 'Nairobi',
        primarySubcounty: l.vehicles.primary_subcounty,
        supportedPlatforms: l.vehicles.supported_platforms || ['Uber', 'Bolt'],
        photos: l.vehicles.photos || [],
        verificationStatus: l.vehicles.verification_status || 'VERIFIED',
        availabilityStatus: l.vehicles.availability_status || 'AVAILABLE',
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

  async updateListing(id: string, updates: Partial<VehicleListing>): Promise<boolean> {
    const row: Record<string, any> = {};
    if (updates.title !== undefined) row.title = updates.title;
    if (updates.description !== undefined) row.description = updates.description;
    if (updates.targetAmountKes !== undefined) row.target_amount_kes = updates.targetAmountKes;
    if (updates.depositAmountKes !== undefined) row.deposit_amount_kes = updates.depositAmountKes;
    if (updates.arrangementType !== undefined) row.arrangement_type = updates.arrangementType;
    if (updates.paymentFrequency !== undefined) row.payment_frequency = updates.paymentFrequency;
    if (updates.fuelResponsibility !== undefined) row.fuel_responsibility = updates.fuelResponsibility;
    if (updates.maintenanceResponsibility !== undefined) row.maintenance_responsibility = updates.maintenanceResponsibility;
    if (updates.insuranceResponsibility !== undefined) row.insurance_responsibility = updates.insuranceResponsibility;
    if (updates.preferredPlatforms !== undefined) row.preferred_platforms = updates.preferredPlatforms;
    if (updates.subcounty !== undefined) row.subcounty = updates.subcounty;
    if (updates.county !== undefined) row.county = updates.county;
    if (updates.status !== undefined) row.status = updates.status;
    row.updated_at = new Date().toISOString();

    const { error } = await supabase.from('vehicle_listings').update(row).eq('id', id);
    if (error) console.warn('Supabase listing update notice:', error.message);
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
      operating_area: agr.operatingArea,
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

  // ----------------------------------------------------------------------------
  // CONVERSATIONS & MESSAGES CRUD
  // ----------------------------------------------------------------------------
  async getConversations(): Promise<any[]> {
    const { data, error } = await supabase.from('conversations').select('*').order('last_message_at', { ascending: false });
    if (error || !data) return [];
    return data.map(c => ({
      id: c.id,
      driverId: c.driver_id,
      partnerId: c.partner_id,
      driverName: c.driver_name,
      partnerName: c.partner_name,
      listingId: c.listing_id,
      listingTitle: c.listing_title,
      lastMessage: c.last_message,
      lastMessageAt: c.last_message_at,
      unreadCount: c.unread_count || 0,
      createdAt: c.created_at,
    }));
  }

  async createOrUpdateConversation(conv: any): Promise<any> {
    const { error } = await supabase.from('conversations').upsert({
      id: conv.id,
      driver_id: conv.driverId,
      partner_id: conv.partnerId,
      driver_name: conv.driverName,
      partner_name: conv.partnerName,
      listing_id: conv.listingId || null,
      listing_title: conv.listingTitle || null,
      last_message: conv.lastMessage,
      last_message_at: conv.lastMessageAt || new Date().toISOString(),
      unread_count: conv.unreadCount || 0,
    });
    if (error) console.warn('Supabase conversation upsert notice:', error.message);
    return conv;
  }

  async getMessages(conversationId?: string): Promise<any[]> {
    let query = supabase.from('messages').select('*').order('created_at', { ascending: true });
    if (conversationId) query = query.eq('conversation_id', conversationId);
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(m => ({
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      senderName: m.sender_name,
      senderRole: m.sender_role,
      content: m.content,
      isRead: m.is_read,
      attachmentName: m.attachment_name,
      attachmentUrl: m.attachment_url,
      attachmentType: m.attachment_type,
      createdAt: m.created_at,
    }));
  }

  async createMessage(msg: any): Promise<any> {
    const { error } = await supabase.from('messages').insert({
      id: msg.id,
      conversation_id: msg.conversationId,
      sender_id: msg.senderId,
      sender_name: msg.senderName,
      sender_role: msg.senderRole,
      content: msg.content,
      attachment_name: msg.attachmentName || null,
      attachment_url: msg.attachmentUrl || null,
      attachment_type: msg.attachmentType || null,
      is_read: msg.isRead || false,
      created_at: msg.createdAt || new Date().toISOString(),
    });
    if (error) console.warn('Supabase message insert notice:', error.message);
    return msg;
  }

  // ----------------------------------------------------------------------------
  // NOTIFICATIONS CRUD
  // ----------------------------------------------------------------------------
  async getNotifications(userId?: string): Promise<any[]> {
    let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (userId && userId !== 'ALL') query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(n => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.is_read,
      linkUrl: n.link_url,
      createdAt: n.created_at,
    }));
  }

  async createNotification(notif: any): Promise<any> {
    const { error } = await supabase.from('notifications').insert({
      id: notif.id,
      user_id: notif.userId,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      is_read: notif.isRead || false,
      link_url: notif.linkUrl || null,
      created_at: notif.createdAt || new Date().toISOString(),
    });
    if (error) console.warn('Supabase notification insert notice:', error.message);
    return notif;
  }

  // ----------------------------------------------------------------------------
  // VERIFICATION DOCUMENTS CRUD
  // ----------------------------------------------------------------------------
  async getVerificationDocuments(userId?: string): Promise<any[]> {
    let query = supabase.from('verification_documents').select('*');
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) {
      console.warn('Supabase verification_documents query notice:', error.message);
      return [];
    }
    if (!data) return [];
    return data.map(d => ({
      id: d.id,
      userId: d.user_id,
      documentType: d.document_type,
      documentNumber: d.document_number,
      fileName: d.file_name || `${d.document_type}.pdf`,
      fileUrl: d.file_url || d.file_path,
      status: d.status || 'UNDER_REVIEW',
      rejectionReason: d.rejection_reason,
      verifiedAt: d.verified_at,
      createdAt: d.created_at,
    }));
  }

  async createVerificationDocument(doc: any): Promise<any> {
    const { error } = await supabase.from('verification_documents').insert({
      id: doc.id,
      user_id: doc.userId,
      document_type: doc.documentType,
      document_number: doc.documentNumber || null,
      file_name: doc.fileName,
      file_url: doc.fileUrl,
      file_path: doc.fileUrl,
      mime_type: 'application/pdf',
      status: doc.status || 'UNDER_REVIEW',
    });
    if (error) console.warn('Supabase verification_documents insert notice:', error.message);
    return doc;
  }
}

export const dbService = new DatabaseService();

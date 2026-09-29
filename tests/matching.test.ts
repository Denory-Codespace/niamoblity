import { describe, it, expect } from 'vitest';
import { MatchingService } from '../src/lib/matching/matching-service';
import { DriverProfile, VehicleListing } from '../src/types';

describe('Deterministic 7-Factor Matching Engine', () => {
  const matchingService = new MatchingService();

  const mockDriver: DriverProfile = {
    id: 'drv-test',
    userId: 'usr-test',
    drivingExperienceYears: 4,
    preferredOperatingAreas: ['Kasarani', 'Westlands'],
    preferredPlatforms: ['Uber', 'Bolt'],
    preferredVehicleTypes: ['SEDAN'],
    preferredArrangementTypes: ['DAILY_TARGET'],
    maxDailyTargetKes: 3000,
    availableFrom: new Date().toISOString(),
    isAvailable: true,
    ratingAvg: 4.9,
    ratingCount: 20,
    completedEngagementsCount: 3,
    identityVerified: true,
    licenseVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockListing: VehicleListing = {
    id: 'lst-test',
    vehicleId: 'veh-test',
    partnerId: 'prt-test',
    title: 'Toyota Fielder 2018 in Kasarani',
    description: 'Clean vehicle',
    county: 'Nairobi',
    subcounty: 'Kasarani',
    arrangementType: 'DAILY_TARGET',
    targetAmountKes: 2800,
    depositAmountKes: 15000,
    paymentFrequency: 'DAILY',
    fuelResponsibility: 'DRIVER',
    maintenanceResponsibility: 'PARTNER',
    insuranceResponsibility: 'PARTNER',
    preferredPlatforms: ['Uber', 'Bolt'],
    driverMinExperienceYears: 3,
    availableFrom: new Date().toISOString(),
    status: 'PUBLISHED',
    viewCount: 10,
    applicationsCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    vehicle: {
      id: 'veh-test',
      partnerId: 'prt-test',
      make: 'Toyota',
      model: 'Fielder',
      year: 2018,
      registrationNumber: 'KDG 123A',
      vehicleType: 'SEDAN',
      transmission: 'AUTOMATIC',
      fuelType: 'PETROL',
      seatingCapacity: 4,
      color: 'White',
      primaryCounty: 'Nairobi',
      primarySubcounty: 'Kasarani',
      supportedPlatforms: ['Uber', 'Bolt'],
      photos: [],
      verificationStatus: 'VERIFIED',
      availabilityStatus: 'AVAILABLE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  };

  it('calculates a high match score (>90%) for closely aligned driver and vehicle', () => {
    const result = matchingService.calculateMatch(mockDriver, mockListing);
    expect(result.totalScorePct).toBeGreaterThanOrEqual(90);
    expect(result.factors.locationMatch).toBe(true);
    expect(result.factors.vehicleTypeMatch).toBe(true);
    expect(result.factors.withinTargetBudget).toBe(true);
  });

  it('penalizes when driver target budget is exceeded', () => {
    const expensiveListing = {
      ...mockListing,
      targetAmountKes: 4500, // exceeds driver max 3000
    };
    const result = matchingService.calculateMatch(mockDriver, expensiveListing);
    expect(result.totalScorePct).toBeLessThan(90);
    expect(result.factors.withinTargetBudget).toBe(false);
  });
});

// ==============================================================================
// nia mobility - Deterministic Matching Engine
// Developed by Denory Codespace
// ==============================================================================

import { DriverProfile, VehicleListing, MatchScoreBreakdown } from '@/types';

export interface MatchingWeights {
  locationWeight: number;       // default 0.20 (20%)
  platformWeight: number;       // default 0.20 (20%)
  vehicleTypeWeight: number;    // default 0.15 (15%)
  experienceWeight: number;     // default 0.10 (10%)
  availabilityWeight: number;   // default 0.10 (10%)
  financialWeight: number;      // default 0.15 (15%)
  preferencesWeight: number;    // default 0.10 (10%)
}

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeights = {
  locationWeight: 0.20,
  platformWeight: 0.20,
  vehicleTypeWeight: 0.15,
  experienceWeight: 0.10,
  availabilityWeight: 0.10,
  financialWeight: 0.15,
  preferencesWeight: 0.10,
};

export class MatchingService {
  private weights: MatchingWeights;

  constructor(customWeights?: Partial<MatchingWeights>) {
    this.weights = { ...DEFAULT_MATCHING_WEIGHTS, ...customWeights };
  }

  /**
   * Calculate deterministic compatibility score between a driver and a listing.
   * Returns a breakdown and normalized percentage score (0 - 100%).
   */
  public calculateMatch(driver: DriverProfile, listing: VehicleListing): MatchScoreBreakdown {
    // 1. Location Compatibility (0 - 20 pts)
    let locationScore = 0;
    const countyMatch = listing.county.toLowerCase() === "nairobi"; // MVP primarily Nairobi
    const hasAreaOverlap = listing.subcounty
      ? driver.preferredOperatingAreas.some(
          area => area.toLowerCase().includes(listing.subcounty!.toLowerCase()) ||
                  listing.subcounty!.toLowerCase().includes(area.toLowerCase())
        )
      : true;

    if (countyMatch) {
      locationScore = hasAreaOverlap 
        ? this.weights.locationWeight * 100 
        : this.weights.locationWeight * 100 * 0.7; // 70% credit if same county but different sub-zone
    }

    // 2. Platform Compatibility (0 - 20 pts)
    // Jaccard similarity index between platforms
    const driverPlatforms = new Set(driver.preferredPlatforms.map(p => p.toLowerCase()));
    const listingPlatforms = listing.preferredPlatforms.length > 0
      ? listing.preferredPlatforms.map(p => p.toLowerCase())
      : (listing.vehicle?.supportedPlatforms || ["Uber", "Bolt"]).map(p => p.toLowerCase());
    
    const sharedPlatforms = listingPlatforms.filter(p => driverPlatforms.has(p));
    let platformRatio = 0;
    if (listingPlatforms.length > 0) {
      platformRatio = sharedPlatforms.length / listingPlatforms.length;
    } else {
      platformRatio = 0.5;
    }
    const platformScore = Math.min(1, platformRatio) * (this.weights.platformWeight * 100);

    // 3. Vehicle Type Preference (0 - 15 pts)
    let vehicleTypeScore = 0;
    const vehicleType = listing.vehicle?.vehicleType || "SEDAN";
    const vehicleTypeMatch = driver.preferredVehicleTypes.includes(vehicleType);
    if (vehicleTypeMatch || driver.preferredVehicleTypes.length === 0) {
      vehicleTypeScore = this.weights.vehicleTypeWeight * 100;
    } else {
      // Partial credit if driver has generic car experience
      vehicleTypeScore = this.weights.vehicleTypeWeight * 100 * 0.3;
    }

    // 4. Experience Compatibility (0 - 10 pts)
    let experienceScore = 0;
    const meetsExperience = driver.drivingExperienceYears >= listing.driverMinExperienceYears;
    if (meetsExperience) {
      experienceScore = this.weights.experienceWeight * 100;
    } else {
      const ratio = driver.drivingExperienceYears / Math.max(1, listing.driverMinExperienceYears);
      experienceScore = ratio * (this.weights.experienceWeight * 100);
    }

    // 5. Availability Alignment (0 - 10 pts)
    let availabilityScore = 0;
    if (driver.isAvailable) {
      const driverAvail = new Date(driver.availableFrom || Date.now()).getTime();
      const listingAvail = new Date(listing.availableFrom || Date.now()).getTime();
      // If driver is available right away or before/around listing date
      if (driverAvail <= listingAvail + 86400000 * 3) {
        availabilityScore = this.weights.availabilityWeight * 100;
      } else {
        availabilityScore = this.weights.availabilityWeight * 100 * 0.5;
      }
    }

    // 6. Financial Compatibility (0 - 15 pts)
    let financialScore = 0;
    const withinBudget = !driver.maxDailyTargetKes || listing.targetAmountKes <= driver.maxDailyTargetKes;
    if (withinBudget) {
      financialScore = this.weights.financialWeight * 100;
    } else if (driver.maxDailyTargetKes) {
      // Over budget - penalize proportionately
      const diffRatio = (listing.targetAmountKes - driver.maxDailyTargetKes) / driver.maxDailyTargetKes;
      const budgetPenalty = Math.max(0, 1 - diffRatio * 2);
      financialScore = budgetPenalty * (this.weights.financialWeight * 100);
    }

    // 7. Preferences & KYC Trust Bonus (0 - 10 pts)
    let preferencesScore = 0;
    let trustMultiplier = 0.5;
    if (driver.identityVerified && driver.licenseVerified) {
      trustMultiplier += 0.3;
    }
    if (driver.preferredArrangementTypes.includes(listing.arrangementType)) {
      trustMultiplier += 0.2;
    }
    preferencesScore = Math.min(1, trustMultiplier) * (this.weights.preferencesWeight * 100);

    // Sum and round total
    const totalScore = Math.round(
      locationScore +
      platformScore +
      vehicleTypeScore +
      experienceScore +
      availabilityScore +
      financialScore +
      preferencesScore
    );

    const totalScorePct = Math.min(100, Math.max(15, totalScore));

    return {
      locationScore: Math.round(locationScore),
      platformScore: Math.round(platformScore),
      vehicleTypeScore: Math.round(vehicleTypeScore),
      experienceScore: Math.round(experienceScore),
      availabilityScore: Math.round(availabilityScore),
      financialScore: Math.round(financialScore),
      preferencesScore: Math.round(preferencesScore),
      totalScorePct,
      factors: {
        locationMatch: hasAreaOverlap,
        platformsShared: sharedPlatforms,
        vehicleTypeMatch,
        meetsExperience,
        withinTargetBudget: withinBudget,
      }
    };
  }

  /**
   * Sort listings by match score for a specific driver
   */
  public rankListingsForDriver(
    driver: DriverProfile,
    listings: VehicleListing[]
  ): Array<VehicleListing & { matchScorePct: number; matchBreakdown: MatchScoreBreakdown }> {
    return listings
      .map(listing => {
        const matchBreakdown = this.calculateMatch(driver, listing);
        return {
          ...listing,
          matchScorePct: matchBreakdown.totalScorePct,
          matchBreakdown,
        };
      })
      .sort((a, b) => b.matchScorePct - a.matchScorePct);
  }
}

export const matchingService = new MatchingService();

import axios from "axios";
import { IWaterQualityRepository } from "@domain/repositories/IWaterQualityRepository";
import { WaterQuality } from "@domain/entities/WaterQuality";
import { Coordinates } from "@domain/valueObjects/Coordinates";
import { Score } from "@domain/valueObjects/Score";
import { Contaminant } from "@domain/valueObjects/Contaminant";
import { IGeocodingService } from "../services/GeocodingService";

interface EPAViolation {
  analyte_name: string;
  contaminant_code: string;
  violation_measure: string;
  unit_of_measure: string;
  mcl: string; // Maximum Contaminant Level
  mclg: string; // Maximum Contaminant Level Goal
  is_health_based_ind: string;
}

interface EPAFacility {
  pwsid: string;
  pws_name: string;
  primacy_agency_code: string;
  epa_region: string;
  pws_activity_code: string;
  pop_served_count: number;
}

export class EPAWaterQualityRepository implements IWaterQualityRepository {
  private readonly baseUrl = "https://data.epa.gov/efservice";
  private readonly geocodingService: IGeocodingService;

  constructor(geocodingService: IGeocodingService) {
    this.geocodingService = geocodingService;
  }

  async getWaterQuality(coordinates: Coordinates): Promise<WaterQuality> {
    try {
      console.log(
        `[EPAWaterQualityRepository] Fetching water quality for coordinates: lat=${coordinates.latitude}, lng=${coordinates.longitude}`
      );

      let locationInfo;
      try {
        // Get location info from coordinates
        locationInfo = await this.geocodingService.reverseGeocode(coordinates);
        console.log(
          `[EPAWaterQualityRepository] Reverse geocoded location info:`,
          locationInfo
        );
      } catch (geocodeError) {
        console.warn(
          `[EPAWaterQualityRepository] Geocoding failed, using fallback approach:`,
          geocodeError instanceof Error ? geocodeError.message : geocodeError
        );

        // Fallback: Use approximate location based on coordinates
        locationInfo = this.getLocationFallback(coordinates);
        console.log(
          `[EPAWaterQualityRepository] Using fallback location info:`,
          locationInfo
        );
      }

      if (
        !locationInfo.zipCode &&
        !locationInfo.county &&
        !locationInfo.stateCode
      ) {
        console.error(
          "[EPAWaterQualityRepository] Unable to determine location for water quality lookup",
          locationInfo
        );
        // Return default water quality instead of throwing error
        return this.createDefaultWaterQuality("Unknown Location");
      }

      // First, find water systems serving this area
      const facilities = await this.findWaterSystems(
        locationInfo.zipCode,
        locationInfo.stateCode || ""
      );
      console.log(
        `[EPAWaterQualityRepository] Found ${facilities.length} water system(s) for zipCode=${locationInfo.zipCode}, stateCode=${locationInfo.stateCode}`
      );

      if (facilities.length === 0) {
        // Return default water quality if no facilities found
        console.warn(
          "[EPAWaterQualityRepository] No water facilities found for location. Returning default water quality."
        );
        return this.createDefaultWaterQuality(locationInfo.city || "Unknown");
      }

      // Get violations for the primary facility
      const primaryFacility = facilities[0];
      console.log(
        `[EPAWaterQualityRepository] Using primary facility: ${primaryFacility.pwsid} (${primaryFacility.pws_name})`
      );
      const violations = await this.getViolations(primaryFacility.pwsid);
      console.log(
        `[EPAWaterQualityRepository] Found ${violations.length} health-based violation(s) for facility ${primaryFacility.pwsid}`
      );

      // Calculate score and create contaminants
      const contaminants = this.mapContaminants(violations);
      console.log(
        `[EPAWaterQualityRepository] Mapped contaminants:`,
        contaminants
      );
      const score = this.calculateScore(contaminants);
      console.log(
        `[EPAWaterQualityRepository] Calculated water quality score: ${score}`
      );

      const waterQuality = new WaterQuality({
        score: new Score(score),
        contaminants,
        location: locationInfo.city,
        utilityName: primaryFacility.pws_name,
        timestamp: new Date(),
      });

      console.log(
        "[EPAWaterQualityRepository] Returning WaterQuality entity:",
        waterQuality
      );

      return waterQuality;
    } catch (error) {
      console.error("EPA Water Quality API error:", error);
      throw new Error("Failed to fetch water quality data");
    }
  }

  private async findWaterSystems(
    zipCode: string | undefined,
    stateCode: string
  ): Promise<EPAFacility[]> {
    // If we have a zip code, try zip code search first
    if (zipCode && zipCode.trim()) {
      try {
        // Query sdwis.water_system directly by zip_code (this column exists in water_system table)
        const url = `${this.baseUrl}/sdwis.water_system/zip_code/equals/${zipCode}/pws_activity_code/equals/A/1:10/json`;
        console.log(
          `[EPAWaterQualityRepository] Requesting water systems by zip code: ${url}`
        );

        const response = await axios.get(url);
        console.log("response.data:", response.data);
        console.log(
          `[EPAWaterQualityRepository] Water systems API response (zip):`,
          Array.isArray(response.data)
            ? `Count: ${response.data.length}`
            : response.data
        );

        if (
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          return response.data;
        }
      } catch (error) {
        console.warn(
          "[EPAWaterQualityRepository] Zip code water system lookup failed, trying by state only.",
          error
        );
      }
    }

    // Fallback to state-only search
    try {
      const stateUrl = `${this.baseUrl}/sdwis.water_system/primacy_agency_code/equals/${stateCode}/pws_activity_code/equals/A/1:5/json`;
      console.log(
        `[EPAWaterQualityRepository] Requesting water systems by state: ${stateUrl}`
      );
      const response = await axios.get(stateUrl);
      console.log(
        `[EPAWaterQualityRepository] Water systems API response (state):`,
        Array.isArray(response.data)
          ? `Count: ${response.data.length}`
          : response.data
      );
      return response.data || [];
    } catch (stateError) {
      console.error(
        "[EPAWaterQualityRepository] State water system lookup failed.",
        stateError
      );
      return [];
    }
  }

  private async getViolations(pwsid: string): Promise<EPAViolation[]> {
    try {
      // Get violations for specific water system
      const url = `${this.baseUrl}/sdwis.violation/pwsid/equals/${pwsid}/is_health_based_ind/equals/Y/1:50/json`;
      console.log(
        `[EPAWaterQualityRepository] Requesting violations for PWSID=${pwsid}: ${url}`
      );

      const response = await axios.get(url);
      console.log(
        `[EPAWaterQualityRepository] Violations API response for PWSID=${pwsid}:`,
        Array.isArray(response.data)
          ? `Count: ${response.data.length}`
          : response.data
      );

      // Handle different response formats from EPA API
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        response.data.results
      ) {
        // Sometimes EPA API returns {results: [...]}
        return Array.isArray(response.data.results)
          ? response.data.results
          : [];
      } else {
        console.log(
          `[EPAWaterQualityRepository] No violations found for PWSID=${pwsid}`
        );
        return [];
      }
    } catch (error) {
      console.warn(
        `[EPAWaterQualityRepository] Failed to fetch violations for PWSID=${pwsid}. Returning empty list.`,
        error
      );
      return [];
    }
  }

  private mapContaminants(violations: EPAViolation[]): Contaminant[] {
    const contaminantMap = new Map<string, Contaminant>();

    // Key contaminants we're tracking
    const trackedContaminants: Record<
      string,
      { name: string; description: string }
    > = {
      HAA5: {
        name: "Haloacetic acids (HAA5)",
        description: "Byproducts of water disinfection",
      },
      HAA9: {
        name: "Haloacetic acids (HAA9)",
        description: "Byproducts of water disinfection",
      },
      TTHM: {
        name: "Total Trihalomethanes",
        description: "Byproducts of water disinfection",
      },
      TCE: { name: "Tetrachloroethylene", description: "Industrial solvent" },
      BROMATE: {
        name: "Bromate",
        description: "Byproduct of water disinfection",
      },
    };

    violations.forEach((v) => {
      const contaminantInfo = trackedContaminants[v.contaminant_code] || {
        name: v.analyte_name,
        description: "Water contaminant",
      };

      const value = parseFloat(v.violation_measure) || 0;
      const mcl = parseFloat(v.mcl) || undefined;
      const mclg = parseFloat(v.mclg) || undefined;

      contaminantMap.set(
        v.contaminant_code,
        new Contaminant({
          name: contaminantInfo.name,
          value,
          unit: v.unit_of_measure || "mg/L",
          legalLimit: mcl,
          healthLimit: mclg,
          description: contaminantInfo.description,
        })
      );
    });

    console.log(
      `[EPAWaterQualityRepository] Contaminant mapping complete. Contaminants:`,
      Array.from(contaminantMap.values())
    );

    return Array.from(contaminantMap.values());
  }

  private calculateScore(contaminants: Contaminant[]): number {
    if (contaminants.length === 0) {
      console.log(
        "[EPAWaterQualityRepository] No contaminants found. Returning perfect score (100)."
      );
      return 100;
    }

    let totalPenalty = 0;
    contaminants.forEach((c) => {
      const ratio = c.getExceedanceRatio();
      if (ratio && ratio > 1) {
        // Penalty increases with exceedance ratio
        totalPenalty += Math.min(50, ratio * 10);
        console.log(
          `[EPAWaterQualityRepository] Contaminant ${c} exceeds limit. Ratio: ${ratio}, Penalty: ${Math.min(
            50,
            ratio * 10
          )}`
        );
      }
    });

    const finalScore = Math.max(0, 100 - totalPenalty);
    console.log(
      `[EPAWaterQualityRepository] Final calculated water quality score: ${finalScore}`
    );
    return finalScore;
  }

  private createDefaultWaterQuality(location: string): WaterQuality {
    console.log(
      `[EPAWaterQualityRepository] Creating default WaterQuality for location: ${location}`
    );
    return new WaterQuality({
      score: new Score(75), // Default "Good" score
      contaminants: [],
      location,
      timestamp: new Date(),
    });
  }

  private getLocationFallback(coordinates: Coordinates): {
    zipCode?: string;
    city?: string;
    county?: string;
    state?: string;
    stateCode?: string;
  } {
    // Simple coordinate-based state mapping for US
    // This is a very basic fallback - in production you'd want a more sophisticated approach
    const { latitude, longitude } = coordinates;

    // Basic US state boundaries (very approximate)
    let stateCode = "US"; // Default fallback
    let state = "United States";

    // New York area (from the error logs: 40.7128, -74.0060)
    if (
      latitude >= 40.4 &&
      latitude <= 45.0 &&
      longitude >= -79.8 &&
      longitude <= -71.8
    ) {
      stateCode = "NY";
      state = "New York";
    }
    // California
    else if (
      latitude >= 32.5 &&
      latitude <= 42.0 &&
      longitude >= -124.4 &&
      longitude <= -114.1
    ) {
      stateCode = "CA";
      state = "California";
    }
    // Texas
    else if (
      latitude >= 25.8 &&
      latitude <= 36.5 &&
      longitude >= -106.6 &&
      longitude <= -93.5
    ) {
      stateCode = "TX";
      state = "Texas";
    }
    // Florida
    else if (
      latitude >= 24.5 &&
      latitude <= 31.0 &&
      longitude >= -87.6 &&
      longitude <= -80.0
    ) {
      stateCode = "FL";
      state = "Florida";
    }

    console.log(
      `[EPAWaterQualityRepository] Fallback location mapping: ${latitude}, ${longitude} -> ${stateCode} (${state})`
    );

    return {
      stateCode,
      state,
      city: "Unknown City",
    };
  }
}

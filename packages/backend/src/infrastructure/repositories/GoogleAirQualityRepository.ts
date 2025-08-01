import axios from "axios";
import { IAirQualityRepository } from "@domain/repositories/IAirQualityRepository";
import { AirQuality } from "@domain/entities/AirQuality";
import { Coordinates } from "@domain/valueObjects/Coordinates";
import { Score } from "@domain/valueObjects/Score";
import { Pollutant } from "@domain/valueObjects/Pollutant";

interface GoogleAirQualityResponse {
  indexes?: Array<{
    code: string;
    displayName: string;
    aqi: number;
    category: string;
    dominantPollutant: string;
  }>;
  pollutants?: Array<{
    code: string;
    displayName: string;
    fullName: string;
    concentration: {
      value: number;
      units: string;
    };
  }>;
}

export class GoogleAirQualityRepository implements IAirQualityRepository {
  private readonly apiKey: string;
  private readonly baseUrl =
    "https://airquality.googleapis.com/v1/currentConditions:lookup";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getAirQuality(coordinates: Coordinates): Promise<AirQuality> {
    try {
      console.log(
        `[GoogleAirQualityRepository] Fetching air quality for coordinates: lat=${coordinates.latitude}, lng=${coordinates.longitude}`
      );
      const url = `${this.baseUrl}?key=${this.apiKey}`;
      console.log(`[GoogleAirQualityRepository] Request URL: ${url}`);
      const response = await axios.post(`${this.baseUrl}?key=${this.apiKey}`, {
        location: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        },
        extraComputations: [
          "HEALTH_RECOMMENDATIONS",
          "DOMINANT_POLLUTANT_CONCENTRATION",
        ],
        languageCode: "en",
      });

      const data: GoogleAirQualityResponse = response.data;
      console.log(
        "[GoogleAirQualityRepository] Raw API response:",
        JSON.stringify(data, null, 2)
      );

      // Extract AQI from the universal index
      const universalIndex = data.indexes?.find((idx) => idx.code === "uaqi");
      const aqi = universalIndex?.aqi || 0;
      console.log(`[GoogleAirQualityRepository] Extracted AQI: ${aqi}`);

      // Calculate score (inverse of AQI, where lower AQI is better)
      // AQI ranges: 0-50 (Good), 51-100 (Moderate), 101-150 (Unhealthy for Sensitive),
      // 151-200 (Unhealthy), 201-300 (Very Unhealthy), 301+ (Hazardous)
      const score = this.calculateScoreFromAQI(aqi);
      console.log(
        `[GoogleAirQualityRepository] Calculated score from AQI: ${score}`
      );

      // Map pollutants
      const pollutants = this.mapPollutants(data.pollutants || []);
      console.log(
        `[GoogleAirQualityRepository] Mapped pollutants:`,
        pollutants
      );

      const airQuality = new AirQuality({
        score: new Score(score),
        aqi,
        pollutants,
        timestamp: new Date(),
      });

      console.log(
        "[GoogleAirQualityRepository] Returning AirQuality entity:",
        airQuality
      );

      return airQuality;
    } catch (error) {
      console.error(
        "[GoogleAirQualityRepository] Google Air Quality API error:",
        error
      );
      throw new Error("Failed to fetch air quality data");
    }
  }

  private calculateScoreFromAQI(aqi: number): number {
    if (aqi <= 50) return 100 - aqi * 0.4; // 100-80
    if (aqi <= 100) return 80 - (aqi - 50) * 0.6; // 80-50
    if (aqi <= 150) return 50 - (aqi - 100) * 0.4; // 50-30
    if (aqi <= 200) return 30 - (aqi - 150) * 0.3; // 30-15
    if (aqi <= 300) return 15 - (aqi - 200) * 0.1; // 15-5
    return Math.max(0, 5 - (aqi - 300) * 0.01); // 5-0
  }

  private mapPollutants(googlePollutants: any[]): Pollutant[] {
    const pollutantLimits: Record<string, { limit: number; unit: string }> = {
      pm25: { limit: 25, unit: "μg/m³" }, // WHO guideline
      pm10: { limit: 45, unit: "μg/m³" }, // WHO guideline
      no2: { limit: 25, unit: "μg/m³" }, // WHO guideline
      o3: { limit: 100, unit: "μg/m³" }, // WHO guideline
      so2: { limit: 40, unit: "μg/m³" }, // WHO guideline
      co: { limit: 4, unit: "mg/m³" }, // WHO guideline
    };

    const mapped = googlePollutants.map((p) => {
      const limitInfo = pollutantLimits[p.code.toLowerCase()] || {};
      const pollutant = new Pollutant({
        name: p.code,
        displayName: p.displayName,
        value: p.concentration.value,
        unit: p.concentration.units,
        limit: limitInfo.limit,
        description: p.fullName,
      });
      console.log(`[GoogleAirQualityRepository] Mapped pollutant:`, pollutant);
      return pollutant;
    });

    return mapped;
  }
}

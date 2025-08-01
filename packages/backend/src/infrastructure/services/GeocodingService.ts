import axios from "axios";
import { Coordinates } from "@domain/valueObjects/Coordinates";

export interface LocationInfo {
  zipCode?: string;
  city?: string;
  county?: string;
  state?: string;
  stateCode?: string;
}

export interface IGeocodingService {
  reverseGeocode(coordinates: Coordinates): Promise<LocationInfo>;
}

export class GeocodingService implements IGeocodingService {
  private readonly apiKey: string;
  private readonly baseUrl =
    "https://maps.googleapis.com/maps/api/geocode/json";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async reverseGeocode(coordinates: Coordinates): Promise<LocationInfo> {
    try {
      console.log(
        `[GeocodingService] Reverse geocoding coordinates: ${coordinates.toString()}`
      );
      console.log(`[GeocodingService] API Key present: ${!!this.apiKey}`);

      const response = await axios.get(this.baseUrl, {
        params: {
          latlng: coordinates.toString(),
          key: this.apiKey,
          result_type:
            "postal_code|administrative_area_level_2|administrative_area_level_1",
        },
      });

      console.log(
        `[GeocodingService] API Response Status: ${response.data.status}`
      );
      console.log(
        `[GeocodingService] API Response Results Count: ${
          response.data.results?.length || 0
        }`
      );
      console.log(
        `[GeocodingService] Full API Response:`,
        JSON.stringify(response.data, null, 2)
      );

      if (response.data.status !== "OK" || !response.data.results.length) {
        console.error(
          `[GeocodingService] API returned status: ${
            response.data.status
          }, error_message: ${response.data.error_message || "N/A"}`
        );
        throw new Error(
          `Unable to geocode coordinates: ${response.data.status} - ${
            response.data.error_message || "Unknown error"
          }`
        );
      }

      const locationInfo: LocationInfo = {};
      const results = response.data.results;

      for (const result of results) {
        for (const component of result.address_components) {
          const types = component.types;

          if (types.includes("postal_code")) {
            locationInfo.zipCode = component.long_name;
          }
          if (types.includes("locality")) {
            locationInfo.city = component.long_name;
          }
          if (types.includes("administrative_area_level_2")) {
            locationInfo.county = component.long_name;
          }
          if (types.includes("administrative_area_level_1")) {
            locationInfo.state = component.long_name;
            locationInfo.stateCode = component.short_name;
          }
        }
      }

      console.log(
        `[GeocodingService] Successfully parsed location info:`,
        locationInfo
      );
      return locationInfo;
    } catch (error) {
      console.error("[GeocodingService] Geocoding error:", error);

      // If it's an axios error, log more details
      if (axios.isAxiosError(error)) {
        console.error("[GeocodingService] Axios error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
      }

      throw new Error(
        `Failed to reverse geocode coordinates: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

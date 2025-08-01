import { EnvironmentalQuality } from "@domain/entities/EnvironmentalQuality";
import { IAirQualityRepository } from "@domain/repositories/IAirQualityRepository";
import { IWaterQualityRepository } from "@domain/repositories/IWaterQualityRepository";
import { Coordinates } from "@domain/valueObjects/Coordinates";

export interface GetEnvironmentalQualityInput {
  latitude: number;
  longitude: number;
}

export interface GetEnvironmentalQualityOutput {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  airQuality: any;
  waterQuality: any;
  overallHealth: string;
  timestamp: string;
}

export class GetEnvironmentalQuality {
  constructor(
    private readonly airQualityRepository: IAirQualityRepository,
    private readonly waterQualityRepository: IWaterQualityRepository
  ) {}

  async execute(
    input: GetEnvironmentalQualityInput
  ): Promise<GetEnvironmentalQualityOutput> {
    console.log("[GetEnvironmentalQuality] Received input:", input);

    const coordinates = new Coordinates(input.latitude, input.longitude);
    console.log("[GetEnvironmentalQuality] Created Coordinates:", coordinates);

    // Fetch both air and water quality data in parallel
    console.log(
      "[GetEnvironmentalQuality] Fetching air and water quality in parallel..."
    );
    const [airQuality, waterQuality] = await Promise.all([
      this.airQualityRepository.getAirQuality(coordinates),
      this.waterQualityRepository.getWaterQuality(coordinates),
    ]);
    console.log("[GetEnvironmentalQuality] Air quality result:", airQuality);
    console.log(
      "[GetEnvironmentalQuality] Water quality result:",
      waterQuality
    );

    const environmentalQuality = new EnvironmentalQuality({
      coordinates,
      airQuality,
      waterQuality,
      timestamp: new Date(),
    });

    const result = environmentalQuality.toJSON();
    console.log(
      "[GetEnvironmentalQuality] Final EnvironmentalQuality result:",
      result
    );

    return result;
  }
}

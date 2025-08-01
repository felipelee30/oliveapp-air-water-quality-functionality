import { GetEnvironmentalQuality } from '@application/useCases/GetEnvironmentalQuality';
import { GoogleAirQualityRepository } from '@infrastructure/repositories/GoogleAirQualityRepository';
import { EPAWaterQualityRepository } from '@infrastructure/repositories/EPAWaterQualityRepository';
import { GeocodingService } from '@infrastructure/services/GeocodingService';
import { EnvironmentalQualityController } from './express/controllers/EnvironmentalQualityController';

export interface Dependencies {
  getEnvironmentalQualityUseCase: GetEnvironmentalQuality;
  environmentalQualityController: EnvironmentalQualityController;
}

export function createDependencies(config: { googleApiKey: string }): Dependencies {
  // Services
  const geocodingService = new GeocodingService(config.googleApiKey);

  // Repositories
  const airQualityRepository = new GoogleAirQualityRepository(config.googleApiKey);
  const waterQualityRepository = new EPAWaterQualityRepository(geocodingService);

  // Use cases
  const getEnvironmentalQualityUseCase = new GetEnvironmentalQuality(
    airQualityRepository,
    waterQualityRepository
  );

  // Controllers
  const environmentalQualityController = new EnvironmentalQualityController(
    getEnvironmentalQualityUseCase
  );

  return {
    getEnvironmentalQualityUseCase,
    environmentalQualityController,
  };
}
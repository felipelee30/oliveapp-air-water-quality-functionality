import { AirQuality } from '../entities/AirQuality';
import { Coordinates } from '../valueObjects/Coordinates';

export interface IAirQualityRepository {
  getAirQuality(coordinates: Coordinates): Promise<AirQuality>;
}
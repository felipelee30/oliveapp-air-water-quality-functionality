import { WaterQuality } from '../entities/WaterQuality';
import { Coordinates } from '../valueObjects/Coordinates';

export interface IWaterQualityRepository {
  getWaterQuality(coordinates: Coordinates): Promise<WaterQuality>;
}
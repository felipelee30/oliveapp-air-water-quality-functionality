import { AirQuality } from './AirQuality';
import { WaterQuality } from './WaterQuality';
import { Coordinates } from '../valueObjects/Coordinates';

export interface EnvironmentalQualityData {
  coordinates: Coordinates;
  airQuality: AirQuality;
  waterQuality: WaterQuality;
  timestamp: Date;
}

export class EnvironmentalQuality {
  private coordinates: Coordinates;
  private airQuality: AirQuality;
  private waterQuality: WaterQuality;
  private timestamp: Date;

  constructor(data: EnvironmentalQualityData) {
    this.coordinates = data.coordinates;
    this.airQuality = data.airQuality;
    this.waterQuality = data.waterQuality;
    this.timestamp = data.timestamp;
  }

  getCoordinates(): Coordinates {
    return this.coordinates;
  }

  getAirQuality(): AirQuality {
    return this.airQuality;
  }

  getWaterQuality(): WaterQuality {
    return this.waterQuality;
  }

  getTimestamp(): Date {
    return this.timestamp;
  }

  getOverallHealth(): 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Bad' {
    const airScore = this.airQuality.getScore().getValue();
    const waterScore = this.waterQuality.getScore().getValue();
    const averageScore = (airScore + waterScore) / 2;

    if (averageScore >= 80) return 'Excellent';
    if (averageScore >= 60) return 'Good';
    if (averageScore >= 40) return 'Fair';
    if (averageScore >= 20) return 'Poor';
    return 'Bad';
  }

  toJSON() {
    return {
      coordinates: this.coordinates.toObject(),
      airQuality: this.airQuality.toJSON(),
      waterQuality: this.waterQuality.toJSON(),
      overallHealth: this.getOverallHealth(),
      timestamp: this.timestamp.toISOString(),
    };
  }
}
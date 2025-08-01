import { Score } from '../valueObjects/Score';
import { Pollutant } from '../valueObjects/Pollutant';

export interface AirQualityData {
  score: Score;
  aqi?: number;
  pollutants: Pollutant[];
  location?: string;
  timestamp: Date;
}

export class AirQuality {
  private score: Score;
  private aqi?: number;
  private pollutants: Pollutant[];
  private location?: string;
  private timestamp: Date;

  constructor(data: AirQualityData) {
    this.score = data.score;
    this.aqi = data.aqi;
    this.pollutants = data.pollutants;
    this.location = data.location;
    this.timestamp = data.timestamp;
  }

  getScore(): Score {
    return this.score;
  }

  getAQI(): number | undefined {
    return this.aqi;
  }

  getPollutants(): Pollutant[] {
    return this.pollutants;
  }

  getLocation(): string | undefined {
    return this.location;
  }

  getTimestamp(): Date {
    return this.timestamp;
  }

  getPollutantByName(name: string): Pollutant | undefined {
    return this.pollutants.find(p => p.getName() === name);
  }

  getExceedingPollutants(): Pollutant[] {
    return this.pollutants.filter(p => p.isExceedingLimit());
  }

  toJSON() {
    return {
      score: this.score.getValue(),
      rating: this.score.getQualityRating(),
      aqi: this.aqi,
      pollutants: this.pollutants.map(p => ({
        ...p.toObject(),
        exceedsLimit: p.isExceedingLimit(),
        exceedanceRatio: p.getExceedanceRatio(),
      })),
      location: this.location,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
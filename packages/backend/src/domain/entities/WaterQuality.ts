import { Score } from '../valueObjects/Score';
import { Contaminant } from '../valueObjects/Contaminant';

export interface WaterQualityData {
  score: Score;
  contaminants: Contaminant[];
  location?: string;
  utilityName?: string;
  timestamp: Date;
}

export class WaterQuality {
  private score: Score;
  private contaminants: Contaminant[];
  private location?: string;
  private utilityName?: string;
  private timestamp: Date;

  constructor(data: WaterQualityData) {
    this.score = data.score;
    this.contaminants = data.contaminants;
    this.location = data.location;
    this.utilityName = data.utilityName;
    this.timestamp = data.timestamp;
  }

  getScore(): Score {
    return this.score;
  }

  getContaminants(): Contaminant[] {
    return this.contaminants;
  }

  getLocation(): string | undefined {
    return this.location;
  }

  getUtilityName(): string | undefined {
    return this.utilityName;
  }

  getTimestamp(): Date {
    return this.timestamp;
  }

  getContaminantByName(name: string): Contaminant | undefined {
    return this.contaminants.find(c => c.getName() === name);
  }

  getExceedingContaminants(): Contaminant[] {
    return this.contaminants.filter(c => c.isExceedingLimit());
  }

  toJSON() {
    return {
      score: this.score.getValue(),
      rating: this.score.getQualityRating(),
      contaminants: this.contaminants.map(c => ({
        ...c.toObject(),
        exceedsLimit: c.isExceedingLimit(),
        exceedanceLabel: c.getExceedanceLabel(),
      })),
      location: this.location,
      utilityName: this.utilityName,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
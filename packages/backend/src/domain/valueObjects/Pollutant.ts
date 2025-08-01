export interface PollutantData {
  name: string;
  displayName: string;
  value: number;
  unit: string;
  limit?: number;
  description?: string;
}

export class Pollutant {
  constructor(private readonly data: PollutantData) {}

  getName(): string {
    return this.data.name;
  }

  getDisplayName(): string {
    return this.data.displayName;
  }

  getValue(): number {
    return this.data.value;
  }

  getUnit(): string {
    return this.data.unit;
  }

  getLimit(): number | undefined {
    return this.data.limit;
  }

  getDescription(): string | undefined {
    return this.data.description;
  }

  getExceedanceRatio(): number | null {
    if (!this.data.limit || this.data.limit === 0) return null;
    return this.data.value / this.data.limit;
  }

  isExceedingLimit(): boolean {
    const ratio = this.getExceedanceRatio();
    return ratio !== null && ratio > 1;
  }

  toObject(): PollutantData {
    return { ...this.data };
  }
}
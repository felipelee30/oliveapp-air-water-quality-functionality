export interface ContaminantData {
  name: string;
  value: number;
  unit: string;
  legalLimit?: number;
  healthLimit?: number;
  description?: string;
}

export class Contaminant {
  constructor(private readonly data: ContaminantData) {}

  getName(): string {
    return this.data.name;
  }

  getValue(): number {
    return this.data.value;
  }

  getUnit(): string {
    return this.data.unit;
  }

  getLegalLimit(): number | undefined {
    return this.data.legalLimit;
  }

  getHealthLimit(): number | undefined {
    return this.data.healthLimit;
  }

  getDescription(): string | undefined {
    return this.data.description;
  }

  getExceedanceRatio(): number | null {
    const limit = this.data.healthLimit || this.data.legalLimit;
    if (!limit || limit === 0) return null;
    return this.data.value / limit;
  }

  getExceedanceLabel(): string | null {
    const ratio = this.getExceedanceRatio();
    if (ratio === null || ratio <= 1) return null;
    return `${ratio.toFixed(1)}x limit`;
  }

  isExceedingLimit(): boolean {
    const ratio = this.getExceedanceRatio();
    return ratio !== null && ratio > 1;
  }

  toObject(): ContaminantData {
    return { ...this.data };
  }
}
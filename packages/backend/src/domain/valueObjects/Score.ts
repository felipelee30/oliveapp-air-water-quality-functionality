export class Score {
  private readonly value: number;

  constructor(value: number) {
    if (value < 0 || value > 100) {
      throw new Error('Score must be between 0 and 100');
    }
    this.value = Math.round(value);
  }

  getValue(): number {
    return this.value;
  }

  getQualityRating(): 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Bad' {
    if (this.value >= 80) return 'Excellent';
    if (this.value >= 60) return 'Good';
    if (this.value >= 40) return 'Fair';
    if (this.value >= 20) return 'Poor';
    return 'Bad';
  }

  toString(): string {
    return this.value.toString();
  }
}
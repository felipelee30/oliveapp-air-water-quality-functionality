import { Score } from '@domain/valueObjects/Score';

describe('Score Value Object', () => {
  it('should create a valid score', () => {
    const score = new Score(75);
    expect(score.getValue()).toBe(75);
  });

  it('should round decimal scores', () => {
    const score = new Score(75.7);
    expect(score.getValue()).toBe(76);
  });

  it('should throw error for negative scores', () => {
    expect(() => new Score(-1)).toThrow('Score must be between 0 and 100');
  });

  it('should throw error for scores above 100', () => {
    expect(() => new Score(101)).toThrow('Score must be between 0 and 100');
  });

  describe('getQualityRating', () => {
    it('should return Excellent for scores >= 80', () => {
      expect(new Score(80).getQualityRating()).toBe('Excellent');
      expect(new Score(100).getQualityRating()).toBe('Excellent');
    });

    it('should return Good for scores >= 60', () => {
      expect(new Score(60).getQualityRating()).toBe('Good');
      expect(new Score(79).getQualityRating()).toBe('Good');
    });

    it('should return Fair for scores >= 40', () => {
      expect(new Score(40).getQualityRating()).toBe('Fair');
      expect(new Score(59).getQualityRating()).toBe('Fair');
    });

    it('should return Poor for scores >= 20', () => {
      expect(new Score(20).getQualityRating()).toBe('Poor');
      expect(new Score(39).getQualityRating()).toBe('Poor');
    });

    it('should return Bad for scores < 20', () => {
      expect(new Score(0).getQualityRating()).toBe('Bad');
      expect(new Score(19).getQualityRating()).toBe('Bad');
    });
  });
});
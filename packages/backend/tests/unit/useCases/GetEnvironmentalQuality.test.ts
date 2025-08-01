import { GetEnvironmentalQuality } from '@application/useCases/GetEnvironmentalQuality';
import { IAirQualityRepository } from '@domain/repositories/IAirQualityRepository';
import { IWaterQualityRepository } from '@domain/repositories/IWaterQualityRepository';
import { mockAirQuality } from '@tests/fixtures/airQuality.fixtures';
import { mockWaterQuality } from '@tests/fixtures/waterQuality.fixtures';

describe('GetEnvironmentalQuality Use Case', () => {
  let mockAirQualityRepo: jest.Mocked<IAirQualityRepository>;
  let mockWaterQualityRepo: jest.Mocked<IWaterQualityRepository>;
  let useCase: GetEnvironmentalQuality;

  beforeEach(() => {
    mockAirQualityRepo = {
      getAirQuality: jest.fn(),
    };
    mockWaterQualityRepo = {
      getWaterQuality: jest.fn(),
    };
    useCase = new GetEnvironmentalQuality(mockAirQualityRepo, mockWaterQualityRepo);
  });

  it('should return environmental quality data for valid coordinates', async () => {
    mockAirQualityRepo.getAirQuality.mockResolvedValue(mockAirQuality);
    mockWaterQualityRepo.getWaterQuality.mockResolvedValue(mockWaterQuality);

    const result = await useCase.execute({
      latitude: 40.7128,
      longitude: -74.0060,
    });

    expect(result.coordinates).toEqual({
      latitude: 40.7128,
      longitude: -74.0060,
    });
    expect(result.airQuality.score).toBe(75);
    expect(result.airQuality.rating).toBe('Good');
    expect(result.waterQuality.score).toBe(25);
    expect(result.waterQuality.rating).toBe('Poor');
    expect(result.overallHealth).toBe('Fair');
  });

  it('should throw error for invalid latitude', async () => {
    await expect(
      useCase.execute({
        latitude: 91,
        longitude: 0,
      })
    ).rejects.toThrow('Latitude must be between -90 and 90');
  });

  it('should throw error for invalid longitude', async () => {
    await expect(
      useCase.execute({
        latitude: 0,
        longitude: 181,
      })
    ).rejects.toThrow('Longitude must be between -180 and 180');
  });

  it('should handle repository errors', async () => {
    mockAirQualityRepo.getAirQuality.mockRejectedValue(new Error('API Error'));
    mockWaterQualityRepo.getWaterQuality.mockResolvedValue(mockWaterQuality);

    await expect(
      useCase.execute({
        latitude: 40.7128,
        longitude: -74.0060,
      })
    ).rejects.toThrow('API Error');
  });
});
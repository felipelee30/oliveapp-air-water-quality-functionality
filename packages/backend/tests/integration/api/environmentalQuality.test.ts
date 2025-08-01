import request from 'supertest';
import { Express } from 'express';
import { createApp } from '@infrastructure/api/app';
import { GetEnvironmentalQuality } from '@application/useCases/GetEnvironmentalQuality';
import { EnvironmentalQualityController } from '@infrastructure/api/express/controllers/EnvironmentalQualityController';
import { mockAirQuality } from '@tests/fixtures/airQuality.fixtures';
import { mockWaterQuality } from '@tests/fixtures/waterQuality.fixtures';

describe('Environmental Quality API', () => {
  let app: Express;
  let mockUseCase: jest.Mocked<GetEnvironmentalQuality>;

  beforeEach(() => {
    mockUseCase = {
      execute: jest.fn(),
    } as any;

    const controller = new EnvironmentalQualityController(mockUseCase);
    app = createApp({
      getEnvironmentalQualityUseCase: mockUseCase,
      environmentalQualityController: controller,
    });
  });

  describe('GET /api/environmental-quality', () => {
    it('should return environmental quality data for valid coordinates', async () => {
      const mockResponse = {
        coordinates: { latitude: 40.7128, longitude: -74.0060 },
        airQuality: mockAirQuality.toJSON(),
        waterQuality: mockWaterQuality.toJSON(),
        overallHealth: 'Fair',
        timestamp: new Date().toISOString(),
      };

      mockUseCase.execute.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/api/environmental-quality')
        .query({ lat: 40.7128, lng: -74.0060 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
    });

    it('should return 400 for missing coordinates', async () => {
      const response = await request(app)
        .get('/api/environmental-quality');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required parameters: lat and lng');
    });

    it('should return 400 for invalid coordinates', async () => {
      const response = await request(app)
        .get('/api/environmental-quality')
        .query({ lat: 'invalid', lng: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid coordinates: lat and lng must be valid numbers');
    });

    it('should return 500 for use case errors', async () => {
      mockUseCase.execute.mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .get('/api/environmental-quality')
        .query({ lat: 40.7128, lng: -74.0060 });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch environmental quality data');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
import axios from 'axios';
import { EnvironmentalQuality } from '../types/environmental';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export class EnvironmentalQualityService {
  private static instance: EnvironmentalQualityService;
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
  });

  private constructor() {}

  static getInstance(): EnvironmentalQualityService {
    if (!EnvironmentalQualityService.instance) {
      EnvironmentalQualityService.instance = new EnvironmentalQualityService();
    }
    return EnvironmentalQualityService.instance;
  }

  async getEnvironmentalQuality(
    latitude: number,
    longitude: number
  ): Promise<EnvironmentalQuality> {
    try {
      const response = await this.apiClient.get<EnvironmentalQuality>(
        '/api/environmental-quality',
        {
          params: { lat: latitude, lng: longitude },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch environmental quality:', error);
      throw new Error('Unable to fetch environmental quality data');
    }
  }
}
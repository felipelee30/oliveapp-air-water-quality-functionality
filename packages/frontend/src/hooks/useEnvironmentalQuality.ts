import { useState, useEffect } from 'react';
import { EnvironmentalQuality } from '../types/environmental';
import { EnvironmentalQualityService } from '../services/environmentalQualityService';

export interface UseEnvironmentalQualityResult {
  data: EnvironmentalQuality | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useEnvironmentalQuality = (
  latitude?: number,
  longitude?: number
): UseEnvironmentalQualityResult => {
  const [data, setData] = useState<EnvironmentalQuality | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = EnvironmentalQualityService.getInstance();

  const fetchData = async () => {
    if (!latitude || !longitude) return;

    setLoading(true);
    setError(null);

    try {
      const result = await service.getEnvironmentalQuality(latitude, longitude);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [latitude, longitude]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};
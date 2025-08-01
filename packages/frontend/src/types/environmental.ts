export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Pollutant {
  name: string;
  displayName: string;
  value: number;
  unit: string;
  limit?: number;
  description?: string;
  exceedsLimit: boolean;
  exceedanceRatio?: number | null;
}

export interface Contaminant {
  name: string;
  value: number;
  unit: string;
  legalLimit?: number;
  healthLimit?: number;
  description?: string;
  exceedsLimit: boolean;
  exceedanceLabel?: string | null;
}

export interface AirQuality {
  score: number;
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Bad';
  aqi?: number;
  pollutants: Pollutant[];
  location?: string;
  timestamp: string;
}

export interface WaterQuality {
  score: number;
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Bad';
  contaminants: Contaminant[];
  location?: string;
  utilityName?: string;
  timestamp: string;
}

export interface EnvironmentalQuality {
  coordinates: Coordinates;
  airQuality: AirQuality;
  waterQuality: WaterQuality;
  overallHealth: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Bad';
  timestamp: string;
}
import { AirQuality } from '@domain/entities/AirQuality';
import { Score } from '@domain/valueObjects/Score';
import { Pollutant } from '@domain/valueObjects/Pollutant';

export const mockPollutants = [
  new Pollutant({
    name: 'pm25',
    displayName: 'PM2.5',
    value: 15,
    unit: 'μg/m³',
    limit: 25,
    description: 'Fine particulate matter',
  }),
  new Pollutant({
    name: 'no2',
    displayName: 'NO₂',
    value: 30,
    unit: 'μg/m³',
    limit: 25,
    description: 'Nitrogen dioxide',
  }),
];

export const mockAirQuality = new AirQuality({
  score: new Score(75),
  aqi: 45,
  pollutants: mockPollutants,
  location: 'Test Location',
  timestamp: new Date('2024-01-01'),
});
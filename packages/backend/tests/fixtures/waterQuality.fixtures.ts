import { WaterQuality } from '@domain/entities/WaterQuality';
import { Score } from '@domain/valueObjects/Score';
import { Contaminant } from '@domain/valueObjects/Contaminant';

export const mockContaminants = [
  new Contaminant({
    name: 'Haloacetic acids (HAA5)',
    value: 0.04,
    unit: 'mg/L',
    legalLimit: 0.06,
    healthLimit: 0.00006,
    description: 'Byproducts of water disinfection',
  }),
  new Contaminant({
    name: 'Tetrachloroethylene',
    value: 0.002,
    unit: 'mg/L',
    legalLimit: 0.005,
    healthLimit: 0.001,
    description: 'Industrial solvent',
  }),
];

export const mockWaterQuality = new WaterQuality({
  score: new Score(25),
  contaminants: mockContaminants,
  location: 'Test City',
  utilityName: 'Test Water Utility',
  timestamp: new Date('2024-01-01'),
});
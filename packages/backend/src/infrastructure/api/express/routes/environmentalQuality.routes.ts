import { Router } from 'express';
import { EnvironmentalQualityController } from '../controllers/EnvironmentalQualityController';

export function createEnvironmentalQualityRoutes(controller: EnvironmentalQualityController): Router {
  const router = Router();

  router.get('/environmental-quality', (req, res) => controller.getEnvironmentalQuality(req, res));

  return router;
}
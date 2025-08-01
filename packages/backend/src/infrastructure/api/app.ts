import express, { Express } from 'express';
import cors from 'cors';
import { createEnvironmentalQualityRoutes } from './express/routes/environmentalQuality.routes';
import { Dependencies } from './container';

export function createApp(dependencies: Dependencies): Express {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/health', (_, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Routes
  app.use('/api', createEnvironmentalQualityRoutes(dependencies.environmentalQualityController));

  // Error handling middleware
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  });

  return app;
}
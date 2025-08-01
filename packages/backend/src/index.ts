import dotenv from 'dotenv';
import { createApp } from './infrastructure/api/app';
import { createDependencies } from './infrastructure/api/container';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['GOOGLE_API_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Create dependencies
const dependencies = createDependencies({
  googleApiKey: process.env.GOOGLE_API_KEY!,
});

// Create and start server
const app = createApp(dependencies);
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📍 Environmental quality endpoint: http://localhost:${port}/api/environmental-quality`);
});
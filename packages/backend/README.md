# Environmental Quality Backend

A clean architecture TypeScript backend service that provides environmental quality data (air and water quality) for given coordinates.

## Architecture

This project follows Clean Architecture principles with clear separation of concerns:

- **Domain Layer**: Business entities and rules (framework agnostic)
- **Application Layer**: Use cases and application logic
- **Infrastructure Layer**: External services, APIs, and framework adapters

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Add your Google API key to the `.env` file:
```
GOOGLE_API_KEY=your_google_api_key_here
```

## Running the Application

### Development
```bash
yarn dev
```

### Production
```bash
yarn build
yarn start
```

## API Endpoints

### Get Environmental Quality
```
GET /api/environmental-quality?lat={latitude}&lng={longitude}
```

Returns combined air and water quality data for the specified coordinates.

#### Response Format:
```json
{
  "coordinates": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "airQuality": {
    "score": 75,
    "rating": "Good",
    "aqi": 45,
    "pollutants": [...]
  },
  "waterQuality": {
    "score": 25,
    "rating": "Poor",
    "contaminants": [...]
  },
  "overallHealth": "Fair",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Health Check
```
GET /health
```

## Testing

Run all tests:
```bash
yarn test
```

Run tests in watch mode:
```bash
yarn test:watch
```

Run tests with coverage:
```bash
yarn test:coverage
```

## Portability

The use cases and domain logic are completely framework-agnostic. To integrate into another application:

1. Copy the `domain` and `application` folders
2. Implement your own repository interfaces
3. Create your own framework adapters (replacing the Express layer)

The core business logic will work with any framework or runtime.
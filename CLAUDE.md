# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo containing an environmental quality map overlay application with separate backend and frontend packages. The project displays air and water quality data as an interactive map overlay using clean architecture principles.

## Commands

### Backend Development (packages/backend)
```bash
yarn dev          # Start development server with auto-reload (nodemon)
yarn build        # Compile TypeScript to JavaScript
yarn start        # Run production server
yarn test         # Run all tests
yarn test:watch   # Run tests in watch mode
yarn test:coverage # Generate test coverage report
yarn lint         # TypeScript type checking
yarn clean        # Remove build artifacts
```

### Frontend Development (packages/frontend)
```bash
yarn start        # Start Expo development server
yarn android      # Start for Android development
yarn ios          # Start for iOS development
yarn web          # Start for web development
```

### Running a Single Test
```bash
# Backend (from packages/backend)
yarn test path/to/test.test.ts
yarn test --testNamePattern="test description"
```

## Architecture

### Backend Architecture
The backend follows Clean Architecture with Domain-Driven Design:

- **Domain Layer** (`src/domain/`)
  - Entities: `AirQuality`, `WaterQuality`, `EnvironmentalQuality`
  - Value Objects: `Coordinates`, `Score`, `Pollutant`, `Contaminant`
  - Repository Interfaces: `IAirQualityRepository`, `IWaterQualityRepository`

- **Application Layer** (`src/application/`)
  - Use Cases: `GetEnvironmentalQuality` - orchestrates business logic

- **Infrastructure Layer** (`src/infrastructure/`)
  - Express Controllers: `EnvironmentalQualityController`
  - Repository Implementations: `GoogleAirQualityRepository`, `EPAWaterQualityRepository`
  - External Services: `GeocodingService`

### Frontend Architecture
React Native/Expo application with TypeScript:

- **Components** (`src/components/`)
  - Main overlay component: `EnvironmentalQualityOverlay`
  - Views: `CollapsedView`, `ExpandedView`, `LoadingView`, `ErrorView`
  - UI elements: `QualityBar`, `ContaminantList`

- **Services** (`src/services/`)
  - API client: `environmentalQualityService`

- **Hooks** (`src/hooks/`)
  - Data fetching: `useEnvironmentalQuality`

## API Integration

### Required Environment Variables
Backend requires `.env` file with:
```
GOOGLE_API_KEY=your_google_api_key_here
PORT=3000  # optional, defaults to 3000
```

### Main API Endpoint
```
GET /api/environmental-quality?lat={latitude}&lng={longitude}
```

Returns combined air and water quality data with scores, ratings, and contaminant details.

## Testing Strategy

- Unit tests for domain entities and use cases
- Integration tests for API endpoints and external service integrations
- Test fixtures in `tests/fixtures/` for consistent test data
- Path aliases configured for clean imports (@domain/, @application/, @infrastructure/)

## Key Dependencies

### Backend
- Express 5.x with TypeScript
- Axios for external API calls
- Jest for testing with ts-jest
- Strict TypeScript configuration with path aliases

### Frontend
- Expo SDK 53
- React Native 0.79.5 with React 19
- NativeWind (Tailwind CSS) for styling
- React Native Reanimated for animations
- Expo Blur for glassmorphism effects

## Development Workflow

1. Backend runs on port 3000 by default
2. Frontend connects to backend API (configure URL in frontend service)
3. Both packages use Yarn workspaces
4. TypeScript strict mode enabled in both packages
5. Hot reload available in both development environments
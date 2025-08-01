# Environmental Quality Frontend

A React Native/Expo application that displays environmental quality data (air and water quality) as a glassmorphism-styled overlay on a map interface.

## Features

- **Glassmorphism UI**: Beautiful translucent overlay with blur effects
- **Collapsed View**: At-a-glance summary showing air and water quality scores
- **Expanded View**: Detailed breakdown of pollutants, contaminants, and recommendations
- **Smooth Animations**: Spring-based animations using React Native Reanimated
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first styling with NativeWind

## Components

### EnvironmentalQualityOverlay
Main container component that manages the collapsed/expanded state and handles data fetching.

### CollapsedView
- Horizontal layout with tap water and air quality sections
- Visual quality bars with color coding
- Tap-to-expand functionality

### ExpandedView
- Full-screen detailed view
- Scrollable content with:
  - Summary section
  - Water contaminants list
  - Water filter recommendations
  - Air pollutants list
  - Scoring methodology
  - Action buttons

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Create environment configuration:
```bash
cp .env.example .env
```

3. Update the API URL in `.env` to point to your backend:
```
EXPO_PUBLIC_API_URL=http://your-backend-url:3000
```

## Running the Application

### Development
```bash
yarn start
```

Then choose your platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web

### Platform-specific
```bash
yarn ios      # iOS
yarn android  # Android
yarn web      # Web
```

## Usage

### Integration Example

```tsx
import { EnvironmentalQualityOverlay } from './src/components/EnvironmentalQualityOverlay';

export default function MapScreen() {
  const [coordinates, setCoordinates] = useState({
    latitude: 40.7128,
    longitude: -74.0060
  });

  return (
    <View style={{ flex: 1 }}>
      <MapView 
        style={{ flex: 1 }}
        onRegionChangeComplete={(region) => setCoordinates(region)}
      />
      
      <EnvironmentalQualityOverlay
        latitude={coordinates.latitude}
        longitude={coordinates.longitude}
      />
    </View>
  );
}
```

### Customization

The component uses Tailwind CSS classes for styling. You can customize colors in `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      quality: {
        excellent: '#10B981',
        good: '#3B82F6',
        fair: '#F59E0B',
        poor: '#F97316',
        bad: '#EF4444',
      }
    }
  }
}
```

## Architecture

The frontend follows a clean component structure:

- **Components**: Reusable UI components
- **Hooks**: Custom React hooks for data management
- **Services**: API client and data fetching logic
- **Types**: TypeScript interface definitions
- **Utils**: Helper functions and utilities

## Portability

This component is designed to be easily integrated into existing applications:

1. Copy the `src` folder to your project
2. Install the required dependencies
3. Import and use the `EnvironmentalQualityOverlay` component
4. Configure the API URL

The component has minimal external dependencies and uses standard React Native patterns.
# Map Integration Guide

## Overview
The frontend now includes a real interactive map with GPS location support, replacing the static placeholder image.

## New Features

### 1. Interactive Map
- Uses `react-native-maps` for native map rendering
- Shows user's current location with a blue dot
- Displays selected location with a purple marker

### 2. GPS Location Support
- Requests location permissions on first use
- Shows "Current Location" option in location selector
- Automatically centers map on user location when available

### 3. Location Override for Testing
- Maintains existing test locations (New York, San Francisco, Los Angeles)
- "Current Location" appears as first option when GPS is available
- Selected location is used for API requests

## Testing Instructions

### Running the App
```bash
# Start the backend server first
cd packages/backend
yarn dev

# In another terminal, start the frontend
cd packages/frontend
yarn start
```

### Testing on iOS Simulator
1. Press `i` to open iOS simulator
2. Grant location permissions when prompted
3. To simulate location: Device > Location > Custom Location
4. Enter test coordinates (e.g., 37.7749, -122.4194 for San Francisco)

### Testing on Android Emulator
1. Press `a` to open Android emulator
2. Grant location permissions when prompted
3. To simulate location: Extended controls > Location
4. Set desired coordinates and click "Send"

### Testing Location Features
1. **Current Location**: App should request permissions and show your location
2. **Location Override**: Tap location buttons to switch between test locations
3. **Map Interaction**: Map updates when selecting different locations
4. **API Integration**: Environmental quality data updates based on selected location

## Permissions

### iOS
- Info.plist configured with location usage description
- Permission prompt appears on first use

### Android
- Manifest includes ACCESS_FINE_LOCATION permission
- Runtime permission request handled

## Key Components

- **useUserLocation Hook**: Handles GPS location and permissions
- **MapView**: Interactive map component with markers
- **LocationSelector**: Updated to include "Current Location" option

## Notes
- Map only shows selected location marker if different from current location
- Blue dot always shows user's actual location when available
- API requests use selected location (current or override)
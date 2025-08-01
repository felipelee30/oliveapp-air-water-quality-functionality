import React, { useState } from 'react';
import { StyleSheet, View, StatusBar, Image } from 'react-native';
import { EnvironmentalQualityOverlay } from './src/components/EnvironmentalQualityOverlay';
import { LocationSelector, Location } from './src/components/LocationSelector';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import NativeWind styles
import './global.css';

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

const LOCATIONS: Location[] = [
  { name: 'New York', latitude: 40.7128, longitude: -74.0060, emoji: '🗽' },
  { name: 'San Francisco', latitude: 37.7749, longitude: -122.4194, emoji: '🌉' },
  { name: 'Los Angeles', latitude: 34.0522, longitude: -118.2437, emoji: '🌴' },
];

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location>(LOCATIONS[0]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleLocationChange = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleExpandedChange = (expanded: boolean) => {
    setIsExpanded(expanded);
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Map Placeholder Image */}
        <Image
          source={require('./assets/map.png')}
          style={styles.map}
          resizeMode="cover"
        />

        {/* Location Selector - Only show when not expanded */}
        {!isExpanded && (
          <LocationSelector
            locations={LOCATIONS}
            selectedLocation={selectedLocation}
            onLocationChange={handleLocationChange}
          />
        )}

        {/* Environmental Quality Overlay */}
        <EnvironmentalQualityOverlay
          latitude={selectedLocation.latitude}
          longitude={selectedLocation.longitude}
          onExpandedChange={handleExpandedChange}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

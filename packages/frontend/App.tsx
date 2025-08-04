import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { EnvironmentalQualityOverlay } from './src/components/EnvironmentalQualityOverlay';
import { LocationSelector, Location } from './src/components/LocationSelector';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useUserLocation } from './src/hooks/useUserLocation';

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

const DEFAULT_DELTA = {
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  
  const { location: userLocation, error: locationError, requestPermission } = useUserLocation();

  useEffect(() => {
    if (userLocation && !selectedLocation) {
      const currentLocation: Location = {
        name: 'Current Location',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        emoji: '📍',
      };
      setSelectedLocation(currentLocation);
      setMapRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        ...DEFAULT_DELTA,
      });
    } else if (!userLocation && !selectedLocation) {
      setSelectedLocation(LOCATIONS[0]);
      setMapRegion({
        latitude: LOCATIONS[0].latitude,
        longitude: LOCATIONS[0].longitude,
        ...DEFAULT_DELTA,
      });
    }
  }, [userLocation, selectedLocation]);

  useEffect(() => {
    if (locationError) {
      Alert.alert(
        'Location Permission',
        'To see your current location on the map, please enable location permissions.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', onPress: requestPermission },
        ]
      );
    }
  }, [locationError, requestPermission]);
  
  const handleLocationChange = (location: Location) => {
    setSelectedLocation(location);
    setMapRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      ...DEFAULT_DELTA,
    });
  };

  const handleExpandedChange = (expanded: boolean) => {
    setIsExpanded(expanded);
  };

  const allLocations = userLocation
    ? [
        {
          name: 'Current Location',
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          emoji: '📍',
        },
        ...LOCATIONS,
      ]
    : LOCATIONS;

  if (!selectedLocation || !mapRegion) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Interactive Map */}
        <MapView
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          region={mapRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          onRegionChangeComplete={setMapRegion}
        >
          {/* Selected Location Marker - only show if different from user location */}
          {selectedLocation.name !== 'Current Location' && (
            <Marker
              coordinate={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }}
              title={selectedLocation.name}
              pinColor="#4F46E5"
            />
          )}
        </MapView>

        {/* Location Selector - Only show when not expanded */}
        {!isExpanded && (
          <LocationSelector
            locations={allLocations}
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

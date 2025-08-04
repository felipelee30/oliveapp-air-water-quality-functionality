import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export interface Location {
  name: string;
  latitude: number;
  longitude: number;
  emoji: string;
}

interface LocationSelectorProps {
  locations: Location[];
  selectedLocation: Location;
  onLocationChange: (location: Location) => void;
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  locations,
  selectedLocation,
  onLocationChange,
}) => {
  return (
    <View className="absolute top-0 left-0 right-0 pt-12 px-4 z-10">
      <BlurView
        intensity={80}
        tint="light"
        className="rounded-2xl overflow-hidden"
      >
        <View className="bg-glass-white-20 border border-glass-border">
          <View className="flex-row justify-around p-2">
            {locations.map((location) => (
              <LocationButton
                key={location.name}
                location={location}
                isSelected={selectedLocation.name === location.name}
                onPress={() => onLocationChange(location)}
              />
            ))}
          </View>
        </View>
      </BlurView>
    </View>
  );
};

interface LocationButtonProps {
  location: Location;
  isSelected: boolean;
  onPress: () => void;
}

const LocationButton: React.FC<LocationButtonProps> = ({
  location,
  isSelected,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(isSelected ? 1 : 0.7);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  React.useEffect(() => {
    opacity.value = withTiming(isSelected ? 1 : 0.7, { duration: 200 });
  }, [isSelected]);

  return (
    <AnimatedTouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      style={animatedStyle}
      className="flex-1 mx-1"
    >
      <View
        className={`${
          isSelected ? "bg-glass-white-40" : "bg-glass-white-20"
        } rounded-xl p-3 flex-1 border ${
          isSelected ? "border-glass-white-30" : "border-glass-border"
        }`}
      >
        <View className="flex flex-col justify-center items-center">
          <Text className="text-2xl mb-1">{location.emoji}</Text>
          <Text
            className={`${
              isSelected ? "text-gray-900 font-semibold" : "text-gray-700"
            } text-xs text-center`}
          >
            {location.name}
          </Text>
        </View>
      </View>
    </AnimatedTouchableOpacity>
  );
};

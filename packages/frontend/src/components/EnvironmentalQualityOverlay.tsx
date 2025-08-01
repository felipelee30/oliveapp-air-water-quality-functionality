import React, { useState } from 'react';
import { View, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { CollapsedView } from './CollapsedView';
import { ExpandedView } from './ExpandedView';
import { LoadingView } from './LoadingView';
import { ErrorView } from './ErrorView';
import { useEnvironmentalQuality } from '../hooks/useEnvironmentalQuality';

interface EnvironmentalQualityOverlayProps {
  latitude?: number;
  longitude?: number;
  onExpandedChange?: (expanded: boolean) => void;
}

const { height: screenHeight } = Dimensions.get('window');
const COLLAPSED_HEIGHT = 120;

export const EnvironmentalQualityOverlay: React.FC<EnvironmentalQualityOverlayProps> = ({
  latitude,
  longitude,
  onExpandedChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, loading, error, refetch } = useEnvironmentalQuality(latitude, longitude);

  // Animation values
  const animationProgress = useSharedValue(0); // 0 = collapsed, 1 = expanded

  const handleExpand = () => {
    setIsExpanded(true);
    onExpandedChange?.(true);
    animationProgress.value = withSpring(1, {
      damping: 20,
      stiffness: 90,
      mass: 1,
    });
  };

  const handleCollapse = () => {
    // First update local state immediately
    setIsExpanded(false);
    onExpandedChange?.(false);
    
    // Then start animation
    animationProgress.value = withSpring(0, {
      damping: 20,
      stiffness: 90,
      mass: 1,
    });
  };

  // Container animation style
  const containerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      animationProgress.value,
      [0, 1],
      [COLLAPSED_HEIGHT, screenHeight],
      Extrapolate.CLAMP
    );

    const borderRadius = interpolate(
      animationProgress.value,
      [0, 1],
      [30, 0],
      Extrapolate.CLAMP
    );

    const marginHorizontal = interpolate(
      animationProgress.value,
      [0, 1],
      [16, 0],
      Extrapolate.CLAMP
    );

    const marginBottom = interpolate(
      animationProgress.value,
      [0, 1],
      [24, 0],
      Extrapolate.CLAMP
    );

    return {
      height,
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
      borderBottomLeftRadius: borderRadius,
      borderBottomRightRadius: borderRadius,
      marginHorizontal,
      marginBottom,
    };
  });


  // Content opacity animations
  const collapsedContentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animationProgress.value,
      [0, 0.3],
      [1, 0],
      Extrapolate.CLAMP
    );

    return { opacity };
  });

  const expandedContentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animationProgress.value,
      [0.7, 1],
      [0, 1],
      Extrapolate.CLAMP
    );

    return { opacity };
  });

  // Don't render anything if no coordinates are provided
  if (!latitude || !longitude) {
    return null;
  }

  return (
    <>
      {/* Main animated container */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 8,
          },
          containerStyle
        ]}
      >
        {loading && (
          <View className="h-[120px] justify-center items-center bg-glass-white-10 border border-glass-border rounded-3xl">
            <LoadingView />
          </View>
        )}
        
        {error && (
          <View className="h-[120px] justify-center items-center p-4 bg-glass-white-10 border border-glass-border rounded-3xl">
            <ErrorView error={error} onRetry={refetch} />
          </View>
        )}
        
        {data && !loading && !error && (
          <>
            {/* Collapsed Content */}
            <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0 }, collapsedContentStyle]}>
              <CollapsedView data={data} onExpand={handleExpand} />
            </Animated.View>

            {/* Expanded Content */}
            {isExpanded && (
              <Animated.View style={[{ flex: 1 }, expandedContentStyle]}>
                <ExpandedView data={data} onCollapse={handleCollapse} />
              </Animated.View>
            )}
          </>
        )}
      </Animated.View>
    </>
  );
};
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { QualityBar } from "./QualityBar";
import { EnvironmentalQuality } from "../types/environmental";

interface CollapsedViewProps {
  data: EnvironmentalQuality;
  onExpand: () => void;
}

export const CollapsedView: React.FC<CollapsedViewProps> = ({
  data,
  onExpand,
}) => {
  return (
    <TouchableOpacity onPress={onExpand} activeOpacity={0.9}>
      <BlurView
        intensity={30}
        tint="light"
        className="overflow-hidden rounded-3xl"
      >
        <View className="bg-glass-white-10 border border-glass-border p-4 rounded-3xl">
          <View className="flex-row justify-between items-center">
            {/* Tap Water Section */}
            <View className="flex-1 mr-4">
              <View className="flex-row items-center mb-2">
                <Text className="text-2xl mr-2">💧</Text>
                <View>
                  <Text className="text-gray-900 font-semibold text-sm">
                    Tap water
                  </Text>
                  <Text className="text-gray-600 text-xs">
                    {data.waterQuality.score} / 100
                  </Text>
                </View>
              </View>
              <QualityBar
                score={data.waterQuality.score}
                rating={data.waterQuality.rating}
                className="mb-1"
              />
              <Text className="text-gray-500 text-xs capitalize">
                {data.waterQuality.rating.toLowerCase()}
              </Text>
            </View>

            {/* Divider */}
            <View className="w-px h-16 bg-glass-white-50 mx-2" />

            {/* Air Quality Section */}
            <View className="flex-1 ml-4">
              <View className="flex-row items-center mb-2">
                <Text className="text-2xl mr-2">🌬️</Text>
                <View>
                  <Text className="text-gray-900 font-semibold text-sm">
                    Air quality
                  </Text>
                  <Text className="text-gray-600 text-xs">
                    {data.airQuality.score}
                    {data.airQuality.aqi && ` (AQI ${data.airQuality.aqi})`}
                  </Text>
                </View>
              </View>
              <QualityBar
                score={data.airQuality.score}
                rating={data.airQuality.rating}
                className="mb-1"
              />
              <Text className="text-gray-500 text-xs capitalize">
                {data.airQuality.rating.toLowerCase()}
              </Text>
            </View>
          </View>

          {/* Tap indicator */}
          {/* <View className="mt-3 flex-row justify-center">
            <View className="w-10 h-1 bg-glass-white-50 rounded-full" />
          </View> */}
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

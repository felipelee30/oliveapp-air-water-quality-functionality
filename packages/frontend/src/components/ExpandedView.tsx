import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QualityBar } from './QualityBar';
import { ContaminantList } from './ContaminantList';
import { EnvironmentalQuality } from '../types/environmental';

interface ExpandedViewProps {
  data: EnvironmentalQuality;
  onCollapse: () => void;
}

export const ExpandedView: React.FC<ExpandedViewProps> = ({ data, onCollapse }) => {
  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <BlurView 
        intensity={60}
        tint="light"
        className="flex-1 rounded-3xl"
      >
        <View className="flex-1 bg-glass-white-5 rounded-3xl">
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-glass-white-15">
              <Text className="text-black font-bold text-xl">Environmental Quality</Text>
              <TouchableOpacity 
                onPress={onCollapse}
                className="w-8 h-8 bg-glass-white-20 rounded-full items-center justify-center"
              >
                <Text className="text-black text-lg">✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="p-4">
                {/* Summary Section */}
                <View className="mb-6">
                  <Text className="text-black font-semibold text-lg mb-4">Summary</Text>
                  
                  <View className="flex-row mb-4">
                    {/* Water Quality Summary */}
                    <View className="flex-1 mr-2">
                      <View className="bg-glass-white-20 rounded-lg p-4 border-2 border-glass-white-30 shadow-lg">
                        <View className="flex-row items-center mb-2">
                          <Text className="text-2xl mr-2">💧</Text>
                          <Text className="text-black font-medium">Tap Water</Text>
                        </View>
                        <Text className="text-gray-900 text-lg font-bold mb-1">
                          {data.waterQuality.score}/100
                        </Text>
                        <QualityBar 
                          score={data.waterQuality.score} 
                          rating={data.waterQuality.rating}
                          className="mb-2"
                        />
                        <Text className="text-gray-800 text-sm capitalize">
                          {data.waterQuality.rating.toLowerCase()}
                        </Text>
                        {data.waterQuality.utilityName && (
                          <Text className="text-gray-700 text-xs mt-1">
                            {data.waterQuality.utilityName}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Air Quality Summary */}
                    <View className="flex-1 ml-2">
                      <View className="bg-glass-white-20 rounded-lg p-4 border-2 border-glass-white-30 shadow-lg">
                        <View className="flex-row items-center mb-2">
                          <Text className="text-2xl mr-2">🌬️</Text>
                          <Text className="text-black font-medium">Air Quality</Text>
                        </View>
                        <Text className="text-gray-900 text-lg font-bold mb-1">
                          {data.airQuality.score}
                          {data.airQuality.aqi && (
                            <Text className="text-sm"> (AQI {data.airQuality.aqi})</Text>
                          )}
                        </Text>
                        <QualityBar 
                          score={data.airQuality.score} 
                          rating={data.airQuality.rating}
                          className="mb-2"
                        />
                        <Text className="text-gray-800 text-sm capitalize">
                          {data.airQuality.rating.toLowerCase()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Overall Health */}
                  <View className="bg-glass-white-20 rounded-lg p-4 border-2 border-glass-white-30 shadow-lg">
                    <Text className="text-black font-medium mb-1">Overall Environmental Health</Text>
                    <Text className="text-gray-900 text-lg font-bold capitalize">
                      {data.overallHealth.toLowerCase()}
                    </Text>
                  </View>
                </View>

                {/* Water Contaminants */}
                <ContaminantList 
                  contaminants={data.waterQuality.contaminants}
                  title="Water Contaminants"
                />

                {/* Recommended Water Filters */}
                <View className="mb-6">
                  <Text className="text-black font-semibold text-lg mb-3">
                    Recommended Water Filters
                  </Text>
                  <View className="bg-glass-white-15 rounded-lg p-4 border-2 border-glass-white-25 shadow-md">
                    <Text className="text-gray-900 text-sm">
                      • Activated Carbon Filter - Removes chlorine and organic compounds
                    </Text>
                    <Text className="text-gray-900 text-sm mt-2">
                      • Reverse Osmosis System - Removes dissolved contaminants
                    </Text>
                    <Text className="text-gray-900 text-sm mt-2">
                      • UV Sterilizer - Eliminates bacteria and viruses
                    </Text>
                  </View>
                </View>

                {/* Air Pollutants */}
                <ContaminantList 
                  pollutants={data.airQuality.pollutants}
                  title="Air Pollutants"
                />

                {/* Scoring Information */}
                <View className="mb-6">
                  <Text className="text-black font-semibold text-lg mb-3">
                    How Scores Are Calculated
                  </Text>
                  <View className="bg-glass-white-15 rounded-lg p-4 border-2 border-glass-white-25 shadow-md">
                    <Text className="text-gray-900 text-sm mb-2">
                      <Text className="font-medium">Air Quality:</Text> Based on Air Quality Index (AQI) 
                      and pollutant concentrations vs. WHO guidelines.
                    </Text>
                    <Text className="text-gray-900 text-sm">
                      <Text className="font-medium">Water Quality:</Text> Based on contaminant levels 
                      vs. EPA maximum contaminant levels (MCL).
                    </Text>
                  </View>
                </View>

                {/* Further Actions */}
                <View className="mb-6">
                  <Text className="text-black font-semibold text-lg mb-3">Further Actions</Text>
                  <View className="flex-row space-x-3">
                    <TouchableOpacity className="flex-1 bg-glass-white-20 rounded-xl p-4 border-2 border-glass-white-30 shadow-lg">
                      <View className="flex-row items-center mb-2">
                        <Text className="text-2xl mr-2">⚠️</Text>
                        <Text className="text-black font-bold text-base">Report Issue</Text>
                      </View>
                      <Text className="text-gray-700 text-sm">
                        Report data quality concerns
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-glass-white-20 rounded-xl p-4 border-2 border-glass-white-30 shadow-lg">
                      <View className="flex-row items-center mb-2">
                        <Text className="text-2xl mr-2">ℹ️</Text>
                        <Text className="text-black font-bold text-base">Disclaimer</Text>
                      </View>
                      <Text className="text-gray-700 text-sm">
                        Data sources & limits
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Location Info */}
                <View className="mb-4">
                  <Text className="text-gray-700 text-xs text-center">
                    Location: {data.coordinates.latitude.toFixed(4)}, {data.coordinates.longitude.toFixed(4)}
                  </Text>
                  <Text className="text-gray-700 text-xs text-center mt-1">
                    Last updated: {new Date(data.timestamp).toLocaleString()}
                  </Text>
                </View>
              </View>
            </ScrollView>
        </View>
      </BlurView>
    </SafeAreaView>
  );
};
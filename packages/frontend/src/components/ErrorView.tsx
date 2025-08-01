import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';

interface ErrorViewProps {
  error: string;
  onRetry: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({ error, onRetry }) => {
  return (
    <View className="mx-4 mb-8">
      <BlurView 
        intensity={50}
        tint="light"
        className="bg-glass-white rounded-2xl border border-glass-border overflow-hidden"
      >
        <View className="p-6">
          <View className="items-center mb-4">
            <Text className="text-4xl mb-2">⚠️</Text>
            <Text className="text-white font-semibold text-lg mb-2">
              Unable to load data
            </Text>
            <Text className="text-white/70 text-sm text-center mb-4">
              {error}
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={onRetry}
            className="bg-white/20 rounded-lg py-3 px-4"
          >
            <Text className="text-white font-medium text-center">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};
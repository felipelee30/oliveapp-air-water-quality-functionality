import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';

export const LoadingView: React.FC = () => {
  return (
    <View className="mx-4 mb-8">
      <BlurView 
        intensity={50}
        tint="light"
        className="bg-glass-white rounded-2xl border border-glass-border overflow-hidden"
      >
        <View className="p-6 items-center">
          <ActivityIndicator size="small" color="black" />
          <Text className="text-black/70 text-sm mt-2">
            Loading environmental data...
          </Text>
        </View>
      </BlurView>
    </View>
  );
};
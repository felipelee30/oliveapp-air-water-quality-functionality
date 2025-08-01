import React from 'react';
import { View } from 'react-native';
import { getQualityColor } from '../utils/qualityColors';

interface QualityBarProps {
  score: number;
  rating: string;
  className?: string;
}

export const QualityBar: React.FC<QualityBarProps> = ({ 
  score, 
  rating, 
  className = '' 
}) => {
  const color = getQualityColor(rating);
  const width = `${score}%` as const;

  return (
    <View className={`h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <View 
        className="h-full rounded-full transition-all duration-300"
        style={{ 
          backgroundColor: color,
          width: width,
        }}
      />
    </View>
  );
};
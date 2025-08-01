import React from 'react';
import { View, Text } from 'react-native';
import { Contaminant, Pollutant } from '../types/environmental';

interface ContaminantItemProps {
  item: Contaminant | Pollutant;
  type: 'contaminant' | 'pollutant';
}

const ContaminantItem: React.FC<ContaminantItemProps> = ({ item, type }) => {
  const isContaminant = type === 'contaminant';
  const contaminant = item as Contaminant;
  const pollutant = item as Pollutant;

  const exceedanceInfo = isContaminant 
    ? contaminant.exceedanceLabel 
    : pollutant.exceedanceRatio && pollutant.exceedanceRatio > 1 
      ? `${pollutant.exceedanceRatio.toFixed(1)}x limit`
      : null;

  return (
    <View className="bg-glass-white-20 rounded-lg p-4 mb-3 border-2 border-glass-white-30 shadow-lg">
      <View className="flex-row justify-between items-start mb-1">
        <Text className="text-black font-medium text-sm flex-1 mr-2">
          {isContaminant ? contaminant.name : pollutant.displayName || pollutant.name}
        </Text>
        {exceedanceInfo && (
          <View className="bg-red-500/20 px-2 py-1 rounded">
            <Text className="text-red-600 font-bold text-xs">
              {exceedanceInfo}
            </Text>
          </View>
        )}
      </View>
      
      <Text className="text-gray-700 text-xs mb-2">
        {item.value} {item.unit}
        {isContaminant && contaminant.legalLimit && 
          ` (limit: ${contaminant.legalLimit} ${contaminant.unit})`
        }
        {!isContaminant && pollutant.limit && 
          ` (limit: ${pollutant.limit} ${pollutant.unit})`
        }
      </Text>
      
      {item.description && (
        <Text className="text-gray-600 text-xs">
          {item.description}
        </Text>
      )}
    </View>
  );
};

interface ContaminantListProps {
  contaminants?: Contaminant[];
  pollutants?: Pollutant[];
  title: string;
}

export const ContaminantList: React.FC<ContaminantListProps> = ({ 
  contaminants, 
  pollutants, 
  title 
}) => {
  const items = contaminants || pollutants || [];
  const type = contaminants ? 'contaminant' : 'pollutant';

  if (items.length === 0) {
    return (
      <View className="mb-6">
        <Text className="text-black font-semibold text-lg mb-3">{title}</Text>
        <View className="bg-glass-white-20 rounded-lg p-4 border-2 border-glass-white-30 shadow-lg">
          <Text className="text-gray-600 text-center">
            No data available
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-6">
      <Text className="text-black font-semibold text-lg mb-3">{title}</Text>
      {items.map((item, index) => (
        <ContaminantItem 
          key={index} 
          item={item} 
          type={type}
        />
      ))}
    </View>
  );
};
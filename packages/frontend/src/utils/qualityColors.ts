export const getQualityColor = (rating: string): string => {
  switch (rating) {
    case 'Excellent':
      return '#10B981'; // green-500
    case 'Good':
      return '#3B82F6'; // blue-500
    case 'Fair':
      return '#F59E0B'; // amber-500
    case 'Poor':
      return '#F97316'; // orange-500
    case 'Bad':
      return '#EF4444'; // red-500
    default:
      return '#6B7280'; // gray-500
  }
};

export const getQualityColorClass = (rating: string): string => {
  switch (rating) {
    case 'Excellent':
      return 'bg-quality-excellent';
    case 'Good':
      return 'bg-quality-good';
    case 'Fair':
      return 'bg-quality-fair';
    case 'Poor':
      return 'bg-quality-poor';
    case 'Bad':
      return 'bg-quality-bad';
    default:
      return 'bg-gray-500';
  }
};
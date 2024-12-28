// components/statistics/StatsCard.tsx
interface StatsCardProps {
    title: string;
    value?: string | number;
    isLoading?: boolean;
}
  
export default function StatsCard({ title, value, isLoading }: StatsCardProps) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
        <div className="h-12 flex items-center">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
              <span className="text-gray-500">Caricamento statistiche...</span>
            </div>
          ) : (
            <p className="text-3xl font-bold text-gray-900">
              {value?.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    );
}

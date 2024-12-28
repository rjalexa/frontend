interface ListItem {
  label: string;
  value: number;
}

interface ListStatsCardProps {
  title: string;
  items?: ListItem[];
  isLoading?: boolean;
}

export default function ListStatsCard({ title, items, isLoading }: ListStatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="min-h-[12rem]">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
            <span className="text-gray-500">Caricamento statistiche...</span>
          </div>
        ) : (
          <ul className="space-y-2">
            {items?.map((item, index) => (
              <li key={index} className="flex justify-between items-center">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-semibold">{item.value.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

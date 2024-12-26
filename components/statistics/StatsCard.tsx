// components/statistics/StatsCard.tsx
interface StatsCardProps {
    title: string;
    value: string | number;
}
  
export default function StatsCard({ title, value }: StatsCardProps) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
    );
}
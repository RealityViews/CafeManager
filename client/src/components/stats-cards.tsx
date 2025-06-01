import { Card, CardContent } from "@/components/ui/card";
import { useStats } from "@/hooks/use-reservations";
import { Utensils, Clock, Users, Calendar } from "lucide-react";

export function StatsCards() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="ml-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: "Свободных столов",
      value: stats?.availableTables || 0,
      icon: Utensils,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Забронировано",
      value: stats?.reservedTables || 0,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Занято",
      value: stats?.occupiedTables || 0,
      icon: Users,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Сегодня броней",
      value: stats?.todayReservations || 0,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                <item.icon className={`${item.color} text-xl`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{item.title}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

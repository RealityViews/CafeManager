import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHalls, type Hall } from "@/hooks/use-halls";
import { useTables } from "@/hooks/use-tables";
import { Building2 } from "lucide-react";

interface HallSelectorProps {
  selectedHallId: string;
  onHallSelect: (hallId: string) => void;
}

export function HallSelector({ selectedHallId, onHallSelect }: HallSelectorProps) {
  const { data: halls, isLoading } = useHalls();
  const { data: allTables } = useTables();

  const getHallStats = (hallId: string) => {
    if (!allTables) return { total: 0, available: 0, reserved: 0, occupied: 0 };
    
    const hallTables = allTables.filter(table => table.hallId === hallId);
    return {
      total: hallTables.length,
      available: hallTables.filter(t => t.status === "available").length,
      reserved: hallTables.filter(t => t.status === "reserved").length,
      occupied: hallTables.filter(t => t.status === "occupied").length,
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {halls?.map((hall) => {
            const stats = getHallStats(hall.id);
            const isSelected = selectedHallId === hall.id;
            
            return (
              <Button
                key={hall.id}
                variant={isSelected ? "default" : "outline"}
                className="w-full h-auto p-4 justify-start"
                onClick={() => onHallSelect(hall.id)}
              >
                <div className="flex items-center space-x-3 w-full">
                  <Building2 className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{hall.name}</div>
                    <div className="text-sm opacity-75">{hall.description}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {stats.total} столов
                      </Badge>
                      {stats.available > 0 && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {stats.available} свободно
                        </Badge>
                      )}
                      {stats.reserved > 0 && (
                        <Badge className="bg-amber-100 text-amber-800 text-xs">
                          {stats.reserved} забронировано
                        </Badge>
                      )}
                      {stats.occupied > 0 && (
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          {stats.occupied} занято
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReservations } from "@/hooks/use-reservations";
import { Calendar, Plus, BarChart3, Clock } from "lucide-react";
import type { TableWithReservations } from "@shared/schema";

interface SidebarProps {
  selectedTable: TableWithReservations | null;
  onNewReservation: () => void;
  onReserveTable: (table: TableWithReservations) => void;
}

export function Sidebar({ selectedTable, onNewReservation, onReserveTable }: SidebarProps) {
  const today = new Date().toISOString().split('T')[0];
  const { data: todayReservations } = useReservations(today);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Свободно</Badge>;
      case "reserved":
        return <Badge className="bg-amber-100 text-amber-800">Забронировано</Badge>;
      case "occupied":
        return <Badge className="bg-red-100 text-red-800">Занято</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            className="w-full" 
            onClick={onNewReservation}
          >
            <Plus className="h-4 w-4 mr-2" />
            Новая бронь
          </Button>
          <Button variant="outline" className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            Календарь
          </Button>
          <Button variant="outline" className="w-full">
            <BarChart3 className="h-4 w-4 mr-2" />
            Отчеты
          </Button>
        </CardContent>
      </Card>

      {/* Selected Table Info */}
      {selectedTable && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Стол №{selectedTable.number}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Статус:</span>
              {getStatusBadge(selectedTable.status)}
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Мест:</span>
              <span>{selectedTable.capacity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Форма:</span>
              <span className="capitalize">{selectedTable.shape}</span>
            </div>
            
            {selectedTable.currentReservation && (
              <div className="pt-3 border-t">
                <h4 className="font-medium mb-2">Текущая бронь:</h4>
                <div className="text-sm space-y-1">
                  <div>{selectedTable.currentReservation.customerName}</div>
                  <div className="text-gray-600">
                    {selectedTable.currentReservation.time} • {selectedTable.currentReservation.guests} {selectedTable.currentReservation.guests === 1 ? 'гость' : 'гостя'}
                  </div>
                </div>
              </div>
            )}
            
            {selectedTable.status === "available" && (
              <div className="pt-3 border-t">
                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => onReserveTable(selectedTable)}
                >
                  Забронировать
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Today's Reservations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Сегодняшние брони</CardTitle>
            <Button variant="ghost" size="sm">
              Все
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todayReservations?.slice(0, 5).map((reservation) => (
              <div
                key={reservation.id}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{reservation.customerName}</span>
                      <Badge variant="outline" className="text-xs">
                        Стол {reservation.tableId}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {reservation.time} • {reservation.guests} {reservation.guests === 1 ? 'гость' : reservation.guests <= 4 ? 'гостя' : 'гостей'}
                    </div>
                  </div>
                  <Badge 
                    className={
                      reservation.status === "active" 
                        ? "bg-amber-100 text-amber-800"
                        : "bg-green-100 text-green-800"
                    }
                  >
                    {reservation.status === "active" ? "Активная" : "Завершена"}
                  </Badge>
                </div>
              </div>
            ))}
            
            {!todayReservations?.length && (
              <div className="text-center text-gray-500 py-4">
                Нет броней на сегодня
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

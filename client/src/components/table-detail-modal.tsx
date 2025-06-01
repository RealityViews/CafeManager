import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useDeleteReservation } from "@/hooks/use-reservations";
import { useUpdateTableStatus } from "@/hooks/use-tables";
import { useToast } from "@/hooks/use-toast";
import type { TableWithReservations } from "@shared/schema";
import { Phone, Users, Clock, MessageSquare } from "lucide-react";

interface TableDetailModalProps {
  open: boolean;
  onClose: () => void;
  table: TableWithReservations | null;
  onEditReservation?: (reservationId: number) => void;
}

export function TableDetailModal({ open, onClose, table, onEditReservation }: TableDetailModalProps) {
  const deleteReservation = useDeleteReservation();
  const updateTableStatus = useUpdateTableStatus();
  const { toast } = useToast();

  if (!table) return null;

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

  const handleFreeTable = async () => {
    try {
      if (table.currentReservation) {
        await deleteReservation.mutateAsync(table.currentReservation.id);
      } else {
        await updateTableStatus.mutateAsync({ id: table.id, status: "available" });
      }
      
      toast({
        title: "Стол освобожден",
        description: `Стол №${table.number} теперь доступен для новых броней`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось освободить стол",
        variant: "destructive",
      });
    }
  };

  const handleMarkOccupied = async () => {
    try {
      await updateTableStatus.mutateAsync({ id: table.id, status: "occupied" });
      toast({
        title: "Статус обновлен",
        description: `Стол №${table.number} отмечен как занятый`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус стола",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Стол №{table.number}</DialogTitle>
            {getStatusBadge(table.status)}
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <span>{table.capacity} {table.capacity === 1 ? 'место' : table.capacity <= 4 ? 'места' : 'мест'}</span>
            <span>•</span>
            <span className="capitalize">{table.shape}</span>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Reservation */}
          {table.currentReservation && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Текущая бронь</h4>
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        {table.currentReservation.customerName}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center mt-1">
                        <Phone className="h-3 w-3 mr-1" />
                        {table.currentReservation.customerPhone}
                        <span className="mx-2">•</span>
                        <Users className="h-3 w-3 mr-1" />
                        {table.currentReservation.guests} {table.currentReservation.guests === 1 ? 'гость' : 'гостя'}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {table.currentReservation.time} ({table.currentReservation.duration} мин)
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditReservation?.(table.currentReservation!.id)}
                    >
                      Изменить
                    </Button>
                  </div>
                  {table.currentReservation.comment && (
                    <div className="text-sm text-gray-600 flex items-start">
                      <MessageSquare className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                      <span>"{table.currentReservation.comment}"</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Today's Schedule */}
          {table.todayReservations && table.todayReservations.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Расписание на сегодня</h4>
              <div className="space-y-2">
                {table.todayReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="text-sm font-medium">{reservation.time}</div>
                      <div className="text-xs text-gray-600">{reservation.customerName}</div>
                    </div>
                    <Badge 
                      className={
                        reservation.status === "active" 
                          ? "bg-amber-100 text-amber-800"
                          : reservation.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {reservation.status === "active" && "Активная"}
                      {reservation.status === "completed" && "Завершена"}
                      {reservation.status === "cancelled" && "Отменена"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            {table.status === "available" ? (
              <Button className="flex-1" onClick={onClose}>
                Закрыть
              </Button>
            ) : table.status === "reserved" ? (
              <>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleFreeTable}
                  disabled={deleteReservation.isPending}
                >
                  {deleteReservation.isPending ? "Освобождение..." : "Освободить стол"}
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleMarkOccupied}
                  disabled={updateTableStatus.isPending}
                >
                  Отметить занятым
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleFreeTable}
                disabled={updateTableStatus.isPending}
              >
                {updateTableStatus.isPending ? "Освобождение..." : "Освободить стол"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

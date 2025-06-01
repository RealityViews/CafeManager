import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSearchReservations, type ReservationWithTable } from "@/hooks/use-search";
import { Search, MapPin, Phone, Users, Clock } from "lucide-react";

interface ReservationSearchProps {
  onReservationSelect: (reservation: ReservationWithTable) => void;
}

export function ReservationSearch({ onReservationSelect }: ReservationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const { data: searchResults, isLoading } = useSearchReservations(activeQuery);

  const handleSearch = () => {
    setActiveQuery(searchQuery.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getHallName = (hallId: string) => {
    const halls: Record<string, string> = {
      white: "Белый зал",
      bar: "Бар зал", 
      vaulted: "Сводчатый зал",
      fourth: "Четвертый зал",
      banquet: "Банкетный зал"
    };
    return halls[hallId] || hallId;
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Поиск брони по имени или телефону..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <Button 
          onClick={handleSearch}
          disabled={!searchQuery.trim() || isLoading}
        >
          <Search className="h-4 w-4 mr-2" />
          {isLoading ? "Поиск..." : "Поиск"}
        </Button>
      </div>

      {activeQuery && (
        <div>
          <div className="text-sm text-gray-600 mb-3">
            Результаты поиска "{activeQuery}": {searchResults?.length || 0} найдено
          </div>
          
          {searchResults && searchResults.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {searchResults.map((reservation) => (
                <Card 
                  key={reservation.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onReservationSelect(reservation)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {reservation.customerName}
                          </span>
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
                        
                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{reservation.customerPhone}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{reservation.guests} {reservation.guests === 1 ? 'гость' : reservation.guests <= 4 ? 'гостя' : 'гостей'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{reservation.date} {reservation.time}</span>
                          </div>
                          {reservation.table && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>
                                Стол №{reservation.table.number} • {getHallName(reservation.table.hallId)}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {reservation.comment && (
                          <div className="mt-2 text-xs text-gray-500 italic">
                            "{reservation.comment}"
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        <Button variant="ghost" size="sm">
                          Показать
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeQuery && !isLoading ? (
            <div className="text-center text-gray-500 py-8">
              <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>Броней с именем или телефоном "{activeQuery}" не найдено</p>
              <p className="text-sm mt-2">Попробуйте изменить запрос или проверить правильность написания</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
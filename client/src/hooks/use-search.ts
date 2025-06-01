import { useQuery } from "@tanstack/react-query";
import type { Reservation, Table } from "@shared/schema";

export interface ReservationWithTable extends Reservation {
  table?: Table;
}

export function useSearchReservations(query: string) {
  return useQuery<ReservationWithTable[]>({
    queryKey: ["/api/reservations/search", query],
    queryFn: async () => {
      if (!query || query.trim() === "") {
        return [];
      }
      
      const response = await fetch(`/api/reservations/search?q=${encodeURIComponent(query)}`, { 
        credentials: "include" 
      });
      
      if (!response.ok) {
        throw new Error("Failed to search reservations");
      }
      
      return response.json();
    },
    enabled: query.trim().length > 0,
  });
}
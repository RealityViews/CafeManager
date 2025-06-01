import { cn } from "@/lib/utils";
import type { TableWithReservations } from "@shared/schema";

interface TableItemProps {
  table: TableWithReservations;
  isSelected: boolean;
  onSelect: (table: TableWithReservations) => void;
  onDoubleClick?: (table: TableWithReservations) => void;
}

export function TableItem({ table, isSelected, onSelect, onDoubleClick }: TableItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500 hover:bg-green-600";
      case "reserved":
        return "bg-amber-500 hover:bg-amber-600";
      case "occupied":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getTableSize = (capacity: number) => {
    if (capacity <= 2) return "w-12 h-12";
    if (capacity <= 4) return "w-16 h-16";
    if (capacity <= 6) return "w-20 h-16";
    return "w-24 h-20";
  };

  const getTableShape = (shape: string) => {
    switch (shape) {
      case "round":
        return "rounded-full";
      case "square":
        return "rounded-lg";
      case "rectangular":
        return "rounded-lg";
      default:
        return "rounded-lg";
    }
  };

  return (
    <div
      className="absolute cursor-pointer transition-transform hover:scale-105"
      style={{
        left: `${table.x}px`,
        top: `${table.y}px`,
      }}
      onClick={() => onSelect(table)}
      onDoubleClick={() => onDoubleClick?.(table)}
    >
      <div
        className={cn(
          "flex items-center justify-center text-white font-semibold shadow-lg transition-colors",
          getTableSize(table.capacity),
          getTableShape(table.shape),
          getStatusColor(table.status),
          isSelected && "ring-2 ring-blue-500 ring-offset-2"
        )}
      >
        <span className="text-sm">{table.number}</span>
      </div>
      <div className="text-xs text-center mt-1 text-gray-600">
        {table.capacity} {table.capacity === 1 ? "место" : table.capacity <= 4 ? "места" : "мест"}
      </div>
    </div>
  );
}

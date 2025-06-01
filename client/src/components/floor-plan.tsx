import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DraggableTable } from "./draggable-table";
import { TableEditor } from "./table-editor";
import { useTables, useUpdateTable } from "@/hooks/use-tables";
import { useToast } from "@/hooks/use-toast";
import type { TableWithReservations } from "@shared/schema";
import { Edit, Settings } from "lucide-react";

interface FloorPlanProps {
  onTableSelect: (table: TableWithReservations) => void;
  onTableDetails: (table: TableWithReservations) => void;
  onReserveTable: (table: TableWithReservations) => void;
  selectedTable: TableWithReservations | null;
  selectedHallId: string;
}

export function FloorPlan({ onTableSelect, onTableDetails, onReserveTable, selectedTable, selectedHallId }: FloorPlanProps) {
  const { data: tables, isLoading } = useTables(undefined, selectedHallId);
  const updateTable = useUpdateTable();
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTable, setEditingTable] = useState<TableWithReservations | null>(null);

  const floorPlanRef = useRef<HTMLDivElement>(null);

  const handleTableMove = useCallback(
    (table: TableWithReservations, x: number, y: number) => {
      updateTable.mutate(
        { id: table.id, updates: { x, y } },
        {
          onError: () => {
            toast({
              title: "Ошибка",
              description: "Не удалось переместить стол",
              variant: "destructive",
            });
          },
        }
      );
    },
    [updateTable, toast]
  );

  const handleTableResize = useCallback(
    (table: TableWithReservations, width: number, height: number) => {
      updateTable.mutate(
        { id: table.id, updates: { width, height } },
        {
          onError: () => {
            toast({
              title: "Ошибка",
              description: "Не удалось изменить размер стола",
              variant: "destructive",
            });
          },
        }
      );
    },
    [updateTable, toast]
  );



  const handleTableClick = (table: TableWithReservations) => {
    if (table.status === "available") {
      onReserveTable(table);
    } else {
      onTableSelect(table);
    }
  };

  const handleTableDoubleClick = (table: TableWithReservations) => {
    if (isEditMode) {
      setEditingTable(table);
      return;
    }
    onTableDetails(table);
  };

  if (isLoading) {
    return (
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>План зала</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>План зала</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Свободно</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-sm text-gray-600">Забронировано</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">Занято</span>
            </div>
            <Button
              variant={isEditMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setIsEditMode(!isEditMode);
                setEditingTable(null);
              }}
            >
              <Edit className="h-4 w-4 mr-1" />
              {isEditMode ? "Готово" : "Редактировать"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={floorPlanRef}
          className="relative bg-gray-50 rounded-lg h-96 overflow-hidden p-4"
          style={{
            backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'><defs><pattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'><path d='M 20 0 L 0 0 0 20' fill='none' stroke='%23E5E7EB' stroke-width='1'/></pattern></defs><rect width='100%' height='100%' fill='url(%23grid)'/></svg>")`,
          }}
        >
          {/* Kitchen Area */}
          <div className="absolute top-4 right-4 bg-gray-300 rounded-lg p-4 text-center">
            <div className="text-orange-500 text-xl mb-2">🔥</div>
            <div className="text-sm font-medium text-gray-700">Кухня</div>
          </div>

          {/* Bar Area */}
          <div className="absolute top-4 left-4 bg-gray-300 rounded-lg p-6 text-center">
            <div className="text-amber-600 text-xl mb-2">🍷</div>
            <div className="text-sm font-medium text-gray-700">Бар</div>
          </div>

          {/* Entrance */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-100 rounded-lg p-3 text-center">
            <div className="text-blue-600 text-lg">🚪</div>
            <div className="text-xs font-medium text-blue-600">Вход</div>
          </div>

          {/* Tables */}
          {tables?.map((table) => (
            <DraggableTable
              key={table.id}
              table={table}
              isSelected={selectedTable?.id === table.id}
              isEditMode={isEditMode}
              onSelect={handleTableClick}
              onDoubleClick={handleTableDoubleClick}
              onMove={handleTableMove}
              onResize={handleTableResize}
            />
          ))}

          {/* Table Editor */}
          {editingTable && (
            <TableEditor
              table={editingTable}
              onClose={() => setEditingTable(null)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

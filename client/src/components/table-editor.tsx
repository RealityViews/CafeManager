import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useUpdateTable } from "@/hooks/use-tables";
import { useToast } from "@/hooks/use-toast";
import type { TableWithReservations } from "@shared/schema";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Plus, Minus, Check, X } from "lucide-react";

interface TableEditorProps {
  table: TableWithReservations;
  onClose: () => void;
}

export function TableEditor({ table, onClose }: TableEditorProps) {
  const [position, setPosition] = useState({ x: table.x, y: table.y });
  const [capacity, setCapacity] = useState(table.capacity);
  const updateTable = useUpdateTable();
  const { toast } = useToast();

  const moveStep = 10; // pixels

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    setPosition(prev => {
      switch (direction) {
        case 'up':
          return { ...prev, y: Math.max(0, prev.y - moveStep) };
        case 'down':
          return { ...prev, y: prev.y + moveStep };
        case 'left':
          return { ...prev, x: Math.max(0, prev.x - moveStep) };
        case 'right':
          return { ...prev, x: prev.x + moveStep };
        default:
          return prev;
      }
    });
  };

  const handleCapacityChange = (delta: number) => {
    setCapacity(prev => Math.max(1, Math.min(20, prev + delta)));
  };

  const handleSave = async () => {
    try {
      await updateTable.mutateAsync({
        id: table.id,
        updates: {
          x: position.x,
          y: position.y,
          capacity
        }
      });
      
      toast({
        title: "Стол обновлен",
        description: `Стол №${table.number} успешно обновлен`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить стол",
        variant: "destructive",
      });
    }
  };

  const hasChanges = position.x !== table.x || position.y !== table.y || capacity !== table.capacity;

  return (
    <Card className="absolute top-4 right-4 w-80 bg-white shadow-lg border-2 border-blue-500 z-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Редактирование стола №{table.number}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Position Controls */}
        <div className="mb-6">
          <div className="text-sm font-medium mb-2">Позиция</div>
          <div className="grid grid-cols-3 gap-1 w-fit mx-auto">
            <div></div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMove('up')}
              className="w-10 h-10 p-0"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <div></div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMove('left')}
              className="w-10 h-10 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="w-10 h-10 flex items-center justify-center text-xs bg-gray-100 rounded">
              {position.x}, {position.y}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMove('right')}
              className="w-10 h-10 p-0"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            <div></div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMove('down')}
              className="w-10 h-10 p-0"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <div></div>
          </div>
        </div>

        {/* Capacity Controls */}
        <div className="mb-6">
          <div className="text-sm font-medium mb-2">Количество мест</div>
          <div className="flex items-center justify-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCapacityChange(-1)}
              disabled={capacity <= 1}
              className="w-10 h-10 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="w-16 h-10 flex items-center justify-center bg-gray-100 rounded text-lg font-semibold">
              {capacity}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCapacityChange(1)}
              disabled={capacity >= 20}
              className="w-10 h-10 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Manual Input */}
        <div className="mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">X:</label>
              <Input
                type="number"
                value={position.x}
                onChange={(e) => setPosition(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
                className="h-8"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Y:</label>
              <Input
                type="number"
                value={position.y}
                onChange={(e) => setPosition(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
                className="h-8"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Отмена
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={!hasChanges || updateTable.isPending}
          >
            <Check className="h-4 w-4 mr-1" />
            {updateTable.isPending ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>

        {hasChanges && (
          <div className="mt-3 text-xs text-amber-600 text-center">
            Есть несохраненные изменения
          </div>
        )}
      </CardContent>
    </Card>
  );
}
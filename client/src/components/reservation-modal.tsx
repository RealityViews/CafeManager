import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateReservation } from "@/hooks/use-reservations";
import { useTables } from "@/hooks/use-tables";
import { useToast } from "@/hooks/use-toast";
import { insertReservationSchema, type InsertReservation } from "@shared/schema";
import type { TableWithReservations } from "@shared/schema";
import { z } from "zod";
import { Clock } from "lucide-react";

const reservationFormSchema = insertReservationSchema.extend({
  date: z.string().min(1, "Дата обязательна"),
  time: z.string().min(1, "Время обязательно"),
});

interface ReservationModalProps {
  open: boolean;
  onClose: () => void;
  selectedTable?: TableWithReservations | null;
}

export function ReservationModal({ open, onClose, selectedTable }: ReservationModalProps) {
  const { data: tables } = useTables();
  const createReservation = useCreateReservation();
  const { toast } = useToast();
  const [hasTimeLimit, setHasTimeLimit] = useState(false);

  const availableTables = tables?.filter(table => table.status === "available") || [];

  const form = useForm<InsertReservation>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: {
      tableId: selectedTable?.id || 0,
      customerName: "",
      customerPhone: "",
      guests: 2,
      date: new Date().toISOString().split('T')[0],
      time: "",
      duration: 120,
      comment: "",
      status: "active",
      hasTimeLimit: false,
      startTime: "",
      endTime: "",
    },
  });

  const onSubmit = async (data: InsertReservation) => {
    try {
      const reservationData = {
        ...data,
        hasTimeLimit,
        startTime: hasTimeLimit ? data.startTime : null,
        endTime: hasTimeLimit ? data.endTime : null,
      };
      
      await createReservation.mutateAsync(reservationData);
      toast({
        title: "Бронь создана",
        description: `Стол №${tables?.find(t => t.id === data.tableId)?.number} успешно забронирован`,
      });
      form.reset();
      setHasTimeLimit(false);
      onClose();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать бронь. Проверьте данные и попробуйте снова.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Новая бронь</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя клиента</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите имя" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="customerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Телефон</FormLabel>
                  <FormControl>
                    <Input placeholder="+7 (999) 123-45-67" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Дата</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Время</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="guests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Гостей</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите количество" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'гость' : num <= 4 ? 'гостя' : 'гостей'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tableId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Стол</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите стол" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableTables.map((table) => (
                          <SelectItem key={table.id} value={table.id.toString()}>
                            Стол №{table.number} ({table.capacity} {table.capacity === 1 ? 'место' : table.capacity <= 4 ? 'места' : 'мест'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Time Limit Options */}
            <div className="space-y-4">
              <FormLabel>Ограничение времени</FormLabel>
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant={!hasTimeLimit ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setHasTimeLimit(false)}
                >
                  Без ограничения
                </Button>
                <Button
                  type="button"
                  variant={hasTimeLimit ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setHasTimeLimit(true)}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Ограничение
                </Button>
              </div>

              {hasTimeLimit && (
                <Card className="p-4 bg-amber-50 border-amber-200">
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-amber-800 mb-2">
                      Время пребывания
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">С</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">До</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="text-xs text-amber-700">
                      Гости должны освободить стол в указанное время
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Комментарий</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Особые пожелания или примечания" 
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Отмена
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={createReservation.isPending}
              >
                {createReservation.isPending ? "Создание..." : "Забронировать"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

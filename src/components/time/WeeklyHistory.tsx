import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTimeLog } from "@/context/TimeLogContext";
import { differenceInMinutes, eachDayOfInterval, format, parseISO, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { MoreHorizontal, Trash2, Edit2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import type { RegistroHorario } from "@/types/inventory";

export function WeeklyHistory() {
  const { logs, deleteLog, updateLog } = useTimeLog();
  const now = new Date();
  const days = eachDayOfInterval({
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 }),
  });

  const [editLog, setEditLog] = useState<RegistroHorario | null>(null);
  const [editTime, setEditTime] = useState("");

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este registro?")) {
      await deleteLog(id);
      toast.success("Registro eliminado");
    }
  };

  const handleEditOpen = (log: RegistroHorario) => {
    setEditLog(log);
    setEditTime(format(parseISO(log.created_at), "HH:mm"));
  };

  const handleEditSave = async () => {
    if (!editLog) return;
    try {
      const date = parseISO(editLog.created_at);
      const [hours, mins] = editTime.split(":");
      date.setHours(Number(hours), Number(mins));
      
      await updateLog(editLog.id, date.toISOString());
      toast.success("Hora actualizada correctamente");
      setEditLog(null);
    } catch (e) {
      toast.error("Error al actualizar la hora");
    }
  };

  return (
    <Card className="p-6 rounded-2xl border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800 transition-colors">
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4">Historial semanal</h2>
      <Table>
        <TableHeader>
          <TableRow className="dark:border-slate-800 border-slate-100">
            <TableHead className="font-semibold text-slate-600 dark:text-slate-400">Día</TableHead>
            <TableHead className="font-semibold text-slate-600 dark:text-slate-400">Tienda</TableHead>
            <TableHead className="font-semibold text-slate-600 dark:text-slate-400">Entrada</TableHead>
            <TableHead className="font-semibold text-slate-600 dark:text-slate-400">Salida</TableHead>
            <TableHead className="font-semibold text-slate-600 dark:text-slate-400">Horas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {days.map((day) => {
            const dayLogs = logs
              .filter((l) => isSameDay(parseISO(l.created_at), day))
              .sort((a, b) => a.created_at.localeCompare(b.created_at));
              
            const entrada = dayLogs.find((l) => l.tipo === "entrada");
            const salida = [...dayLogs].reverse().find((l) => l.tipo === "salida");
            
            const horas =
              entrada && salida
                ? (differenceInMinutes(parseISO(salida.created_at), parseISO(entrada.created_at)) / 60).toFixed(2)
                : "—";

            const storeName = entrada ? (entrada.tienda_id === 2 ? "Sur" : "Norte") 
                            : salida ? (salida.tienda_id === 2 ? "Sur" : "Norte") 
                            : "—";

            return (
              <TableRow key={day.toISOString()} className="border-t border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <TableCell className="py-4 font-medium capitalize dark:text-slate-200">
                  {format(day, "EEE d MMM", { locale: es })}
                </TableCell>
                <TableCell className="py-4 font-medium text-slate-500 dark:text-slate-400">
                  {storeName}
                </TableCell>
                <TableCell className="py-4 tabular-nums">
                  {entrada ? (
                    <div className="flex items-center gap-2 group">
                      <span className="dark:text-slate-300">{format(parseISO(entrada.created_at), "HH:mm")}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => handleEditOpen(entrada)}>
                            <Edit2 className="h-4 w-4 mr-2" /> Editar hora
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(entrada.id)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-600">—</span>
                  )}
                </TableCell>
                <TableCell className="py-4 tabular-nums">
                  {salida ? (
                    <div className="flex items-center gap-2 group">
                      <span className="dark:text-slate-300">{format(parseISO(salida.created_at), "HH:mm")}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => handleEditOpen(salida)}>
                            <Edit2 className="h-4 w-4 mr-2" /> Editar hora
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(salida.id)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-600">—</span>
                  )}
                </TableCell>
                <TableCell className="py-4 tabular-nums font-semibold dark:text-emerald-500">{horas}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={!!editLog} onOpenChange={(o) => !o && setEditLog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar {editLog?.tipo}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Hora del registro</Label>
              <Input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="h-12 text-lg" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditLog(null)}>Cancelar</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleEditSave}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

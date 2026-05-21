import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTimeLog } from "@/context/TimeLogContext";
import { differenceInMinutes, eachDayOfInterval, format, parseISO, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

export function WeeklyHistory() {
  const { logs } = useTimeLog();
  const now = new Date();
  const days = eachDayOfInterval({
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 }),
  });

  return (
    <Card className="p-6 rounded-2xl border-slate-200 bg-white shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Historial semanal</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold text-slate-600">Día</TableHead>
            <TableHead className="font-semibold text-slate-600">Entrada</TableHead>
            <TableHead className="font-semibold text-slate-600">Salida</TableHead>
            <TableHead className="font-semibold text-slate-600">Horas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {days.map((day) => {
            const dayLogs = logs
              .filter((l) => isSameDay(parseISO(l.timestamp), day))
              .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
            const entrada = dayLogs.find((l) => l.tipo === "entrada");
            const salida = [...dayLogs].reverse().find((l) => l.tipo === "salida");
            const horas =
              entrada && salida
                ? (differenceInMinutes(parseISO(salida.timestamp), parseISO(entrada.timestamp)) / 60).toFixed(2)
                : "—";
            return (
              <TableRow key={day.toISOString()} className="border-t border-slate-100">
                <TableCell className="py-4 font-medium capitalize">
                  {format(day, "EEE d MMM", { locale: es })}
                </TableCell>
                <TableCell className="py-4 tabular-nums">
                  {entrada ? format(parseISO(entrada.timestamp), "HH:mm") : <span className="text-slate-400">—</span>}
                </TableCell>
                <TableCell className="py-4 tabular-nums">
                  {salida ? format(parseISO(salida.timestamp), "HH:mm") : <span className="text-slate-400">—</span>}
                </TableCell>
                <TableCell className="py-4 tabular-nums font-semibold">{horas}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

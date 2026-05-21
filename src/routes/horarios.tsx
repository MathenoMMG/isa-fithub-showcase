import { createFileRoute } from "@tanstack/react-router";
import { ClockInOutCard } from "@/components/time/ClockInOutCard";
import { WeeklyHistory } from "@/components/time/WeeklyHistory";

export const Route = createFileRoute("/horarios")({
  head: () => ({
    meta: [
      { title: "Horarios · FitHub" },
      { name: "description", content: "Registro de entradas y salidas del turno." },
    ],
  }),
  component: HorariosPage,
});

function HorariosPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50 transition-colors">Registro de Horarios</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Marca tu entrada y salida del turno.</p>
      </div>
      <ClockInOutCard />
      <WeeklyHistory />
    </div>
  );
}

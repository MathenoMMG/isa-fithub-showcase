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
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Registro de Horarios</h2>
        <p className="text-slate-500 mt-1">Marca tu entrada y salida del turno.</p>
      </div>
      <ClockInOutCard />
      <WeeklyHistory />
    </div>
  );
}

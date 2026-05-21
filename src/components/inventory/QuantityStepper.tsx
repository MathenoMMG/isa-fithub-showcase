import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function QuantityStepper({ value, onIncrement, onDecrement }: Props) {
  return (
    <div className="inline-flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-11 w-11 rounded-full border-slate-300"
        onClick={onDecrement}
        aria-label="Disminuir cantidad"
      >
        <Minus className="h-5 w-5" />
      </Button>
      <span className="min-w-[2.5rem] text-center text-lg font-semibold tabular-nums">{value}</span>
      <Button
        type="button"
        size="icon"
        className="h-11 w-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
        onClick={onIncrement}
        aria-label="Aumentar cantidad"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}

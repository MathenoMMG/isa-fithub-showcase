import React, { useState, useMemo } from "react";
import { 
  Package, 
  Store, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileSpreadsheet, 
  Plus, 
  Minus, 
  Sparkles 
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface MockProduct {
  id: string;
  nombre: string;
  linea: string;
  sabor: string;
  tienda: "Sucursal Norte" | "Sucursal Centro";
  lote: string;
  diasRestantes: number;
  stock: number;
  estado: "ok" | "warning" | "expired";
}

const MOCK_DATA: MockProduct[] = [
  {
    id: "1",
    nombre: "BEBIDA HIDRATANTE BOTÁNICA 500ML",
    linea: "Bebidas Funcionales",
    sabor: "Cítricos & Jengibre",
    tienda: "Sucursal Norte",
    lote: "L-9042",
    diasRestantes: 45,
    stock: 28,
    estado: "ok",
  },
  {
    id: "2",
    nombre: "BARRA PROTEICA CRUNCH AVELLANA 60G",
    linea: "Snacks Saludables",
    sabor: "Avellana & Cacao",
    tienda: "Sucursal Norte",
    lote: "L-8831",
    diasRestantes: 14,
    stock: 12,
    estado: "warning",
  },
  {
    id: "3",
    nombre: "EXTRACTO COLD PRESSED DETOX 330ML",
    linea: "Bebidas Funcionales",
    sabor: "Manzana & Espinaca",
    tienda: "Sucursal Norte",
    lote: "L-7120",
    diasRestantes: 22,
    stock: 16,
    estado: "warning",
  },
  {
    id: "4",
    nombre: "MIX DE FRUTOS SECOS & SEMILLAS 150G",
    linea: "Granos & Semillas",
    sabor: "Tostado Suave",
    tienda: "Sucursal Centro",
    lote: "L-9400",
    diasRestantes: 60,
    stock: 35,
    estado: "ok",
  },
  {
    id: "5",
    nombre: "PROTEÍNA VEGANA ORGANIC VAINILLA 1KG",
    linea: "Nutrición & Suplementos",
    sabor: "Vainilla Bourbon",
    tienda: "Sucursal Centro",
    lote: "L-6021",
    diasRestantes: 5,
    stock: 7,
    estado: "warning",
  },
  {
    id: "6",
    nombre: "TORTITAS HORNEADAS DE ARROZ & QUINOA",
    linea: "Snacks Saludables",
    sabor: "Sal Marina",
    tienda: "Sucursal Centro",
    lote: "L-8104",
    diasRestantes: 52,
    stock: 40,
    estado: "ok",
  },
];

export function LandingInteractivePreview() {
  const [selectedTienda, setSelectedTienda] = useState<"Todas" | "Sucursal Norte" | "Sucursal Centro">("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [mockProducts, setMockProducts] = useState(MOCK_DATA);

  const filtered = useMemo(() => {
    return mockProducts.filter((p) => {
      const matchTienda = selectedTienda === "Todas" || p.tienda === selectedTienda;
      const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.linea.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTienda && matchSearch;
    });
  }, [mockProducts, selectedTienda, searchTerm]);

  const handleAdjustStock = (id: string, delta: number) => {
    setMockProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p))
    );
  };

  const totalStock = filtered.reduce((acc, curr) => acc + curr.stock, 0);
  const criticalCount = filtered.filter((p) => p.diasRestantes <= 30).length;

  return (
    <section id="vista-previa" className="py-16 md:py-24 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-300/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demostración Interactiva</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Experiencia fluida para el punto de venta
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            Interactúa con la interfaz simulada abajo. Prueba cambiar de sucursal, filtrar categorías o simular ventas de stock en tiempo real.
          </p>
        </div>

        {/* Mockup Container */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Top Bar of the Mockup */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-4">
            
            {/* Store Filter Pills */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-emerald-600" /> Sucursal:
              </span>
              {(["Todas", "Sucursal Norte", "Sucursal Centro"] as const).map((tienda) => (
                <button
                  key={tienda}
                  onClick={() => setSelectedTienda(tienda)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedTienda === tienda
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {tienda}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar artículo o línea..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

          </div>

          {/* Quick Metrics Inside Mockup */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 sm:p-6 bg-slate-50/40 dark:bg-slate-900/40 border-b border-slate-200/60 dark:border-slate-800/60">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{totalStock} uds</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Unidades Disponibles</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{criticalCount} lotes</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Lotes Próximos (&lt; 30d)</div>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">100% OK</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Telemetría y Registro</div>
              </div>
            </div>
          </div>

          {/* Interactive Mock Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Descripción del Artículo</th>
                  <th className="py-3.5 px-4">Punto de Venta</th>
                  <th className="py-3.5 px-4">Lote</th>
                  <th className="py-3.5 px-4">Semáforo de Caducidad</th>
                  <th className="py-3.5 px-6 text-center">Ajuste de Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/60 transition-colors">
                    
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.nombre}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 flex items-center gap-1.5">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{item.linea}</span>
                        <span>•</span>
                        <span>Variante: {item.sabor}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.tienda}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-slate-600 dark:text-slate-300">
                      {item.lote}
                    </td>

                    <td className="py-4 px-4">
                      {item.diasRestantes <= 15 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                          <XCircle className="w-3.5 h-3.5" />
                          {item.diasRestantes} días restantes
                        </span>
                      ) : item.diasRestantes <= 30 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {item.diasRestantes} días (Priorizar)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {item.diasRestantes} días (Óptimo)
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleAdjustStock(item.id, -1)}
                          className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold transition-all active:scale-90 cursor-pointer"
                          title="Descontar 1 unidad"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          {item.stock}
                        </span>
                        <button
                          onClick={() => handleAdjustStock(item.id, 1)}
                          className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold transition-all active:scale-90 cursor-pointer"
                          title="Añadir 1 unidad"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer Note */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400">
            🔒 Entorno de demostración ilustrativo con datos simulados.
          </div>

        </div>

      </div>
    </section>
  );
}
